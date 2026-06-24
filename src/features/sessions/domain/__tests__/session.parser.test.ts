import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseGrid } from "../session.parser";

const fixture = (name: string): string => readFileSync(join(__dirname, "fixtures", name), "utf-8");

describe("parseGrid — modèle réel (un créneau par groupe horaire)", () => {
  const slots = parseGrid(fixture("grid-parc-real.html"), "parc");

  it("assemble un créneau par groupe (Réservée/Libre/vide exclus)", () => {
    // Blocs A, B, C, D (codes) + G (jeu libre) → 5 créneaux ;
    // Réservée (E), plage Libre (F) et « N libres » vide non attribué (H) ne sont pas des séances.
    expect(slots).toHaveLength(5);
  });

  it("rattache le plateau passé en paramètre et le type « groupe »", () => {
    expect(slots.every((slot) => slot.plateau === "parc" && slot.kind === "groupe")).toBe(true);
  });

  it("regroupe code (cartes Bloquée) et roster (carte « N libres ») d'un même horaire", () => {
    const a = slots.find((slot) => slot.heure === "08:00");
    expect(a?.codes).toEqual(["3.5T"]);
    expect(a?.count).toBe(3);
    expect(a?.inscrits.map((r) => r.nom)).toEqual(["Alice Tremblay", "Bob Roy", "Claire Gagnon"]);
  });

  it("ne duplique pas un groupe par court bloqué (plusieurs Bloquée → 1 créneau)", () => {
    expect(slots.filter((slot) => slot.heure === "08:00")).toHaveLength(1);
  });

  it("reconnaît les codes multi-groupes « 2.5C & 2.5T »", () => {
    const b = slots.find((slot) => slot.heure === "20:00");
    expect(b?.codes).toEqual(expect.arrayContaining(["2.5C", "2.5T"]));
  });

  it("normalise la casse des codes (« 3.5c » → « 3.5C »)", () => {
    const d = slots.find((slot) => slot.heure === "18:00");
    expect(d?.codes).toEqual(expect.arrayContaining(["3.0T", "3.5C"]));
  });

  it("gère « Complet » : code présent, 0 inscrit listé", () => {
    const c = slots.find((slot) => slot.heure === "12:00");
    expect(c?.codes).toEqual(["2.5T"]);
    expect(c?.count).toBe(0);
  });

  it("émet une séance de jeu libre (Bloquée sans code) avec son libellé et 0 code", () => {
    const g = slots.find((slot) => slot.heure === "21:00");
    expect(g?.codes).toEqual([]);
    expect(g?.labels).toContain("Jeu ouvert abonnés");
    expect(g?.inscrits.map((r) => r.nom)).toEqual(["Gaston Provost"]);
  });

  it("ignore un créneau « N libres » non attribué (ni code, ni nom, ni libellé)", () => {
    expect(slots.find((slot) => slot.heure === "22:00")).toBeUndefined();
  });

  it("n'invente pas d'inscrit à partir d'un code (« 3.5T » n'est pas un nom)", () => {
    const names = slots.flatMap((slot) => slot.inscrits.map((r) => r.nom));
    expect(names).not.toContain("3.5T");
  });

  it("ignore les réservations individuelles (sans code de niveau)", () => {
    const names = slots.flatMap((slot) => slot.inscrits.map((r) => r.nom));
    expect(names).not.toContain("Jean Privé");
  });

  it("extrait une heure de début au format HH:MM", () => {
    expect(slots.every((slot) => /^\d{1,2}:\d{2}$/.test(slot.heure))).toBe(true);
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
