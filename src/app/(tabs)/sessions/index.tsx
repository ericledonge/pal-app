import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function SessionsScreen() {
  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: "Sessions" }} />
      <ThemedText type="title">Sessions</ThemedText>
      <ThemedText>Consultation des présences — à venir.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
});
