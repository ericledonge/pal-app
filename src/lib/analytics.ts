import { init, track } from "@amplitude/analytics-react-native";

// Analytics produit (Amplitude). Actif seulement en prod avec une clé fournie via
// EXPO_PUBLIC_AMPLITUDE_KEY ; en dev, aucun envoi. Importé directement (pas de DI).
const KEY = process.env.EXPO_PUBLIC_AMPLITUDE_KEY;
const ENABLED = !__DEV__ && Boolean(KEY);

export const initAnalytics = (): void => {
  if (ENABLED && KEY) {
    init(KEY);
  }
};

export const trackEvent = (name: string, properties?: Record<string, unknown>): void => {
  if (ENABLED) {
    track(name, properties);
  }
};
