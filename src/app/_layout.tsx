import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from "@expo-google-fonts/lexend";
import * as Sentry from "@sentry/react-native";
import { focusManager, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import {
  DarkTheme,
  DefaultTheme,
  type ErrorBoundaryProps,
  Stack,
  ThemeProvider,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { useEffect } from "react";
import { AppState, useColorScheme, View } from "react-native";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";
import { usePreferences } from "@/features/preferences/use-cases/use-preferences";
import { initAnalytics } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import { initObservability, logger } from "@/lib/logger";
import { setupMatchNotifications } from "@/lib/notifications";
import { queryClient } from "@/lib/query-client";
import { useAutoUpdate } from "@/lib/updates/use-auto-update";

import "@/global.css";

// Suivi d'erreurs (Sentry en prod si DSN configuré) + analytics produit (Amplitude). À init avant le rendu.
initObservability();
initAnalytics();
// Notifications locales (filet de l'alarme du minuteur) : handler de présentation + canal Android.
void setupMatchNotifications();

// Maintient le splash jusqu'au chargement des polices (évite tout flash de police système).
void SplashScreen.preventAutoHideAsync();

// Error boundary global : capture toute erreur de rendu, la journalise (Sentry en prod), et
// affiche un écran de secours avec « Relancer ».
export const ErrorBoundary = ({ error, retry }: ErrorBoundaryProps) => {
  useEffect(() => {
    logger.error(error, { boundary: "root" });
  }, [error]);
  return (
    <View className="flex-1 items-center justify-center gap-md bg-background px-lg">
      <Text variant="title">{t("common.errorTitle")}</Text>
      <Text variant="body" className="text-center text-on-surface-muted">
        {t("common.errorBody")}
      </Text>
      <Button label={t("common.restart")} onPress={() => void retry()} />
    </View>
  );
};

// Coquille de l'app (rendue dans le QueryClientProvider) : applique le thème selon la
// préférence (système / clair / sombre) et masque le splash une fois polices + préférence de
// niveau prêtes (évite tout flash, quelle que soit la route d'entrée). Le thème vit ici car il
// dépend des préférences persistées (React Query).
const AppShell = ({ fontsReady }: { fontsReady: boolean }) => {
  const systemScheme = useColorScheme();
  const { preferences } = usePreferences();
  const { setColorScheme } = useNativeWindColorScheme();
  const { isLoading: levelLoading } = useLevelPreference();

  const { themeMode } = preferences;
  // Pilote NativeWind (couleurs via global.css) selon la préférence ; "system" suit l'appareil.
  useEffect(() => {
    setColorScheme(themeMode);
  }, [themeMode, setColorScheme]);

  // Même résultat pour le thème de navigation (React Navigation).
  const resolvedScheme = themeMode === "system" ? (systemScheme ?? "light") : themeMode;

  const ready = fontsReady && !levelLoading;
  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  return (
    <ThemeProvider value={resolvedScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="select-level" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="feedback" options={{ presentation: "modal", headerShown: false }} />
        <Stack.Screen name="donation" options={{ presentation: "modal", headerShown: false }} />
      </Stack>
      <StatusBar style={resolvedScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
};

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsReady = fontsLoaded || fontError !== null;

  // Auto-update OTA (EAS Update) : télécharge au premier plan, applique quand c'est sûr.
  useAutoUpdate();

  // Focus manager TanStack Query : refetch quand l'app revient au premier plan.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      focusManager.setFocused(status === "active");
    });
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <QueryClientProvider client={queryClient}>
        <AppShell fontsReady={fontsReady} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// Sentry.wrap : capture les erreurs JS non gérées et les remonte (en prod, si DSN configuré).
export default Sentry.wrap(RootLayout);
