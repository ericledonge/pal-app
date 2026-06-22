import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  DEFAULT_PREFERENCES,
  type Preferences,
  readPreferences,
  writePreferences,
} from "../domain/preferences.storage";

const PREFERENCES_KEY = ["preferences"] as const;

// Préférences locales via le cache React Query partagé (même pattern que la préférence de niveau).
export const usePreferences = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: PREFERENCES_KEY,
    queryFn: readPreferences,
    staleTime: Infinity,
  });
  const preferences = data ?? DEFAULT_PREFERENCES;

  const setPreference = useCallback(
    async <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      const next = { ...preferences, [key]: value };
      await writePreferences(next);
      queryClient.setQueryData(PREFERENCES_KEY, next);
    },
    [preferences, queryClient],
  );

  return { preferences, setPreference };
};
