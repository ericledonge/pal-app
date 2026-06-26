import { toDateKey, toMinutes } from "@/lib/date.utils";

import { PRECIPITATION_SEVERITY_THRESHOLDS, WIND_SEVERITY_THRESHOLDS } from "./weather.constants";
import type {
  ForecastDay,
  HourWeather,
  SlotWeatherViewModel,
  WeatherForecast,
  WeatherSeverity,
} from "./weather.types";

// Logique pure : validation de la réponse Open-Meteo par type guard (PAS de Zod), construction
// d'une structure de lookup, puis formatage. Aucun import react / react-native / @tanstack/react-query.

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: (number | null)[];
  apparent_temperature: (number | null)[];
  precipitation_probability: (number | null)[];
  precipitation: (number | null)[];
  wind_speed_10m: (number | null)[];
  wind_gusts_10m: (number | null)[];
}

interface OpenMeteoForecast {
  hourly: OpenMeteoHourly;
}

const isNullableNumberArray = (value: unknown): value is (number | null)[] =>
  Array.isArray(value) && value.every((item) => item === null || typeof item === "number");

/** La réponse a-t-elle la forme attendue d'Open-Meteo (tableaux horaires cohérents) ? */
export const isOpenMeteoForecast = (raw: unknown): raw is OpenMeteoForecast => {
  if (typeof raw !== "object" || raw === null) {
    return false;
  }
  const hourly = (raw as Record<string, unknown>).hourly;
  if (typeof hourly !== "object" || hourly === null) {
    return false;
  }
  const {
    time,
    temperature_2m,
    apparent_temperature,
    precipitation_probability,
    precipitation,
    wind_speed_10m,
    wind_gusts_10m,
  } = hourly as Record<string, unknown>;
  return (
    Array.isArray(time) &&
    time.length > 0 &&
    time.every((item) => typeof item === "string") &&
    isNullableNumberArray(temperature_2m) &&
    isNullableNumberArray(apparent_temperature) &&
    isNullableNumberArray(precipitation_probability) &&
    isNullableNumberArray(precipitation) &&
    isNullableNumberArray(wind_speed_10m) &&
    isNullableNumberArray(wind_gusts_10m) &&
    time.length === temperature_2m.length &&
    time.length === apparent_temperature.length &&
    time.length === precipitation_probability.length &&
    time.length === precipitation.length &&
    time.length === wind_speed_10m.length &&
    time.length === wind_gusts_10m.length
  );
};

/** Extrait la date (YYYY-MM-DD) et l'heure (0-23) d'un timestamp « YYYY-MM-DDTHH:00 ». */
const parseIsoHour = (iso: string): { date: string; hour: number } | null => {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):/.exec(iso);
  if (!match) {
    return null;
  }
  return { date: match[1], hour: Number(match[2]) };
};

/**
 * Construit la structure de lookup depuis la réponse brute, **étiquetée par date réelle**
 * (chaque jour porte son « YYYY-MM-DD »). Fonction pure (aucune horloge). Les entrées incomplètes
 * (température ou probabilité `null`) sont ignorées. Renvoie `null` si la forme est invalide ou
 * si aucune heure exploitable n'a pu être retenue.
 */
export const createWeatherForecast = (raw: unknown): WeatherForecast | null => {
  if (!isOpenMeteoForecast(raw)) {
    return null;
  }
  const {
    time,
    temperature_2m,
    apparent_temperature,
    precipitation_probability,
    precipitation,
    wind_speed_10m,
    wind_gusts_10m,
  } = raw.hourly;
  // Map clé=date → heures : préserve l'ordre d'apparition (aujourd'hui puis demain au fetch).
  const byDate = new Map<string, Record<number, HourWeather>>();

  time.forEach((iso, index) => {
    const parsed = parseIsoHour(iso);
    if (!parsed) {
      return;
    }
    const temperatureC = temperature_2m[index];
    const apparentTemperatureC = apparent_temperature[index];
    const precipitationProbability = precipitation_probability[index];
    if (
      typeof temperatureC !== "number" ||
      typeof apparentTemperatureC !== "number" ||
      typeof precipitationProbability !== "number"
    ) {
      return;
    }
    // Cumul de pluie et vent : `null` (champ absent pour l'heure) traité comme 0, pour ne pas
    // écarter l'entrée — la température reste affichable même sans ces données.
    const rawMm = precipitation[index];
    const precipitationMm = typeof rawMm === "number" ? rawMm : 0;
    const rawWindSpeed = wind_speed_10m[index];
    const windSpeedKmh = typeof rawWindSpeed === "number" ? rawWindSpeed : 0;
    const rawWindGust = wind_gusts_10m[index];
    const windGustKmh = typeof rawWindGust === "number" ? rawWindGust : 0;
    const hours = byDate.get(parsed.date) ?? {};
    hours[parsed.hour] = {
      hour: parsed.hour,
      temperatureC,
      apparentTemperatureC,
      precipitationProbability,
      precipitationMm,
      windSpeedKmh,
      windGustKmh,
    };
    byDate.set(parsed.date, hours);
  });

  if (byDate.size === 0) {
    return null;
  }
  const days = [...byDate.entries()].map(([date, hours]) => ({ date, hours }));
  return { days };
};

