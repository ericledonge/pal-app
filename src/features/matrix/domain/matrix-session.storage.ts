import AsyncStorage from "@react-native-async-storage/async-storage";

import { isMatrixSession } from "./matrix.service";
import type { MatrixConfig, MatrixPlayer, Round } from "./matrix.types";

const STORAGE_KEY = "pal.matrix-session";

export interface PersistedMatrix {
  effectif: MatrixPlayer[];
  config: MatrixConfig;
  rounds: Round[];
  phase: "config" | "live";
  currentIndex: number;
}

// Reprise mono-appareil : validation par type guards (sans Zod) à la relecture.
export const readMatrixSession = async (): Promise<PersistedMatrix | null> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<PersistedMatrix>;
    if (!isMatrixSession(parsed)) {
      return null;
    }
    const currentIndex =
      typeof parsed.currentIndex === "number" && parsed.currentIndex >= 0 ? parsed.currentIndex : 0;
    return {
      effectif: parsed.effectif,
      config: parsed.config,
      rounds: parsed.rounds,
      phase: parsed.phase === "live" ? "live" : "config",
      currentIndex,
    };
  } catch {
    return null;
  }
};

export const writeMatrixSession = async (session: PersistedMatrix): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearMatrixSession = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
