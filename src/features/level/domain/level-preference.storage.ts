import AsyncStorage from "@react-native-async-storage/async-storage";

import { isLevelCode, type LevelCode } from "@/shared/domain/level";

const STORAGE_KEY = "pal.level-preference";

/** Lit la préférence ; renvoie null si absente ou invalide (validée par le garde de type). */
export const readLevel = async (): Promise<LevelCode | null> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return isLevelCode(raw) ? raw : null;
};

export const writeLevel = async (level: LevelCode): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, level);
};

export const clearLevel = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
