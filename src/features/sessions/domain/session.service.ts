import { isLevelCode, type LevelCode } from "@/shared/domain/level";

import { PLATEAU_LABELS } from "./session.constants";
import type { Plateau, Slot, SlotKind } from "./session.types";

// Logique pure : validation de la sortie du parser par type guards (PAS de Zod).
// Aucun import react / react-native / @tanstack/react-query.

export class GridParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GridParseError";
  }
}

const PLATEAUX = new Set<Plateau>(["parc", "patinoire"]);
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
    typeof slot.plateau === "string" &&
    PLATEAUX.has(slot.plateau as Plateau) &&
    typeof slot.kind === "string" &&
    SLOT_KINDS.has(slot.kind as SlotKind) &&
    Array.isArray(slot.terrains) &&
    Array.isArray(slot.codes) &&
    slot.codes.every((code) => isLevelCode(code)) &&
    Array.isArray(slot.labels) &&
    slot.labels.every((label) => typeof label === "string") &&
    Array.isArray(slot.inscrits) &&
    slot.inscrits.every(isRegistrant) &&
    typeof slot.count === "number"
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
 * Un créneau est-il pertinent pour « mon niveau » ?
 * - vrai si le créneau porte exactement mon niveau, ou est multi-groupes l'incluant ;
 * - exception unique à sens unique : un joueur 4.0C voit aussi les créneaux 3.5T (pas l'inverse).
 */
export const isSlotForLevel = (slot: Slot, myLevel: LevelCode): boolean => {
  if (slot.codes.includes(myLevel)) {
    return true;
  }
  if (myLevel === "4.0C" && slot.codes.includes("3.5T")) {
    return true;
  }
  return false;
};

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
  plateauLabel: string;
  levelLabel: string;
  kindLabel: string;
  count: number;
  countLabel: string;
  terrainsLabel: string;
  /** Noms des inscrits — peuplé uniquement en mode « Mon niveau ». */
  inscrits: string[];
}

export interface AgendaSection {
  plateau: Plateau;
  plateauLabel: string;
  slots: AgendaSlotViewModel[];
}

const createAgendaSlotViewModel = (
  slot: Slot,
  index: number,
  withNames: boolean,
): AgendaSlotViewModel => ({
  id: `${slot.plateau}-${slot.heure}-${slot.codes.join("_")}-${index}`,
  heure: slot.heure,
  plateauLabel: PLATEAU_LABELS[slot.plateau],
  levelLabel: slot.codes.length > 0 ? slot.codes.join(" & ") : slot.labels.join(", "),
  kindLabel: KIND_LABELS[slot.kind],
  count: slot.count,
  countLabel: `${slot.count} ${slot.count > 1 ? "inscrits" : "inscrit"}`,
  terrainsLabel: slot.terrains.join(", "),
  inscrits: withNames ? slot.inscrits.map((registrant) => registrant.nom) : [],
});

/**
 * View model de l'agenda : trié par heure, groupé/étiqueté par plateau (parc puis patinoire).
 * Mode « Mon niveau » → filtre par niveau + inclut les inscrits ; « Tous » → résumé sans noms.
 */
export const createAgendaViewModel = (
  slots: Slot[],
  options: { mode: AgendaMode; myLevel: LevelCode | null },
): AgendaSection[] => {
  const withNames = options.mode === "myLevel";
  const visible =
    withNames && options.myLevel ? filterSlotsForLevel(slots, options.myLevel) : slots;

  const byPlateau = new Map<Plateau, AgendaSlotViewModel[]>();
  // sort() sur une copie (spread) : Hermes, le moteur JS de React Native, n'implémente pas
  // Array.prototype.toSorted (ES2023). La copie évite de muter l'entrée.
  [...visible]
    .sort((left, right) => left.heure.localeCompare(right.heure))
    .forEach((slot, index) => {
      const list = byPlateau.get(slot.plateau) ?? [];
      list.push(createAgendaSlotViewModel(slot, index, withNames));
      byPlateau.set(slot.plateau, list);
    });

  const order: Plateau[] = ["parc", "patinoire"];
  return order
    .map((plateau) => ({
      plateau,
      plateauLabel: PLATEAU_LABELS[plateau],
      slots: byPlateau.get(plateau) ?? [],
    }))
    .filter((section) => section.slots.length > 0);
};
