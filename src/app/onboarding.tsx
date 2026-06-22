import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function OnboardingScreen() {
  // Placeholder sans logique — la sélection du niveau arrive à l'issue #16.
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Bienvenue</ThemedText>
      <ThemedText>Onboarding (sélection du niveau) à venir.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
});
