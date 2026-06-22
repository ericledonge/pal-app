// Point d'entrée de l'app. En temps normal, délègue à expo-router. Quand
// EXPO_PUBLIC_STORYBOOK_ENABLED=true (via `npm run storybook`), rend l'UI Storybook on-device
// à la place — le plugin metro withStorybook neutralise `.rnstorybook` (stub) hors de ce mode,
// donc aucun impact sur le bundle de l'app.
import { registerRootComponent } from "expo";

if (process.env.EXPO_PUBLIC_STORYBOOK_ENABLED === "true") {
  const StorybookUIRoot = require("./.rnstorybook").default;
  registerRootComponent(StorybookUIRoot);
} else {
  require("expo-router/entry");
}
