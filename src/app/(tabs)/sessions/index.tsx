import { Stack } from "expo-router";
import { Text, View } from "react-native";

// Écran de démo NativeWind (issue #6) : applique les tokens des deux thèmes
// (bg-background, text-on-surface…), l'échelle text-[NNpx] et les tokens d'espacement.
// La bascule clair/sombre suit le réglage système (userInterfaceStyle: automatic).
export default function SessionsScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-sm bg-background px-xl">
      <Stack.Screen options={{ title: "Sessions" }} />
      <Text className="font-lexend text-[28px] text-on-surface">Sessions</Text>
      <Text className="font-inter text-[16px] text-on-surface-muted">
        Consultation des présences — à venir.
      </Text>
      <View className="mt-md rounded-xl bg-primary px-md py-xs">
        <Text className="font-inter text-[13px] text-on-primary">Accent de marque #ff5700</Text>
      </View>
    </View>
  );
}
