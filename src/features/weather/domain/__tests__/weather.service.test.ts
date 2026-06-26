import {
  createSlotWeatherViewModel,
  createWeatherForecast,
  isOpenMeteoForecast,
} from "../weather.service";
import type { WeatherForecast } from "../weather.types";

// Builder d'une réponse Open-Meteo brute (pattern builder : défauts + overrides).
interface RawHourly {
  time?: string[];
  temperature_2m?: (number | null)[];
  apparent_temperature?: (number | null)[];
  precipitation_probability?: (number | null)[];
  precipitation?: (number | null)[];
  wind_speed_10m?: (number | null)[];
  wind_gusts_10m?: (number | null)[];
}
const aRawForecast = (overrides?: RawHourly) => {
  const time = overrides?.time ?? ["2026-06-25T18:00", "2026-06-25T19:00", "2026-06-26T09:00"];
  const temperature_2m = overrides?.temperature_2m ?? [21.4, 20.1, 14.8];
  return {
    latitude: 46.79,
    longitude: -71.18,
    timezone: "America/Toronto",
    hourly: {
      time,
      temperature_2m,
      // Par défaut, le ressenti suit la température réelle, et pluie/vent sont nuls (longueurs
      // alignées sur `time` quel que soit l'override).
      apparent_temperature: overrides?.apparent_temperature ?? temperature_2m,
      precipitation_probability: overrides?.precipitation_probability ?? [30, 65, 5],
      precipitation: overrides?.precipitation ?? time.map(() => 0),
      wind_speed_10m: overrides?.wind_speed_10m ?? time.map(() => 0),
      wind_gusts_10m: overrides?.wind_gusts_10m ?? time.map(() => 0),
    },
  };
};

// Horloge fixe : 25 juin 2026 (= 1re date du builder). « today » = 2026-06-25, « tomorrow » = 2026-06-26.
const NOW = new Date(2026, 5, 25, 12, 0, 0);

describe("isOpenMeteoForecast", () => {
  it("accepte une réponse bien formée", () => {
    expect(isOpenMeteoForecast(aRawForecast())).toBe(true);
  });

  it.each([
    ["null", null],
    ["primitif", "oops"],
    ["sans hourly", { latitude: 46 }],
    [
      "tableaux vides",
      {
        hourly: { time: [], temperature_2m: [], precipitation_probability: [] },
      },
    ],
    [
      "time non tableau",
      {
        hourly: {
          time: "x",
          temperature_2m: [1],
          precipitation_probability: [1],
        },
      },
    ],
    [
      "température non numérique",
      {
        hourly: {
          time: ["t"],
          temperature_2m: ["x"],
          precipitation_probability: [1],
        },
      },
    ],
    [
      "longueurs incohérentes",
      {
        hourly: {
          time: ["a", "b"],
          temperature_2m: [1],
          precipitation_probability: [1, 2],
        },
      },
    ],
  ])("rejette une réponse invalide (%s)", (_label, raw) => {
    expect(isOpenMeteoForecast(raw)).toBe(false);
  });
});

describe("createWeatherForecast", () => {
  it("étiquette chaque jour par sa date et indexe les heures", () => {
    const forecast = createWeatherForecast(aRawForecast());
    expect(forecast?.days[0].date).toBe("2026-06-25");
    expect(forecast?.days[0].hours[18]).toEqual({
      hour: 18,
      temperatureC: 21.4,
      apparentTemperatureC: 21.4,
      precipitationProbability: 30,
      precipitationMm: 0,
      windSpeedKmh: 0,
      windGustKmh: 0,
    });
    expect(forecast?.days[0].hours[19]?.precipitationProbability).toBe(65);
    expect(forecast?.days[1].date).toBe("2026-06-26");
    expect(forecast?.days[1].hours[9]).toEqual({
      hour: 9,
      temperatureC: 14.8,
      apparentTemperatureC: 14.8,
      precipitationProbability: 5,
      precipitationMm: 0,
      windSpeedKmh: 0,
      windGustKmh: 0,
    });
  });

  it("préserve l'ordre des dates et n'écrase pas les jours suivants (3 dates distinctes)", () => {
    const forecast = createWeatherForecast(
      aRawForecast({
        time: ["2026-06-25T08:00", "2026-06-26T08:00", "2026-06-27T08:00"],
        temperature_2m: [10, 20, 30],
        precipitation_probability: [10, 20, 30],
      }),
    );
    expect(forecast?.days.map((day) => day.date)).toEqual([
      "2026-06-25",
      "2026-06-26",
      "2026-06-27",
    ]);
    expect(forecast?.days[1].hours[8]?.temperatureC).toBe(20);
  });

  it("ignore les entrées incomplètes (température ou probabilité null)", () => {
    const forecast = createWeatherForecast(
      aRawForecast({
        time: ["2026-06-25T18:00", "2026-06-25T19:00"],
        temperature_2m: [21.4, null],
        precipitation_probability: [30, 40],
      }),
    );
    expect(forecast?.days[0].hours[18]).toBeDefined();
    expect(forecast?.days[0].hours[19]).toBeUndefined();
  });

  it("renvoie null pour une réponse invalide ou vide", () => {
    expect(createWeatherForecast({ nope: true })).toBeNull();
    expect(
      createWeatherForecast(
        aRawForecast({
          time: [],
          temperature_2m: [],
          precipitation_probability: [],
        }),
      ),
    ).toBeNull();
  });
});

