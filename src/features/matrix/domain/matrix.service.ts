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
