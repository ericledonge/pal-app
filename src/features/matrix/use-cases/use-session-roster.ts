import { useEffect, useMemo, useState } from "react";

import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";
import { useGrid } from "@/features/sessions/domain/session.repository";
import { nowMinutes } from "@/lib/date.utils";
import type { LevelCode } from "@/shared/domain/level";

import {
  buildSessionWindows,
  createSessionPickerRows,
  selectAutoSession,
  type SessionPickerRow,
  type SessionWindow,
} from "../domain/matrix.session-select";

const TICK_MS = 60_000; // rafraîchit le statut « en cours / à venir » chaque minute

export interface SessionRoster {
  /** Toutes les sessions du jour (parc + patinoire) — pour le sélecteur manuel. */
  windows: SessionWindow[];
  /** Lignes d'affichage prêtes à rendre pour le sélecteur. */
  rows: SessionPickerRow[];
  /** Session détectée automatiquement pour le calibre de l'utilisateur (en cours / à venir). */
  autoSession: SessionWindow | null;
  myLevel: LevelCode | null;
  isLoading: boolean;
}

// Glue : combine les grilles F1 (aujourd'hui, deux court areas) + le calibre persisté + l'horloge,
// puis délègue toute la logique au service pur. La détection se réévalue à chaque minute.
export const useSessionRoster = (): SessionRoster => {
  const parc = useGrid("today", "parc");
  const patinoire = useGrid("today", "patinoire");
  const { level } = useLevelPreference();

  const [nowMin, setNowMin] = useState(() => nowMinutes());
  useEffect(() => {
    const id = setInterval(() => setNowMin(nowMinutes()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const windows = useMemo(
    () => buildSessionWindows([...(parc.data ?? []), ...(patinoire.data ?? [])]),
    [parc.data, patinoire.data],
  );

  const rows = useMemo(() => createSessionPickerRows(windows, nowMin), [windows, nowMin]);

  const autoSession = useMemo(
    () => (level ? selectAutoSession(windows, level, nowMin) : null),
    [windows, level, nowMin],
  );

  return {
    windows,
    rows,
    autoSession,
    myLevel: level,
    isLoading: parc.isLoading || patinoire.isLoading,
  };
};
