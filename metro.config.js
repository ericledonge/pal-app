const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = withNativeWind(getDefaultConfig(__dirname), { input: "./src/global.css" });

// Storybook on-device : appliqué UNIQUEMENT quand STORYBOOK_ENABLED=true (via `npm run storybook`).
// Le require est paresseux pour n'avoir aucun impact sur le bundle de l'app en temps normal.
if (process.env.STORYBOOK_ENABLED === "true") {
  const withStorybook = require("@storybook/react-native/metro/withStorybook");
  module.exports = withStorybook(config, { configPath: `${__dirname}/.rnstorybook` });
} else {
  module.exports = config;
}
