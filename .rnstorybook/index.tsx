// Entrée on-device de Storybook. `storybook.requires` est généré au lancement
// (via le plugin metro withStorybook) — d'où l'exclusion de ce dossier du typecheck.
import { view } from "./storybook.requires";

const StorybookUIRoot = view.getStorybookUI({});

export default StorybookUIRoot;
