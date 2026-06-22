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
import type { Preview } from "@storybook/react-native";
import { useFonts } from "expo-font";
import { useColorScheme } from "nativewind";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import "../src/global.css";

const preview: Preview = {
  decorators: [
    (Story) => {
      // Charge les polices de marque pour la vraie typographie dans les stories.
      const [loaded] = useFonts({
        Lexend_400Regular,
        Lexend_500Medium,
        Lexend_600SemiBold,
        Lexend_700Bold,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
      });
      // Bascule clair / sombre indépendante du réglage système (pour prévisualiser les deux thèmes).
      const { colorScheme, toggleColorScheme } = useColorScheme();

      if (!loaded) {
        return (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator />
          </View>
        );
      }

      return (
        <View className="flex-1 bg-background">
          <Pressable
            onPress={toggleColorScheme}
            className="m-sm self-end rounded-lg border border-outline bg-surface px-sm py-2xs"
          >
            <Text className="font-inter-semibold text-[12px] text-on-surface">
              {colorScheme === "dark" ? "☀︎ Thème clair" : "☾ Thème sombre"}
            </Text>
          </Pressable>
          <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
            <Story />
          </View>
        </View>
      );
    },
  ],
};

export default preview;
