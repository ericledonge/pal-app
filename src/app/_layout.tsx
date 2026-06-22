import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Emplacement prévu pour les providers globaux (ex. QueryClientProvider — issue #9).
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="onboarding"
          options={{ presentation: "modal", headerShown: true, title: "Bienvenue" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
