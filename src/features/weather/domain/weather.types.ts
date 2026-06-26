// Types purs du domaine « météo ». Aucune dépendance entrante vers d'autres couches.

/** Météo d'une heure pleine. */
export interface HourWeather {
  /** Heure 0–23. */
  hour: number;
  temperatureC: number;
  /** Température ressentie (apparent temperature). */
  apparentTemperatureC: number;
  /** Probabilité de précipitation 0–100. */
  precipitationProbability: number;
  /** Cumul de précipitation prévu pour l'heure, en mm. */
  precipitationMm: number;
  /** Vitesse du vent, en km/h. */
  windSpeedKmh: number;
  /** Rafales de vent, en km/h. */
  windGustKmh: number;
}

/** Météo d'un jour : sa date locale et le dictionnaire heure (0–23) → météo. */
export interface DayForecast {
  /** Date locale couverte, « YYYY-MM-DD ». */
  date: string;
  hours: Record<number, HourWeather>;
}

/**
 * Prévision prête au lookup : la liste des jours couverts, chacun étiqueté par sa date réelle.
 * La sélection « aujourd'hui / demain » se fait par **date réelle** (et non par index d'ordre),
 * pour rester correcte même si une prévision en cache traverse minuit.
 */
export interface WeatherForecast {
  days: DayForecast[];
}

/** Jour de prévision (structurellement compatible avec `Day` de la feature sessions). */
export type ForecastDay = "today" | "tomorrow";

/**
 * Sévérité d'une condition météo, pilotant le code couleur de la carte de créneau :
 * `normal` (couleur sourde par défaut), `warning` (orange) et `alert` (rouge). Les seuils
 * — distincts pour la pluie et le vent — vivent dans `weather.constants.ts`.
 */
export type WeatherSeverity = "normal" | "warning" | "alert";

/** Données météo d'un créneau, formatées et prêtes à afficher. */
export interface SlotWeatherViewModel {
  /** Température ressentie arrondie, ex. « 15° ». */
  apparentTemperatureLabel: string;
  /** Risque de pluie, ex. « 52 % ». */
  precipitationLabel: string;
  /** Probabilité brute 0–100 (utile pour le tri/seuils côté UI si besoin). */
  precipitationProbability: number;
  /** Sévérité du risque de pluie (code couleur). */
  precipitationSeverity: WeatherSeverity;
  /** Cumul de pluie prévu, toujours présent, ex. « 1,2 mm » ou « 0 mm ». */
  precipitationMmLabel: string;
  /** Vent prêt à afficher, ex. « 5 km/h · rafales à 15 km/h » (rafales omises si ≤ vitesse). */
  windLabel: string;
  /** Sévérité du vent **soutenu** (code couleur) — calculée sur la vitesse, pas les rafales. */
  windSeverity: WeatherSeverity;
  /** Libellé d'accessibilité complet (fr). */
  a11yLabel: string;
}
