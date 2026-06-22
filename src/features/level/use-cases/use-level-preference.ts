import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import type { LevelCode } from "@/shared/domain/level";

import { clearLevel, readLevel, writeLevel } from "../domain/level-preference.storage";

export const LEVEL_PREFERENCE_KEY = ["level-preference"] as const;

export interface LevelPreference {
  /** Niveau choisi, ou `null` tant qu'aucun n'est défini (premier lancement → gate onboarding). */
  level: LevelCode | null;
  /** Vrai tant que la lecture initiale du stockage n'est pas terminée. */
  isLoading: boolean;
  setLevel: (level: LevelCode) => Promise<void>;
  clear: () => Promise<void>;
}

// Préférence persistée localement, exposée via le cache React Query partagé : tout écran
// qui lit la préférence se met à jour immédiatement après un changement (pas de store dédié).
export const useLevelPreference = (): LevelPreference => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: LEVEL_PREFERENCE_KEY,
    queryFn: readLevel,
    staleTime: Infinity, // préférence locale : ne périme pas, pas de refetch
  });

  const setLevel = useCallback(
    async (next: LevelCode) => {
      await writeLevel(next);
      queryClient.setQueryData(LEVEL_PREFERENCE_KEY, next);
    },
    [queryClient],
  );

  const clear = useCallback(async () => {
    await clearLevel();
    queryClient.setQueryData(LEVEL_PREFERENCE_KEY, null);
  }, [queryClient]);

  return { level: data ?? null, isLoading, setLevel, clear };
};
