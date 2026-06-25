import { useMemo } from "react";

import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";

import { useGrid } from "../domain/session.repository";
import { type AgendaMode, createAgendaViewModel, GridParseError } from "../domain/session.service";
import type { Day } from "../domain/session.types";

// Hook orchestrateur (glue uniquement) : combine les deux court areas du jour, lit le niveau
// persisté, applique le mode via le service de présentation. Aucune logique métier ici.
export const useAgenda = (day: Day, mode: AgendaMode) => {
  const { level } = useLevelPreference();
  const parc = useGrid(day, "parc");
  const patinoire = useGrid(day, "patinoire");

  const isLoading = parc.isLoading || patinoire.isLoading;
  // Erreur affichée seulement sans donnée à montrer : une erreur de refetch (données déjà
  // présentes) ne vide pas la liste (dégradation gracieuse).
  const isError =
    (parc.isError || patinoire.isError) && parc.data === undefined && patinoire.data === undefined;
  const isRefreshing = parc.isRefetching || patinoire.isRefetching;
  const error = parc.error ?? patinoire.error ?? null;
  const errorKind = error ? (error instanceof GridParseError ? "parsing" : "network") : null;

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
    myLevel: level,
    isLoading,
    isError,
    isRefreshing,
    errorKind,
    isEmpty: !isLoading && !isError && sections.length === 0,
    refresh,
  };
};
