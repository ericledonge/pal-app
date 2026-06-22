import { useCallback, useEffect, useState } from "react";

import type { LevelCode } from "@/shared/domain/level";

import { clearLevel, readLevel, writeLevel } from "../domain/level-preference.storage";

export interface LevelPreference {
  /** Niveau choisi, ou `null` tant qu'aucun n'est défini (premier lancement → gate onboarding). */
  level: LevelCode | null;
  /** Vrai tant que la lecture initiale du stockage n'est pas terminée. */
  isLoading: boolean;
  setLevel: (level: LevelCode) => Promise<void>;
  clear: () => Promise<void>;
}

export const useLevelPreference = (): LevelPreference => {
  const [level, setLevelState] = useState<LevelCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void readLevel().then((value) => {
      if (active) {
        setLevelState(value);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setLevel = useCallback(async (next: LevelCode) => {
    await writeLevel(next);
    setLevelState(next);
  }, []);

  const clear = useCallback(async () => {
    await clearLevel();
    setLevelState(null);
  }, []);

  return { level, isLoading, setLevel, clear };
};
