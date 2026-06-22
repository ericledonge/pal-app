// Types purs du domaine « matrice de jeu » (F2). Aucune dépendance UI.
// Terrains abstraits 1..N (distincts de la numérotation continue 01–11 de la F1).

export type PlayerSource = "present" | "invite";

export interface MatrixPlayer {
  id: string;
  nom: string;
  source: PlayerSource;
}

export interface MatrixConfig {
  nbTerrains: number;
  /** Durée d'un match en minutes (défaut 13, réglable). */
  dureeMatchMin: number;
}

export interface Pairing {
  /** Terrain abstrait 1..N. */
  terrain: number;
  equipeA: [string, string];
  equipeB: [string, string];
}

export interface Round {
  numero: number;
  pairings: Pairing[];
  /** Joueurs sur le banc pour cette ronde (ids). */
  bench: string[];
}

export interface MatrixSession {
  effectif: MatrixPlayer[];
  config: MatrixConfig;
  /** Historique des rondes déjà générées. */
  rounds: Round[];
}

export const DEFAULT_MATCH_MINUTES = 13;
