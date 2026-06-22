import AsyncStorage from "@react-native-async-storage/async-storage";

/** Thème de l'app : suit le système, ou forcé en clair / sombre. */
export type ThemeMode = "system" | "light" | "dark";

const THEME_MODES: ReadonlySet<ThemeMode> = new Set(["system", "light", "dark"]);

const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === "string" && THEME_MODES.has(value as ThemeMode);

export interface Preferences {
  themeMode: ThemeMode;
}

export const DEFAULT_PREFERENCES: Preferences = { themeMode: "system" };

const STORAGE_KEY = "pal.preferences";

// Validation manuelle (pas de Zod) : on ne retient que les champs au bon type, sinon défaut.
export const readPreferences = async (): Promise<Preferences> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return DEFAULT_PREFERENCES;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      themeMode: isThemeMode(parsed.themeMode) ? parsed.themeMode : DEFAULT_PREFERENCES.themeMode,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const writePreferences = async (preferences: Preferences): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};
