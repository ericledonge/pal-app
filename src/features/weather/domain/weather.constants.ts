import type { PrecipitationLevel } from "./weather.types";

// Localisation du club (Lévis, QC) et endpoint Open-Meteo — données PUBLIQUES, aucune clé ni
// secret (cohérent avec « pas de backend »). La prévision couvre exactement les deux jours
// consultables par l'app (aujourd'hui + demain), en heure locale (timezone America/Toronto).
export const WEATHER_LOCATION = {
  latitude: 46.79,
  longitude: -71.18,
  timezone: "America/Toronto",
} as const;

// Construction manuelle de la query string (encodeURIComponent), comme l'adapter sessions :
// on évite URLSearchParams, dont le polyfill React Native est historiquement incomplet.
const FORECAST_PARAMS: Record<string, string> = {
  latitude: String(WEATHER_LOCATION.latitude),
  longitude: String(WEATHER_LOCATION.longitude),
  hourly: "temperature_2m,precipitation_probability",
  timezone: WEATHER_LOCATION.timezone,
  forecast_days: "2",
};

export const FORECAST_URL = `https://api.open-meteo.com/v1/forecast?${Object.entries(
  FORECAST_PARAMS,
)
  .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  .join("&")}`;

// Seuils du risque de pluie (% de probabilité) pilotant la mise en avant visuelle de la pastille.
export const PRECIPITATION_THRESHOLDS: Record<Exclude<PrecipitationLevel, "low">, number> = {
  moderate: 30,
  high: 60,
};
