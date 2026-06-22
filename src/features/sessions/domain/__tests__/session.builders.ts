import type { Slot } from "../session.types";

// Builder de fixtures pour les tests (pattern builder : valeurs par défaut + overrides).
export const aSlot = (overrides?: Partial<Slot>): Slot => ({
  heure: "18:00",
  plateau: "parc",
  terrains: [],
  kind: "groupe",
  codes: ["3.0C"],
  labels: [],
  inscrits: [{ nom: "Alice Tremblay" }, { nom: "Bob Roy" }],
  count: 2,
  ...overrides,
});
