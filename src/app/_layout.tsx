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
import { useEffect } from "react";
import { AppState, useColorScheme, View } from "react-native";
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";
import { initAnalytics } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import { initObservability, logger } from "@/lib/logger";
import { queryClient } from "@/lib/query-client";

import "@/global.css";

// Suivi d'erreurs (Sentry en prod si DSN configuré) + analytics produit (Amplitude). À init avant le rendu.
initObservability();
initAnalytics();

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

// Masque le splash une fois les polices ET la préférence de niveau chargées (les deux
// ressources qui conditionnent le premier écran), évitant tout flash. Rendu à l'intérieur du
// QueryClientProvider pour lire la préférence ; fonctionne quelle que soit la route d'entrée
// (y compris un deep link direct vers les onglets).
const SplashGate = ({ fontsReady }: { fontsReady: boolean }) => {
  const { isLoading } = useLevelPreference();
  const ready = fontsReady && !isLoading;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  return null;
};

function RootLayout() {
  const colorScheme = useColorScheme();
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
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <SplashGate fontsReady={fontsReady} />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen
              name="select-level"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen name="feedback" options={{ presentation: "modal", headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// Sentry.wrap : capture les erreurs JS non gérées et les remonte (en prod, si DSN configuré).
export default Sentry.wrap(RootLayout);
