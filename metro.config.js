const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const { withStorybook } = require("@storybook/react-native/metro/withStorybook");

const config = withNativeWind(getDefaultConfig(__dirname), { input: "./src/global.css" });

// Storybook on-device : withStorybook est toujours appliqué, mais ACTIF seulement si
// EXPO_PUBLIC_STORYBOOK_ENABLED=true (via `npm run storybook`). En mode inactif, le plugin
// neutralise `.rnstorybook` (stub) → zéro impact sur le bundle de l'app.
module.exports = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true",
  configPath: `${__dirname}/.rnstorybook`,
});
