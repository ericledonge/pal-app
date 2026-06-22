// Modèle du domaine « niveau » — kernel partagé (onboarding, profil, filtre des sessions).
// Les 9 codes sont une simple étiquette : la distinction C (Consolidation) / T (Transition)
// n'a AUCUNE incidence sur la logique de l'app. Aucune logique de filtre ici.

export const LEVELS = [
  "2.0C",
  "2.0T",
  "2.5C",
  "2.5T",
  "3.0C",
  "3.0T",
  "3.5C",
  "3.5T",
  "4.0C",
] as const;

export type LevelCode = (typeof LEVELS)[number];

/** Garde de type : rejette toute valeur hors des 9 codes. */
export const isLevelCode = (value: unknown): value is LevelCode =>
  typeof value === "string" && (LEVELS as readonly string[]).includes(value);