/** Sévérité du risque de pluie : « entre 50 et 75 % » → warning, « > 75 % » → alert. */
const toPrecipitationSeverity = (probability: number): WeatherSeverity => {
  if (probability > PRECIPITATION_SEVERITY_THRESHOLDS.alert) {
    return "alert";
  }
  if (probability >= PRECIPITATION_SEVERITY_THRESHOLDS.warning) {
    return "warning";
  }
  return "normal";
};

/** Sévérité du vent soutenu : « au-dessus de 10 km/h » → warning, « au-dessus de 18 » → alert. */
const toWindSeverity = (windSpeedKmh: number): WeatherSeverity => {
  if (windSpeedKmh > WIND_SEVERITY_THRESHOLDS.alert) {
    return "alert";
  }
  if (windSpeedKmh > WIND_SEVERITY_THRESHOLDS.warning) {
    return "warning";
  }
  return "normal";
};

/**
 * View model météo d'un créneau : cherche la météo de l'heure de début pour la **date réelle**
 * du jour visé (aujourd'hui ou demain, calculées depuis `now`). La sélection par date — plutôt
 * que par index d'ordre — garde l'affichage correct même si une prévision en cache traverse
 * minuit (au pire, pas de pastille plutôt que la météo de la veille). `now` est injecté (défaut :
 * horloge locale), comme `nowMinutes`, pour rester testable.
 * Renvoie `null` si l'heure n'est pas exploitable ou est absente de la prévision (-> pas de pastille).
 */
export const createSlotWeatherViewModel = (
  forecast: WeatherForecast,
  day: ForecastDay,
  heure: string,
  now: Date = new Date(),
): SlotWeatherViewModel | null => {
  const minutes = toMinutes(heure);
  if (minutes === null) {
    return null;
  }
  const hour = Math.floor(minutes / 60);
  // Date locale visée : aujourd'hui, ou demain (construction par composantes → sûre vis-à-vis du DST).
  const targetDate =
    day === "today"
      ? toDateKey(now)
      : toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  const entry = forecast.days.find((dayForecast) => dayForecast.date === targetDate)?.hours[hour];
  if (!entry) {
    return null;
  }
  const apparentTemperatureLabel = `${Math.round(entry.apparentTemperatureC)}°`;
  const probability = entry.precipitationProbability;
  const precipitationLabel = `${probability} %`;
  // Cumul arrondi au dixième de mm (virgule décimale fr) ; null s'il est nul (pas de pluie).
  // Cumul arrondi au dixième de mm (virgule décimale fr), toujours présent (« 0 mm » par temps sec).
  const precipitationMm = Math.round(entry.precipitationMm * 10) / 10;
  const precipitationMmLabel = `${String(precipitationMm).replace(".", ",")} mm`;
  // Vent : vitesse soutenue + rafale entre parenthèses (km/h, arrondies) — même logique que la
  // pluie, rafale toujours affichée.
  const windSpeed = Math.round(entry.windSpeedKmh);
  const windGust = Math.round(entry.windGustKmh);
  const windLabel = `${windSpeed} km/h (rafales ${windGust} km/h)`;
  return {
    apparentTemperatureLabel,
    precipitationLabel,
    precipitationProbability: probability,
    precipitationSeverity: toPrecipitationSeverity(probability),
    precipitationMmLabel,
    windLabel,
    // Sévérité calculée sur la vitesse arrondie affichée (et non les rafales).
    windSeverity: toWindSeverity(windSpeed),
    a11yLabel: `Météo : ${apparentTemperatureLabel} ressenti, ${probability} % de risque de pluie, ${precipitationMmLabel} prévus, vent ${windSpeed} km/h, rafales ${windGust} km/h`,
  };
};
