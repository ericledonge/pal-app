import { isLevelCode, LEVELS } from "../level";

describe("modèle de niveau", () => {
  it("contient exactement les 9 codes", () => {
    expect(LEVELS).toHaveLength(9);
  });

  it("isLevelCode accepte les 9 codes valides", () => {
    for (const code of LEVELS) {
      expect(isLevelCode(code)).toBe(true);
    }
  });

  it("isLevelCode rejette toute valeur hors des 9 codes", () => {
    expect(isLevelCode("5.0C")).toBe(false);
    expect(isLevelCode("3.0")).toBe(false);
    expect(isLevelCode("")).toBe(false);
    expect(isLevelCode(null)).toBe(false);
    expect(isLevelCode(42)).toBe(false);
  });
});
