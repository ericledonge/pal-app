import { useMemo } from "react";

import { useGrid } from "@/features/sessions/domain/session.repository";

import { mapPresentsToPlayers } from "../domain/matrix.service";
import type { MatrixPlayer } from "../domain/matrix.types";

// Source des présents = réponses aux sondages F1 (union des inscrits d'aujourd'hui sur les deux
// court areas, dédoublonnés). Seule source de noms existante — il n'y a pas de répertoire de membres.
// Contrat d'entrée stable avec F1 : une liste de noms.
export const usePresentPlayers = (): { players: MatrixPlayer[]; isLoading: boolean } => {
  const parc = useGrid("today", "parc");
  const patinoire = useGrid("today", "patinoire");

  const players = useMemo(() => {
    const names = [...(parc.data ?? []), ...(patinoire.data ?? [])].flatMap((slot) =>
      slot.inscrits.map((registrant) => registrant.nom),
    );
    return mapPresentsToPlayers(names);
  }, [parc.data, patinoire.data]);

  return { players, isLoading: parc.isLoading || patinoire.isLoading };
};
