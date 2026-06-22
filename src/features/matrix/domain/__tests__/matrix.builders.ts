import type { MatrixPlayer, MatrixSession } from "../matrix.types";

let counter = 0;

export const aMatrixPlayer = (overrides?: Partial<MatrixPlayer>): MatrixPlayer => {
  counter += 1;
  return { id: `p${counter}`, nom: `Joueur ${counter}`, source: "present", ...overrides };
};

export const someMatrixPlayers = (count: number): MatrixPlayer[] =>
  Array.from({ length: count }, () => aMatrixPlayer());

export const aMatrixSession = (overrides?: Partial<MatrixSession>): MatrixSession => ({
  effectif: someMatrixPlayers(4),
  config: { nbTerrains: 1, dureeMatchMin: 13 },
  rounds: [],
  ...overrides,
});
