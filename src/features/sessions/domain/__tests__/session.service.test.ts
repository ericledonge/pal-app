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
  // Grille vide LÉGITIME : coquille RadScheduler + ClientState présent mais sans appointment.
  const STRUCTURE =
    '<div class="RadScheduler"></div><script>var s={"resources":"[]","appointments":"[]"};</script>';

  it("laisse passer une grille conforme", () => {
    expect(assertValidGrid(STRUCTURE, [aSlot()])).toHaveLength(1);
  });

  it("distingue une grille vide légitime (ClientState présent, 0 créneau)", () => {
    expect(assertValidGrid(STRUCTURE, [])).toHaveLength(0);
  });

  it("structure totalement absente → GridParseError", () => {
    expect(() => assertValidGrid("<html><body>oups</body></html>", [])).toThrow(GridParseError);
  });

  it("coquille DOM présente mais ClientState absent → GridParseError (casse détectée)", () => {
    // Régression visée : sans cette garde, une casse du format passerait pour une grille vide.
    expect(() => assertValidGrid('<div class="RadScheduler"></div>', [])).toThrow(GridParseError);
  });

  it("ClientState présent mais JSON corrompu → GridParseError (et non vide silencieux)", () => {
    const corrupt = '<div class="RadScheduler"></div><script>var s={"appointments":"[{"};</script>';
    expect(() => assertValidGrid(corrupt, [])).toThrow(GridParseError);
  });

  it("créneau non conforme → GridParseError", () => {
    expect(() => assertValidGrid(STRUCTURE, [aSlot({ count: "deux" as never })])).toThrow(
      GridParseError,
    );
  });
});
