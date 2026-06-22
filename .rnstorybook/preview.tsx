import type { Preview } from "@storybook/react-native";
import { View } from "react-native";

import "../src/global.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
        <Story />
      </View>
    ),
  ],
};

export default preview;
