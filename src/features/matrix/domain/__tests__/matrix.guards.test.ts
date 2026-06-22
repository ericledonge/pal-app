import { isMatrixConfig, isMatrixPlayer, isMatrixSession } from "../matrix.service";
import { aMatrixPlayer, aMatrixSession } from "./matrix.builders";

describe("type guards matrice", () => {
  it("isMatrixPlayer accepte un joueur conforme et rejette le reste", () => {
    expect(isMatrixPlayer(aMatrixPlayer())).toBe(true);
    expect(isMatrixPlayer(aMatrixPlayer({ source: "membre" as never }))).toBe(false);
    expect(isMatrixPlayer({ id: "x" })).toBe(false);
    expect(isMatrixPlayer(null)).toBe(false);
  });

  it("isMatrixConfig exige nbTerrains ≥ 1 et durée > 0", () => {
    expect(isMatrixConfig({ nbTerrains: 2, dureeMatchMin: 13 })).toBe(true);
    expect(isMatrixConfig({ nbTerrains: 0, dureeMatchMin: 13 })).toBe(false);
    expect(isMatrixConfig({ nbTerrains: 2, dureeMatchMin: 0 })).toBe(false);
  });

  it("isMatrixSession valide un état relu du stockage", () => {
    expect(isMatrixSession(aMatrixSession())).toBe(true);
    expect(isMatrixSession({ effectif: [{ id: 1 }], config: {}, rounds: [] })).toBe(false);
    expect(isMatrixSession("nope")).toBe(false);
  });
});
