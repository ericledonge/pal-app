import type { ExampleDto } from "../example.adapter";

// Builder pattern pour les fixtures : valeurs par défaut + overrides partiels.
// Modèle à suivre pour les vraies features, ex. `aSlot(overrides?)`.
export const anExampleDto = (overrides?: Partial<ExampleDto>): ExampleDto => ({
  id: "ex-1",
  rawLabel: "exemple",
  ...overrides,
});
