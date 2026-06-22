import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseGrid } from "../session.parser";

const fixture = (name: string): string => readFileSync(join(__dirname, "fixtures", name), "utf-8");

describe("parseGrid — grille réelle (parc)", () => {
  const slots = parseGrid(fixture("grid-parc-real.html"), "parc");

  it("extrait des créneaux", () => {
    expect(slots.length).toBeGreaterThan(0);
  });

  it("rattache le plateau passé en paramètre", () => {
    expect(slots.every((slot) => slot.plateau === "parc")).toBe(true);
  });

  it("compte les inscrits par le nombre de noms listés", () => {
    const withNames = slots.find((slot) => slot.inscrits.length > 0);
    expect(withNames).toBeDefined();
    expect(withNames?.count).toBe(withNames?.inscrits.length);
  });

  it("reconnaît des codes multi-groupes (écriture « & »)", () => {
    expect(slots.some((slot) => slot.codes.length > 1)).toBe(true);
  });

  it("reconnaît les plages bloquées", () => {
    expect(slots.some((slot) => slot.kind === "bloquee")).toBe(true);
  });

  it("extrait une heure de début au format HH:MM", () => {
    const withHour = slots.find((slot) => slot.heure.length > 0);
    expect(withHour?.heure).toMatch(/^\d{1,2}:\d{2}$/);
  });
});

describe("parseGrid — cas limites", () => {
  it("grille vide → aucun créneau", () => {
    expect(parseGrid(fixture("grid-empty.html"), "parc")).toHaveLength(0);
  });

  it("markup dégradé : pas de crash et raccourci « 2.0C&T » développé", () => {
    const slots = parseGrid(fixture("grid-degraded.html"), "patinoire");
    const compact = slots.find((slot) => slot.codes.includes("2.0C"));
    expect(compact?.codes).toEqual(expect.arrayContaining(["2.0C", "2.0T"]));
  });
});
