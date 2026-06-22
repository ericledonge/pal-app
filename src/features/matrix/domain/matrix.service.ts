import type { MatrixConfig, MatrixPlayer, MatrixSession, PlayerSource } from "./matrix.types";

// Logique pure + validation par type guards (PAS de Zod). Aucun import react / RN / Query.

const SOURCES = new Set<PlayerSource>(["present", "invite"]);

export const isMatrixPlayer = (value: unknown): value is MatrixPlayer => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const player = value as Record<string, unknown>;
  return (
    typeof player.id === "string" &&
    typeof player.nom === "string" &&
    typeof player.source === "string" &&
    SOURCES.has(player.source as PlayerSource)
  );
};

export const isMatrixConfig = (value: unknown): value is MatrixConfig => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const config = value as Record<string, unknown>;
  return (
    typeof config.nbTerrains === "number" &&
    config.nbTerrains >= 1 &&
    typeof config.dureeMatchMin === "number" &&
    config.dureeMatchMin > 0
  );
};

/** Valide un état de session relu du stockage (reprise) — validation à la frontière non fiable. */
export const isMatrixSession = (value: unknown): value is MatrixSession => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const session = value as Record<string, unknown>;
  return (
    Array.isArray(session.effectif) &&
    session.effectif.every(isMatrixPlayer) &&
    isMatrixConfig(session.config) &&
    Array.isArray(session.rounds)
  );
};

/** Normalise un nom pour comparer/dédoublonner (espaces compactés, insensible à la casse). */
export const normalizeName = (nom: string): string => nom.trim().replace(/\s+/g, " ").toLowerCase();

/** Mappe des noms de présents (réponses aux sondages F1) en joueurs, dédoublonnés. */
export const mapPresentsToPlayers = (names: string[]): MatrixPlayer[] => {
  const seen = new Set<string>();
  const players: MatrixPlayer[] = [];
  for (const raw of names) {
    const nom = raw.trim();
    if (nom.length === 0) {
      continue;
    }
    const key = normalizeName(nom);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    players.push({ id: `present:${key}`, nom, source: "present" });
  }
  return players;
};

/** Ajoute un invité saisi manuellement (ignore les doublons par nom normalisé). */
export const addGuest = (effectif: MatrixPlayer[], nom: string): MatrixPlayer[] => {
  const trimmed = nom.trim();
  if (trimmed.length === 0) {
    return effectif;
  }
  const key = normalizeName(trimmed);
  if (effectif.some((player) => normalizeName(player.nom) === key)) {
    return effectif;
  }
  return [...effectif, { id: `invite:${key}`, nom: trimmed, source: "invite" }];
};

/** Ajoute des présents à l'effectif sans recréer ceux déjà présents (par nom normalisé). */
export const addPlayers = (effectif: MatrixPlayer[], players: MatrixPlayer[]): MatrixPlayer[] => {
  const existing = new Set(effectif.map((player) => normalizeName(player.nom)));
  const additions = players.filter((player) => !existing.has(normalizeName(player.nom)));
  return [...effectif, ...additions];
};

export const removePlayer = (effectif: MatrixPlayer[], id: string): MatrixPlayer[] =>
  effectif.filter((player) => player.id !== id);
