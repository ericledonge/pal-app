const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const { withStorybook } = require("@storybook/react-native/metro/withStorybook");
const { withNativeWind } = require("nativewind/metro");

// getSentryExpoConfig remplace getDefaultConfig : il annote le bundle (debug ids) pour relier les
// source maps aux erreurs Sentry. L'upload réel se fait au build EAS (plugin + SENTRY_AUTH_TOKEN).
const config = withNativeWind(getSentryExpoConfig(__dirname), { input: "./src/global.css" });

// Storybook on-device : withStorybook est toujours appliqué, mais ACTIF seulement si
// EXPO_PUBLIC_STORYBOOK_ENABLED=true (via `npm run storybook`). En mode inactif, le plugin
// neutralise `.rnstorybook` (stub) → zéro impact sur le bundle de l'app.
module.exports = withStorybook(config, {
  enabled: process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true",
  configPath: `${__dirname}/.rnstorybook`,
});
