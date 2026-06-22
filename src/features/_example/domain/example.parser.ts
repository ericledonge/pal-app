// Squelette d'exemple — couche Parser (spécifique à pal-app).
// Transforme une charge brute (HTML rendu serveur) en DTO typé.
// Fonction pure et testable : aucun IO, aucun import `react`/`react-native`.

import type { ExampleDto } from "./example.adapter";

export const parseExample = (raw: string): ExampleDto => {
  const value = raw.trim();
  return { id: value, rawLabel: value };
};
