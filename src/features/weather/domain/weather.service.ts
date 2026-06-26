import { toDateKey, toMinutes } from "@/lib/date.utils";

import { PRECIPITATION_THRESHOLDS } from "./weather.constants";
import type {
  ForecastDay,
  HourWeather,
  PrecipitationLevel,
  SlotWeatherViewModel,
  WeatherForecast,
} from "./weather.types";

// Logique pure : validation de la réponse Open-Meteo par type guard (PAS de Zod), construction
// d'une structure de lookup, puis formatage. Aucun import react / react-native / @tanstack/react-query.

interface OpenMeteoHourly {
  time: string[];
  temperature_2m: (number | null)[];
  precipitation_probability: (number | null)[];
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
  const { time, temperature_2m, precipitation_probability } = hourly as Record<string, unknown>;
  return (
    Array.isArray(time) &&
    time.length > 0 &&
    time.every((item) => typeof item === "string") &&
    isNullableNumberArray(temperature_2m) &&
    isNullableNumberArray(precipitation_probability) &&
    time.length === temperature_2m.length &&
    time.length === precipitation_probability.length
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
  const { time, temperature_2m, precipitation_probability } = raw.hourly;
  // Map clé=date → heures : préserve l'ordre d'apparition (aujourd'hui puis demain au fetch).
  const byDate = new Map<string, Record<number, HourWeather>>();

  time.forEach((iso, index) => {
    const parsed = parseIsoHour(iso);
    if (!parsed) {
      return;
    }
    const temperatureC = temperature_2m[index];
    const precipitationProbability = precipitation_probability[index];
    if (typeof temperatureC !== "number" || typeof precipitationProbability !== "number") {
      return;
    }
    const hours = byDate.get(parsed.date) ?? {};
    hours[parsed.hour] = { hour: parsed.hour, temperatureC, precipitationProbability };
    byDate.set(parsed.date, hours);
  });

  if (byDate.size === 0) {
    return null;
  }
  const days = [...byDate.entries()].map(([date, hours]) => ({ date, hours }));
  return { days };
};

const toPrecipitationLevel = (probability: number): PrecipitationLevel => {
  if (probability >= PRECIPITATION_THRESHOLDS.high) {
    return "high";
  }
  if (probability >= PRECIPITATION_THRESHOLDS.moderate) {
    return "moderate";
  }
  return "low";
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
  const temperatureLabel = `${Math.round(entry.temperatureC)}°`;
  const probability = entry.precipitationProbability;
  const precipitationLabel = `${probability} %`;
  return {
    temperatureLabel,
    precipitationLabel,
    precipitationProbability: probability,
    precipitationLevel: toPrecipitationLevel(probability),
    a11yLabel: `Météo : ${temperatureLabel}, ${probability} % de risque de pluie`,
  };
};
