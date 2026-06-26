// Types purs du domaine « météo ». Aucune dépendance entrante vers d'autres couches.

/** Météo d'une heure pleine. */
export interface HourWeather {
  /** Heure 0–23. */
  hour: number;
  temperatureC: number;
  /** Probabilité de précipitation 0–100. */
  precipitationProbability: number;
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

/** Niveau de risque de précipitation pour la mise en avant visuelle. */
export type PrecipitationLevel = "low" | "moderate" | "high";

/** Données météo d'un créneau, formatées et prêtes à afficher. */
export interface SlotWeatherViewModel {
  /** Température arrondie, ex. « 21° ». */
  temperatureLabel: string;
  /** Risque de pluie, ex. « 30 % ». */
  precipitationLabel: string;
  /** Probabilité brute 0–100 (utile pour le tri/seuils côté UI si besoin). */
  precipitationProbability: number;
  precipitationLevel: PrecipitationLevel;
  /** Libellé d'accessibilité complet (fr). */
  a11yLabel: string;
}
