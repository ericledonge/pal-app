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
  hourly:
    "temperature_2m,apparent_temperature,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m",
  timezone: WEATHER_LOCATION.timezone,
  forecast_days: "2",
};

export const FORECAST_URL = `https://api.open-meteo.com/v1/forecast?${Object.entries(
  FORECAST_PARAMS,
)
  .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
  .join("&")}`;

// Seuils de sévérité pilotant le code couleur des cartes de créneaux.
//
// Pluie (probabilité, %) : « entre 50 et 75 % » → orange (warning, borne basse incluse),
// « > 75 % » → rouge (alert).
export const PRECIPITATION_SEVERITY_THRESHOLDS = {
  /** warning dès `probability >= warning`. */
  warning: 50,
  /** alert dès `probability > alert`. */
  alert: 75,
} as const;

// Vent SOUTENU (km/h, hors rafales) : « au-dessus de 10 » → orange, « au-dessus de 18 » → rouge.
// Bornes strictement supérieures (« au-dessus de »), appliquées à la vitesse arrondie affichée.
export const WIND_SEVERITY_THRESHOLDS = {
  /** warning dès `windSpeedKmh > warning`. */
  warning: 10,
  /** alert dès `windSpeedKmh > alert`. */
  alert: 18,
} as const;
