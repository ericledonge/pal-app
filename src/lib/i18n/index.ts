import { I18n } from "i18n-js";

import { fr } from "./fr";

// App entièrement en français : une seule locale, fr par défaut.
export const i18n = new I18n({ fr });
i18n.defaultLocale = "fr";
i18n.locale = "fr";
i18n.enableFallback = true;

/** Traduit une clé du catalogue (ex. `t("tabs.sessions")`). */
export const t = i18n.t.bind(i18n);
