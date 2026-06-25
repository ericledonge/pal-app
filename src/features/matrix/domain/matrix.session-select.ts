import { COURT_AREA_LABELS } from "@/features/sessions/domain/session.constants";
import { isCodesForLevel } from "@/features/sessions/domain/session.service";
import type { CourtArea, Slot } from "@/features/sessions/domain/session.types";
import { toMinutes } from "@/lib/date.utils";
import type { LevelCode } from "@/shared/domain/level";

import { mapPresentsToPlayers } from "./matrix.service";
import type { MatrixPlayer } from "./matrix.types";

// Logique pure : relie les créneaux F1 (présences) à « la session en cours / à venir » du calibre
// de l'utilisateur, pour pré-remplir l'effectif de la matrice. Aucun import react / RN / Query.

/** Marge par défaut (minutes) : une session apparaît « en cours » dès 15 min avant son début. */
export const SESSION_MARGIN_MIN = 15;

/** Durée par défaut (minutes) appliquée quand l'heure de fin d'un créneau est inconnue. */
const DEFAULT_SESSION_MIN = 120;

export type SessionStatus = "en-cours" | "a-venir" | "passee";

/**
 * Fenêtre de session = un groupe de niveau à une heure donnée, fusionné sur les deux court areas.
 * L'effectif est l'union dédoublonnée des inscrits des créneaux de la fenêtre.
 */
export interface SessionWindow {
  /** Clé stable : heure + codes triés, ex. « 18:00|3.5C_3.5T » (vide après le `|` = jeu libre). */
  id: string;
  heure: string;
  /** Heure de fin « HH:MM » ; si vide, une durée de 2 h (`DEFAULT_SESSION_MIN`) est supposée. */
  heureFin: string;
  /** Codes de niveau agrégés (triés, dédoublonnés). Vide pour un jeu libre. */
  codes: LevelCode[];
  /** Libellés non normalisés agrégés (ex. « Jeu libre public »). */
  labels: string[];
  /** Court areas couvertes par la fenêtre. */
  courtAreas: CourtArea[];
  /** Effectif : union dédoublonnée des inscrits. */
  players: MatrixPlayer[];
}

const sortedCodesKey = (codes: LevelCode[]): string => [...codes].sort().join("_");

const uniqueSorted = <T extends string>(values: T[]): T[] => [...new Set(values)].sort();

/**
 * Construit les fenêtres de session à partir des créneaux du jour (parc + patinoire confondus).
 * Regroupe par (heure + codes) — chaque groupe de niveau à une heure est une session distincte —
 * et fusionne les court areas et les inscrits. Triées par heure croissante.
 */
export const buildSessionWindows = (slots: Slot[]): SessionWindow[] => {
  const groups = new Map<string, Slot[]>();
  for (const slot of slots) {
    if (slot.kind !== "groupe") {
      continue; // seuls les créneaux de groupe portent une liste d'inscrits pertinente
    }
    const key = `${slot.heure}|${sortedCodesKey(slot.codes)}`;
    const list = groups.get(key) ?? [];
    list.push(slot);
    groups.set(key, list);
  }

  const windows: SessionWindow[] = [];
  for (const [id, group] of groups) {
    const first = group[0];
    const names = group.flatMap((slot) => slot.inscrits.map((registrant) => registrant.nom));
    windows.push({
      id,
      heure: first.heure,
      heureFin: first.heureFin,
      codes: uniqueSorted(group.flatMap((slot) => slot.codes)),
      labels: uniqueSorted(group.flatMap((slot) => slot.labels)),
      courtAreas: uniqueSorted(group.map((slot) => slot.courtArea)),
      players: mapPresentsToPlayers(names),
    });
  }

  // Tri numérique (et non lexicographique) : « 9:00 » sans zéro initial doit précéder « 18:00 ».
  // sort() sur une copie : Hermes (moteur RN) n'implémente pas Array.prototype.toSorted (ES2023).
  return [...windows].sort(
    (left, right) => (toMinutes(left.heure) ?? 0) - (toMinutes(right.heure) ?? 0),
  );
};

