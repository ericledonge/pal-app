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
import { ActivityIndicator, View } from "react-native";

import "../src/global.css";

const preview: Preview = {
  decorators: [
    (Story) => {
      // Charge les polices de marque pour que les stories rendent la vraie typographie (Lexend / Inter).
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
      return (
        <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
          {loaded ? <Story /> : <ActivityIndicator />}
        </View>
      );
    },
  ],
};

export default preview;
