import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Preferences {
  /** Démarrer l'agenda sur « Tous les niveaux » plutôt que « Mon niveau ». */
  defaultAllLevels: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = { defaultAllLevels: false };

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
      defaultAllLevels:
        typeof parsed.defaultAllLevels === "boolean"
          ? parsed.defaultAllLevels
          : DEFAULT_PREFERENCES.defaultAllLevels,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const writePreferences = async (preferences: Preferences): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};
