import { toMinutes } from "@/lib/date.utils";
import { isLevelCode, type LevelCode } from "@/shared/domain/level";

import { COURT_AREA_LABELS } from "./session.constants";
import type { CourtArea, Slot, SlotKind } from "./session.types";

// Logique pure : validation de la sortie du parser par type guards (PAS de Zod).
// Aucun import react / react-native / @tanstack/react-query.

export class GridParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GridParseError";
  }
}

const COURT_AREAS = new Set<CourtArea>(["parc", "patinoire"]);
const SLOT_KINDS = new Set<SlotKind>(["groupe", "bloquee", "reservee", "libre", "nd"]);

const isRegistrant = (value: unknown): boolean =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Record<string, unknown>).nom === "string";

export const isValidSlot = (value: unknown): value is Slot => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const slot = value as Record<string, unknown>;
  return (
    typeof slot.heure === "string" &&
    typeof slot.heureFin === "string" &&
    typeof slot.courtArea === "string" &&
    COURT_AREAS.has(slot.courtArea as CourtArea) &&
    typeof slot.kind === "string" &&
    SLOT_KINDS.has(slot.kind as SlotKind) &&
    Array.isArray(slot.terrains) &&
    Array.isArray(slot.codes) &&
    slot.codes.every((code) => isLevelCode(code)) &&
    Array.isArray(slot.labels) &&
    slot.labels.every((label) => typeof label === "string") &&
    Array.isArray(slot.inscrits) &&
    slot.inscrits.every(isRegistrant) &&
    typeof slot.count === "number" &&
    (slot.placesLibres === null || typeof slot.placesLibres === "number")
  );
};

/** Le HTML contient-il la structure attendue du RadScheduler ? (sinon : structure inattendue). */
export const hasSchedulerStructure = (html: string): boolean =>
  /RadScheduler|appointment-card|rsApt/i.test(html);

/**
 * Valide la sortie du parser. Distingue une grille **vide légitime** (structure présente,
 * 0 créneau) d'un **échec de parsing** (structure absente, ou créneau non conforme) → `GridParseError`.
 */
export const assertValidGrid = (html: string, slots: Slot[]): Slot[] => {
  if (!hasSchedulerStructure(html)) {
    throw new GridParseError("Structure de grille inattendue (HTML possiblement modifié).");
  }
  if (slots.some((slot) => !isValidSlot(slot))) {
    throw new GridParseError("Créneau non conforme dans la sortie du parser.");
  }
  return slots;
};

/**
 * Un ensemble de codes est-il pertinent pour « mon niveau » ?
 * - vrai si les codes portent exactement mon niveau, ou sont multi-groupes l'incluant ;
 * - une séance sans code (jeu libre / ouvert à tous) est pertinente pour tout le monde ;
 * - exception unique à sens unique : un joueur 4.0C voit aussi les créneaux 3.5T (pas l'inverse).
 *
 * Règle partagée par l'agenda (F1) et la détection de session de la matrice (F2).
 */
export const isCodesForLevel = (codes: LevelCode[], myLevel: LevelCode): boolean => {
  if (codes.length === 0) {
    return true;
  }
  if (codes.includes(myLevel)) {
    return true;
  }
  if (myLevel === "4.0C" && codes.includes("3.5T")) {
    return true;
  }
  return false;
};

/** Un créneau est-il pertinent pour « mon niveau » ? (voir `isCodesForLevel`). */
export const isSlotForLevel = (slot: Slot, myLevel: LevelCode): boolean =>
  isCodesForLevel(slot.codes, myLevel);

export const filterSlotsForLevel = (slots: Slot[], myLevel: LevelCode): Slot[] =>
  slots.filter((slot) => isSlotForLevel(slot, myLevel));

const KIND_LABELS: Record<SlotKind, string> = {
  groupe: "",
  bloquee: "Bloquée",
  reservee: "Réservée",
  libre: "Libre",
  nd: "n/d",
};

export type AgendaMode = "myLevel" | "all";

