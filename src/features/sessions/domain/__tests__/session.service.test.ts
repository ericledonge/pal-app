import { assertValidGrid, GridParseError, isValidSlot } from "../session.service";
import { aSlot } from "./session.builders";

describe("isValidSlot", () => {
  it("accepte un Slot conforme", () => {
    expect(isValidSlot(aSlot())).toBe(true);
  });

  it("rejette un code de niveau invalide", () => {
    expect(isValidSlot(aSlot({ codes: ["9.9Z"] as never }))).toBe(false);
  });

  it("rejette un courtArea inconnu", () => {
    expect(isValidSlot(aSlot({ courtArea: "lune" as never }))).toBe(false);
  });

  it("rejette un type de plage inconnu", () => {
    expect(isValidSlot(aSlot({ kind: "autre" as never }))).toBe(false);
  });

  it("rejette une valeur non-objet", () => {
    expect(isValidSlot(null)).toBe(false);
    expect(isValidSlot("x")).toBe(false);
  });
});

describe("assertValidGrid", () => {
  const STRUCTURE = '<div class="RadScheduler"></div>';

  it("laisse passer une grille conforme", () => {
    expect(assertValidGrid(STRUCTURE, [aSlot()])).toHaveLength(1);
  });

  it("distingue une grille vide légitime (structure présente, 0 créneau)", () => {
    expect(assertValidGrid(STRUCTURE, [])).toHaveLength(0);
  });

  it("structure absente → GridParseError", () => {
    expect(() => assertValidGrid("<html><body>oups</body></html>", [])).toThrow(GridParseError);
  });

  it("créneau non conforme → GridParseError", () => {
    expect(() => assertValidGrid(STRUCTURE, [aSlot({ count: "deux" as never })])).toThrow(
      GridParseError,
    );
  });
});
