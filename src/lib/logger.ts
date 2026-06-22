/* eslint-disable no-console */
// Logger transverse intégré à Sentry. Importé directement partout (pas de DI/Provider).
//
// Au-delà du suivi de crash, c'est le levier pour détecter À DISTANCE une casse du parser
// HTML en production (point de défaillance le plus probable) : `logger.error(err, { jour, plateau })`.
//
// Comportement : en dev → console (pas d'envoi réseau). En prod → Sentry, uniquement si un DSN
// est fourni via EXPO_PUBLIC_SENTRY_DSN. Aucune PII envoyée (sendDefaultPii: false).
import * as Sentry from "@sentry/react-native";

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED = !__DEV__ && Boolean(DSN);

export type LogContext = Record<string, string | number | boolean | null | undefined>;

/** À appeler une fois au démarrage de l'app (avant le rendu). */
export const initObservability = (): void => {
  if (SENTRY_ENABLED) {
    Sentry.init({
      dsn: DSN,
      sendDefaultPii: false,
      tracesSampleRate: 0,
    });
  }
};

export const logger = {
  info(message: string, context?: LogContext): void {
    if (__DEV__) {
      console.log(`[info] ${message}`, context ?? "");
    } else if (SENTRY_ENABLED) {
      Sentry.captureMessage(message, { level: "info", extra: context });
    }
  },
  warn(message: string, context?: LogContext): void {
    if (__DEV__) {
      console.warn(`[warn] ${message}`, context ?? "");
    } else if (SENTRY_ENABLED) {
      Sentry.captureMessage(message, { level: "warning", extra: context });
    }
  },
  error(error: unknown, context?: LogContext): void {
    if (__DEV__) {
      console.error("[error]", error, context ?? "");
    } else if (SENTRY_ENABLED) {
      Sentry.captureException(error, { extra: context });
    }
  },
};