/** Statut d'une fenêtre vis-à-vis de l'instant courant (en minutes depuis minuit), marge incluse. */
export const sessionStatus = (
  window: SessionWindow,
  nowMin: number,
  marginMin: number = SESSION_MARGIN_MIN,
): SessionStatus => {
  const start = toMinutes(window.heure);
  if (start === null) {
    return "a-venir"; // heure non exploitable : on ne peut pas la déclarer passée
  }
  // Heure de fin absente → on suppose une durée par défaut. Fin < début → créneau passant minuit
  // (ex. « 23:00 » - « 01:00 ») : on ramène la fin au lendemain pour comparer correctement.
  const rawEnd = toMinutes(window.heureFin) ?? start + DEFAULT_SESSION_MIN;
  const end = rawEnd < start ? rawEnd + 1440 : rawEnd;
  if (nowMin < start - marginMin) {
    return "a-venir";
  }
  if (nowMin > end) {
    return "passee";
  }
  return "en-cours";
};

/**
 * Sélectionne automatiquement la session du calibre de l'utilisateur : celle en cours sinon la
 * prochaine à venir. Ignore les jeux libres (sans calibre). `null` si aucune session pertinente.
 * À calibre égal, privilégie l'heure la plus proche puis une correspondance exacte du code.
 */
export const selectAutoSession = (
  windows: SessionWindow[],
  myLevel: LevelCode,
  nowMin: number,
  marginMin: number = SESSION_MARGIN_MIN,
): SessionWindow | null => {
  const candidates = windows
    .filter((window) => window.codes.length > 0 && isCodesForLevel(window.codes, myLevel))
    .map((window) => ({
      window,
      status: sessionStatus(window, nowMin, marginMin),
      start: toMinutes(window.heure) ?? Number.MAX_SAFE_INTEGER,
      exact: window.codes.includes(myLevel),
    }));

  const pickBest = (status: SessionStatus): SessionWindow | null => {
    const matching = candidates.filter((candidate) => candidate.status === status);
    if (matching.length === 0) {
      return null;
    }
    return [...matching].sort(
      (left, right) => left.start - right.start || Number(right.exact) - Number(left.exact),
    )[0].window;
  };

  return pickBest("en-cours") ?? pickBest("a-venir");
};

const STATUS_LABELS: Record<SessionStatus, string> = {
  "en-cours": "En cours",
  "a-venir": "À venir",
  passee: "Terminée",
};

/** Ligne d'affichage du sélecteur de session (objet plat, prêt à rendre). */
export interface SessionPickerRow {
  id: string;
  heure: string;
  horaire: string;
  niveauLabel: string;
  lieuLabel: string;
  count: number;
  status: SessionStatus;
  statusLabel: string;
}

const niveauLabel = (window: SessionWindow): string =>
  window.codes.length > 0 ? window.codes.join(" & ") : (window.labels[0] ?? "Jeu libre");

/** View model du sélecteur : toutes les sessions du jour, triées par heure, avec leur statut. */
export const createSessionPickerRows = (
  windows: SessionWindow[],
  nowMin: number,
  marginMin: number = SESSION_MARGIN_MIN,
): SessionPickerRow[] =>
  windows.map((window) => {
    const status = sessionStatus(window, nowMin, marginMin);
    return {
      id: window.id,
      heure: window.heure,
      horaire: window.heureFin ? `${window.heure} - ${window.heureFin}` : window.heure,
      niveauLabel: niveauLabel(window),
      lieuLabel: window.courtAreas.map((area) => COURT_AREA_LABELS[area]).join(" · "),
      count: window.players.length,
      status,
      statusLabel: STATUS_LABELS[status],
    };
  });
