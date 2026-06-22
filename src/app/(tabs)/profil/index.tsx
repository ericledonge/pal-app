import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ProfilScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Profil" }} />
      <ThemedText type="title">Profil</ThemedText>
      <ThemedText>Profil, niveau et réglages — à venir.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
});
