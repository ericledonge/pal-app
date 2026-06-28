import type { SlotWeatherViewModel } from "@/features/weather/domain/weather.types";
import { nowMinutes, toMinutes } from "@/lib/date.utils";
import { formatDate } from "@/lib/format.utils";
import { isLevelCode, type LevelCode } from "@/shared/domain/level";

import { COURT_AREA_LABELS } from "./session.constants";
import { hasGridState } from "./session.parser";
import type { CourtArea, Day, Slot, SlotKind } from "./session.types";

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

/** Le HTML contient-il la coquille DOM attendue du RadScheduler ? */
export const hasSchedulerStructure = (html: string): boolean =>
  /RadScheduler|appointment-card|rsApt/i.test(html);

/**
 * Valide la sortie du parser. Distingue trois cas :
 * - ni coquille DOM ni ClientState → structure inattendue (`GridParseError`) ;
 * - ClientState introuvable/illisible (la VRAIE source de données du parser) → `GridParseError`,
 *   et NON une grille vide légitime — sinon une casse du format passerait inaperçue (pas de Sentry) ;
 * - ClientState exploitable (même 0 appointment) → grille vide légitime, on valide les créneaux.
 */
export const assertValidGrid = (html: string, slots: Slot[]): Slot[] => {
  if (!hasGridState(html)) {
    throw new GridParseError(
      hasSchedulerStructure(html)
        ? "ClientState introuvable ou illisible (format de la grille modifié)."
        : "Structure de grille inattendue (HTML possiblement modifié).",
    );
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

/**
 * Durée supposée (minutes) quand l'heure de fin d'un créneau est inconnue. Aligné sur la matrice
 * (`matrix.session-select`) pour qu'un créneau disparaisse de l'agenda au moment exact où la matrice
 * le déclare « Terminée ».
 */
const DEFAULT_SLOT_DURATION_MIN = 120;

/**
 * Fin d'un créneau en minutes depuis minuit. Heure de fin absente → durée par défaut ; fin < début
 * (créneau franchissant minuit, ex. « 23:00 »–« 01:00 ») → fin ramenée au lendemain. `null` si
 * l'heure de début est illisible (on ne pourra alors jamais déclarer le créneau passé).
 */
const slotEndMinutes = (slot: Slot): number | null => {
  const start = toMinutes(slot.heure);
  if (start === null) {
    return null;
  }
  const rawEnd = toMinutes(slot.heureFin) ?? start + DEFAULT_SLOT_DURATION_MIN;
  return rawEnd < start ? rawEnd + 1440 : rawEnd;
};

/** Un créneau est-il déjà terminé (heure de fin dépassée) à l'instant donné ? `now` injectable. */
export const isSlotPast = (slot: Slot, now: Date = new Date()): boolean => {
  const end = slotEndMinutes(slot);
  if (end === null) {
    return false; // heure illisible : on ne masque pas, faute de pouvoir trancher
  }
  return nowMinutes(now) > end;
};

/**
 * Pour le jour courant, ne garde que les séances en cours ou à venir (fin non dépassée) : une fois
 * terminée, une session quitte la vue. Pour « demain » (ou jour non précisé), rien n'est masqué.
 */
export const filterUpcomingForDay = (
  slots: Slot[],
  day: Day | undefined,
  now: Date = new Date(),
): Slot[] => (day === "today" ? slots.filter((slot) => !isSlotPast(slot, now)) : slots);

/** Clé d'une plage : une même plage d'un court area peut être SUBDIVISÉE en plusieurs séances. */
const rangeKey = (slot: Slot): string => `${slot.courtArea}|${slot.heure}|${slot.heureFin}`;

/**
 * Quand une même plage (court area + horaire) est subdivisée en plusieurs séances (ex. parc
 * 12:00–14:00 : courts 01–03 « 4.0C » + courts 04–06 « 2.0C/2.0T »), ne garder que la séance dont
 * le code porte EXACTEMENT mon niveau si l'une d'elles correspond — sinon laisser toutes les
 * séances. Privilégie un affichage personnel et net (une carte « 4.0C » plutôt que deux cartes ou
 * une carte fusionnée). Le test est `codes.includes(myLevel)` (et non `isSlotForLevel`) à dessein :
 * une séance sans code (jeu libre, pertinente pour tous) ne doit pas écraser une vraie séance de
 * niveau, et l'asymétrie 4.0C→3.5T ne doit pas masquer une séance d'un autre niveau réel en mode
 * « Tous ». Sans niveau choisi, ou pour une plage non subdivisée, ne change rien.
 */
export const collapseSubdividedByLevel = (slots: Slot[], myLevel: LevelCode | null): Slot[] => {
  if (!myLevel) {
    return slots;
  }
  const byRange = new Map<string, Slot[]>();
  for (const slot of slots) {
    const list = byRange.get(rangeKey(slot)) ?? [];
    list.push(slot);
    byRange.set(rangeKey(slot), list);
  }
  const kept = new Set<Slot>();
  for (const group of byRange.values()) {
    const matching = group.length > 1 ? group.filter((slot) => slot.codes.includes(myLevel)) : [];
    const visible = matching.length > 0 ? matching : group;
    for (const slot of visible) {
      kept.add(slot);
    }
  }
  return slots.filter((slot) => kept.has(slot));
};

const KIND_LABELS: Record<SlotKind, string> = {
  groupe: "",
  bloquee: "Bloquée",
  reservee: "Réservée",
  libre: "Libre",
  nd: "n/d",
};

export type AgendaMode = "myLevel" | "all";

/**
 * Date longue (fr-CA) du jour consulté, ex. « Vendredi 26 juin » — première lettre en majuscule
 * pour l'affichage en tête de liste. « tomorrow » = jour suivant l'horloge locale. `now` injectable
 * pour les tests.
 */
export const formatDayDate = (day: Day, now: Date = new Date()): string => {
  const date = new Date(now);
  if (day === "tomorrow") {
    date.setDate(date.getDate() + 1);
  }
  const label = formatDate(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
};

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
  /**
   * Vrai si l'étiquette est un code de niveau (court, ex. « 3.5T ») → pastille en haut à droite ;
   * faux pour un libellé de jeu libre (long, ex. « Jeu ouvert abonnés ») → pastille pleine largeur.
   */
  isLevelCode: boolean;
  kindLabel: string;
  count: number;
  countLabel: string;
  /** Capacité, ex. « 11/30 » ou « Complet ». */
  capaciteLabel: string;
  terrainsLabel: string;
  /** Numéros de courts bruts, ex. ["01","02","03"]. */
  terrains: string[];
  /** Vrai si le créneau porte le niveau de l'utilisateur (orange) ; faux sinon (or). */
  matchesMyLevel: boolean;
  /** Noms des inscrits — toujours peuplés dès que le créneau en compte. */
  inscrits: string[];
  /** Météo de l'heure de début (parc/patinoire en plein air) ; absent si indisponible. */
  weather?: SlotWeatherViewModel;
}

/** Fournit la météo d'un créneau à partir de son heure de début. Injectée (callback pur). */
export type GetSlotWeather = (heure: string) => SlotWeatherViewModel | null;

export interface AgendaSection {
  courtArea: CourtArea;
  courtAreaLabel: string;
  slots: AgendaSlotViewModel[];
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Formate des courts triés en plages contiguës : ["01","02","03","05"] → « 01-03, 05 ». */
const formatCourts = (terrains: Slot["terrains"]): string => {
  const nums = terrains.map((court) => Number(court)).sort((left, right) => left - right);
  if (nums.length === 0) {
    return "";
  }
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
  myLevel: LevelCode | null,
  getWeather?: GetSlotWeather,
): AgendaSlotViewModel => {
  const courts = formatCourts(slot.terrains);
  const total = slot.placesLibres === null ? null : slot.count + slot.placesLibres;
  const countLabel = `${slot.count} ${slot.count > 1 ? "inscrits" : "inscrit"}`;
  return {
    // id intrinsèque (courts disjoints au sein d'une plage subdivisée) → stable aux refetch/tri,
    // ce qui préserve l'état « déplié » des cartes.
    id: `${slot.courtArea}-${slot.heure}-${slot.heureFin}-${slot.terrains.join("_")}`,
    heure: slot.heure,
    horaire: slot.heureFin ? `${slot.heure} - ${slot.heureFin}` : slot.heure,
    courtAreaLabel: COURT_AREA_LABELS[slot.courtArea],
    lieuLabel: courts
      ? `${COURT_AREA_LABELS[slot.courtArea]} · ${slot.terrains.length > 1 ? "Courts" : "Court"} ${courts}`
      : COURT_AREA_LABELS[slot.courtArea],
    levelLabel: slot.codes.length > 0 ? slot.codes.join(" & ") : slot.labels.join(", "),
    multiNiveau: slot.codes.length > 1,
    isLevelCode: slot.codes.length > 0,
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
    terrains: slot.terrains,
    matchesMyLevel: myLevel !== null && slot.codes.length > 0 && isSlotForLevel(slot, myLevel),
    inscrits: slot.inscrits.map((registrant) => registrant.nom),
    weather: getWeather?.(slot.heure) ?? undefined,
  };
};

/**
 * View model de l'agenda : trié par heure, groupé/étiqueté par court area (parc puis patinoire).
 * Mode « Mon niveau » → filtre par niveau ; « Tous » → tous les créneaux. Les inscrits sont
 * toujours inclus (la `SlotCard` les affiche dès qu'il y en a, quel que soit le mode).
 */
export const createAgendaViewModel = (
  slots: Slot[],
  options: {
    mode: AgendaMode;
    myLevel: LevelCode | null;
    getWeather?: GetSlotWeather;
    /** Jour consulté : pour « today », les séances terminées sont masquées (`now` injectable). */
    day?: Day;
    now?: Date;
  },
): AgendaSection[] => {
  // Jour courant : on retire d'abord les séances déjà passées (en cours / à venir uniquement).
  const upcoming = filterUpcomingForDay(slots, options.day, options.now);
  const filtered =
    options.mode === "myLevel" && options.myLevel
      ? filterSlotsForLevel(upcoming, options.myLevel)
      : upcoming;
  // Une plage subdivisée (2 niveaux sur des courts distincts) → ne montrer que mon niveau.
  const visible = collapseSubdividedByLevel(filtered, options.myLevel);

  const byCourtArea = new Map<CourtArea, AgendaSlotViewModel[]>();
  // Tri numérique (et non lexicographique) : « 9:00 » sans zéro initial doit précéder « 18:00 ».
  // sort() sur une copie (spread) : Hermes, le moteur JS de React Native, n'implémente pas
  // Array.prototype.toSorted (ES2023). La copie évite de muter l'entrée.
  [...visible]
    .sort((left, right) => (toMinutes(left.heure) ?? 0) - (toMinutes(right.heure) ?? 0))
    .forEach((slot) => {
      const list = byCourtArea.get(slot.courtArea) ?? [];
      list.push(createAgendaSlotViewModel(slot, options.myLevel, options.getWeather));
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
