import { init, track } from "@amplitude/analytics-react-native";

// Analytics produit (Amplitude). Actif seulement en prod avec une clé fournie via
// EXPO_PUBLIC_AMPLITUDE_KEY ; en dev, aucun envoi. Importé directement (pas de DI).
const KEY = process.env.EXPO_PUBLIC_AMPLITUDE_KEY;
const ENABLED = !__DEV__ && Boolean(KEY);

// Taxonomie d'événements centralisée : typer `name` empêche les coquilles et documente la liste
// exhaustive de ce qu'on mesure. Ajouter une entrée ici avant d'instrumenter un nouvel écran.
export type AnalyticsEvent =
  | "screen_viewed" // vue d'écran (changement de route Expo Router) — { screen }
  | "onboarding_completed" // fin de l'onboarding — { level }
  | "level_changed" // changement de niveau depuis le profil — { level }
  | "matrix_generated" // génération d'une matrice de jeu — { joueurs, terrains }
  | "timer_started" // démarrage du minuteur de match
  | "feedback_submitted" // envoi réussi d'un feedback — { category }
  | "donation_opened"; // ouverture d'un moyen de don — { method }

export const initAnalytics = (): void => {
  if (ENABLED && KEY) {
    init(KEY);
  }
};

export const trackEvent = (name: AnalyticsEvent, properties?: Record<string, unknown>): void => {
  if (ENABLED) {
    track(name, properties);
  }
};