describe("createSlotWeatherViewModel", () => {
  const forecast = createWeatherForecast(aRawForecast()) as WeatherForecast;

  it("formate la météo de l'heure de début (aujourd'hui)", () => {
    const vm = createSlotWeatherViewModel(forecast, "today", "18:00", NOW);
    expect(vm).toEqual({
      apparentTemperatureLabel: "21°",
      precipitationLabel: "30 %",
      precipitationProbability: 30,
      precipitationSeverity: "normal",
      precipitationMmLabel: "0 mm",
      windLabel: "0 km/h (rafales 0 km/h)",
      windSeverity: "normal",
      a11yLabel:
        "Météo : 21° ressenti, 30 % de risque de pluie, 0 mm prévus, vent 0 km/h, rafales 0 km/h",
    });
  });

  it("expose le ressenti, le cumul de pluie et le vent (avec rafales) quand il pleut et vente", () => {
    const rainy = createWeatherForecast(
      aRawForecast({
        time: ["2026-06-25T18:00"],
        temperature_2m: [20],
        apparent_temperature: [16.6],
        precipitation_probability: [80],
        precipitation: [1.25],
        wind_speed_10m: [5.2],
        wind_gusts_10m: [14.6],
      }),
    ) as WeatherForecast;
    const vm = createSlotWeatherViewModel(rainy, "today", "18:00", NOW);
    expect(vm?.apparentTemperatureLabel).toBe("17°");
    expect(vm?.precipitationMmLabel).toBe("1,3 mm");
    expect(vm?.windLabel).toBe("5 km/h (rafales 15 km/h)");
    // Pluie à 80 % → alert ; vent soutenu à 5 km/h → normal (les rafales ne comptent pas).
    expect(vm?.precipitationSeverity).toBe("alert");
    expect(vm?.windSeverity).toBe("normal");
    expect(vm?.a11yLabel).toBe(
      "Météo : 17° ressenti, 80 % de risque de pluie, 1,3 mm prévus, vent 5 km/h, rafales 15 km/h",
    );
  });

  it("résout le bon jour pour « demain »", () => {
    const vm = createSlotWeatherViewModel(forecast, "tomorrow", "09:00", NOW);
    expect(vm?.apparentTemperatureLabel).toBe("15°");
    expect(vm?.precipitationSeverity).toBe("normal");
  });

  it("sélectionne par date réelle : une prévision périmée (fetch la veille) n'affiche pas la météo d'hier", () => {
    // Prévision récoltée le 24 : days[0] = 24 (hier), days[1] = 25 (aujourd'hui réel).
    const stale = createWeatherForecast(
      aRawForecast({
        time: ["2026-06-24T18:00", "2026-06-25T18:00"],
        temperature_2m: [5, 22],
        precipitation_probability: [90, 10],
      }),
    ) as WeatherForecast;
    // « today » (NOW = 25) doit pointer days[1] = 25 (22°, 10 %), PAS days[0] = 24 (5°, 90 %).
    const today = createSlotWeatherViewModel(stale, "today", "18:00", NOW);
    expect(today?.apparentTemperatureLabel).toBe("22°");
    expect(today?.precipitationProbability).toBe(10);
    // « tomorrow » (26) est absent de la prévision périmée → pas de pastille.
    expect(createSlotWeatherViewModel(stale, "tomorrow", "18:00", NOW)).toBeNull();
  });

  it("renvoie null si l'heure est absente de la prévision", () => {
    expect(createSlotWeatherViewModel(forecast, "today", "06:00", NOW)).toBeNull();
  });

  it("renvoie null si l'heure n'est pas exploitable", () => {
    expect(createSlotWeatherViewModel(forecast, "today", "", NOW)).toBeNull();
  });

  it("arrondit les températures négatives", () => {
    const cold = createWeatherForecast(
      aRawForecast({
        time: ["2026-06-25T18:00"],
        temperature_2m: [-3.6],
        precipitation_probability: [10],
      }),
    ) as WeatherForecast;
    expect(createSlotWeatherViewModel(cold, "today", "18:00", NOW)?.apparentTemperatureLabel).toBe(
      "-4°",
    );
  });

  it.each([
    [49, "normal"],
    [50, "warning"],
    [75, "warning"],
    [76, "alert"],
  ])("classe le risque de pluie %i%% comme %s", (probability, expected) => {
    const f = createWeatherForecast(
      aRawForecast({
        time: ["2026-06-25T18:00"],
        temperature_2m: [20],
        precipitation_probability: [probability],
      }),
    ) as WeatherForecast;
    expect(createSlotWeatherViewModel(f, "today", "18:00", NOW)?.precipitationSeverity).toBe(
      expected,
    );
  });

  it.each([
    [10, "normal"],
    [11, "warning"],
    [18, "warning"],
    [19, "alert"],
  ])("classe le vent soutenu %i km/h comme %s", (windSpeed, expected) => {
    const f = createWeatherForecast(
      aRawForecast({
        time: ["2026-06-25T18:00"],
        temperature_2m: [20],
        precipitation_probability: [10],
        wind_speed_10m: [windSpeed],
      }),
    ) as WeatherForecast;
    expect(createSlotWeatherViewModel(f, "today", "18:00", NOW)?.windSeverity).toBe(expected);
  });
});