export interface AgendaSlotViewModel {
  id: string;
  heure: string;
  /** Plage horaire formatée, ex. « 09:00 - 11:00 ». */
  horaire: string;
  courtAreaLabel: string;
  /** Lieu + courts, ex. « Parc · Courts 01-05 ». */
  lieuLabel: string;
  levelLabel: string;
  /** Vrai si multi-groupes (≥ 2 codes) → mise en avant distincte (badge secondaire). */
  multiNiveau: boolean;
  kindLabel: string;
  count: number;
  countLabel: string;
  /** Capacité, ex. « 11/30 » ou « Complet ». */
  capaciteLabel: string;
  terrainsLabel: string;
  /** Noms des inscrits — peuplé uniquement en mode « Mon niveau ». */
  inscrits: string[];
}

export interface AgendaSection {
  courtArea: CourtArea;
  courtAreaLabel: string;
  slots: AgendaSlotViewModel[];
}

/** Formate des courts triés en plages contiguës : ["01","02","03","05"] → « 01-03, 05 ». */
const formatCourts = (terrains: Slot["terrains"]): string => {
  const nums = terrains.map((court) => Number(court)).sort((left, right) => left - right);
  if (nums.length === 0) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  const runs: string[] = [];
  let start = nums[0];
  let prev = nums[0];
  for (const n of nums.slice(1)) {
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    runs.push(start === prev ? pad(start) : `${pad(start)}-${pad(prev)}`);
    start = n;
    prev = n;
  }
  runs.push(start === prev ? pad(start) : `${pad(start)}-${pad(prev)}`);
  return runs.join(", ");
};

const createAgendaSlotViewModel = (
  slot: Slot,
  index: number,
  withNames: boolean,
): AgendaSlotViewModel => {
  const courts = formatCourts(slot.terrains);
  const total = slot.placesLibres === null ? null : slot.count + slot.placesLibres;
  const countLabel = `${slot.count} ${slot.count > 1 ? "inscrits" : "inscrit"}`;
  return {
    id: `${slot.courtArea}-${slot.heure}-${slot.codes.join("_")}-${index}`,
    heure: slot.heure,
    horaire: slot.heureFin ? `${slot.heure} - ${slot.heureFin}` : slot.heure,
    courtAreaLabel: COURT_AREA_LABELS[slot.courtArea],
    lieuLabel: courts
      ? `${COURT_AREA_LABELS[slot.courtArea]} · ${slot.terrains.length > 1 ? "Courts" : "Court"} ${courts}`
      : COURT_AREA_LABELS[slot.courtArea],
    levelLabel: slot.codes.length > 0 ? slot.codes.join(" & ") : slot.labels.join(", "),
    multiNiveau: slot.codes.length > 1,
    kindLabel: KIND_LABELS[slot.kind],
    count: slot.count,
    countLabel,
    capaciteLabel:
      slot.placesLibres === null
        ? "Complet"
        : total && total > 0
          ? `${slot.count}/${total}`
          : countLabel,
    terrainsLabel: courts,
    inscrits: withNames ? slot.inscrits.map((registrant) => registrant.nom) : [],
  };
};

/**
 * View model de l'agenda : trié par heure, groupé/étiqueté par court area (parc puis patinoire).
 * Mode « Mon niveau » → filtre par niveau + inclut les inscrits ; « Tous » → résumé sans noms.
 */
export const createAgendaViewModel = (
  slots: Slot[],
  options: { mode: AgendaMode; myLevel: LevelCode | null },
): AgendaSection[] => {
  const withNames = options.mode === "myLevel";
  const visible =
    withNames && options.myLevel ? filterSlotsForLevel(slots, options.myLevel) : slots;

  const byCourtArea = new Map<CourtArea, AgendaSlotViewModel[]>();
  // Tri numérique (et non lexicographique) : « 9:00 » sans zéro initial doit précéder « 18:00 ».
  // sort() sur une copie (spread) : Hermes, le moteur JS de React Native, n'implémente pas
  // Array.prototype.toSorted (ES2023). La copie évite de muter l'entrée.
  [...visible]
    .sort((left, right) => (toMinutes(left.heure) ?? 0) - (toMinutes(right.heure) ?? 0))
    .forEach((slot, index) => {
      const list = byCourtArea.get(slot.courtArea) ?? [];
      list.push(createAgendaSlotViewModel(slot, index, withNames));
      byCourtArea.set(slot.courtArea, list);
    });

  const order: CourtArea[] = ["parc", "patinoire"];
  return order
    .map((courtArea) => ({
      courtArea,
      courtAreaLabel: COURT_AREA_LABELS[courtArea],
      slots: byCourtArea.get(courtArea) ?? [],
    }))
    .filter((section) => section.slots.length > 0);
};
