import { useMemo } from "react";

import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";

import { useGrid } from "../domain/session.repository";
import { type AgendaMode, createAgendaViewModel } from "../domain/session.service";
import type { Day } from "../domain/session.types";

// Hook orchestrateur (glue uniquement) : combine les deux plateaux du jour, lit le niveau
// persisté, applique le mode via le service de présentation. Aucune logique métier ici.
export const useAgenda = (day: Day, mode: AgendaMode) => {
  const { level } = useLevelPreference();
  const parc = useGrid(day, "parc");
  const patinoire = useGrid(day, "patinoire");

  const isLoading = parc.isLoading || patinoire.isLoading;
  const isError = parc.isError || patinoire.isError;
  const error = parc.error ?? patinoire.error ?? null;

  const sections = useMemo(
    () =>
      createAgendaViewModel([...(parc.data ?? []), ...(patinoire.data ?? [])], {
        mode,
        myLevel: level,
      }),
    [parc.data, patinoire.data, mode, level],
  );

  const refresh = () => {
    void parc.refetch();
    void patinoire.refetch();
  };

  return {
    sections,
    isLoading,
    isError,
    error,
    isEmpty: !isLoading && !isError && sections.length === 0,
    refresh,
  };
};
