import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function MatriceScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Matrice" }} />
      <ThemedText type="title">Matrice</ThemedText>
      <ThemedText>Générateur de matrices de jeu — à venir.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
});
