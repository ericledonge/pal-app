import type { LevelCode } from "@/shared/domain/level";

// Types purs du domaine « présences » (F1). Aucune dépendance entrante vers d'autres couches.

export type Plateau = "parc" | "patinoire";

/** Jour consultable (la grille publique ne donne accès qu'à aujourd'hui et demain). */
export type Day = "today" | "tomorrow";

/** Numéro de court : parc 01–06, patinoire 07–11 (numérotation continue). */
export type Court = "01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11";

/** Type de plage : groupe (avec liste), bloquée, réservée (individuelle), libre, ou n/d. */
export type SlotKind = "groupe" | "bloquee" | "reservee" | "libre" | "nd";

export interface Registrant {
  nom: string;
}

export interface Slot {
  /** Heure de début, ex. « 18:00 ». */
  heure: string;
  plateau: Plateau;
  /** Court(s) couverts par ce créneau. */
  terrains: Court[];
  kind: SlotKind;
  /** Codes de niveau reconnus (un seul, ou plusieurs si multi-groupes). */
  codes: LevelCode[];
  /** Libellés spéciaux non normalisés (ex. « Open Play », « Jeu libre public »). */
  labels: string[];
  inscrits: Registrant[];
  /** Nombre d'inscrits = nombre de noms listés (plus fiable que max − libres). */
  count: number;
}
