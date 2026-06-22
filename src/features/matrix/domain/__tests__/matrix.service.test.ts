import { addGuest, addPlayers, mapPresentsToPlayers, removePlayer } from "../matrix.service";
import { aMatrixPlayer } from "./matrix.builders";

describe("mapPresentsToPlayers", () => {
  it("dédoublonne (casse/espaces) et ignore les noms vides", () => {
    const players = mapPresentsToPlayers(["Alice", "  alice  ", "Bob", "", "   "]);
    expect(players.map((player) => player.nom)).toEqual(["Alice", "Bob"]);
    expect(players.every((player) => player.source === "present")).toBe(true);
  });
});

describe("addGuest", () => {
  it("ajoute un invité non dupliqué (source invite)", () => {
    const effectif = mapPresentsToPlayers(["Alice"]);
    const next = addGuest(effectif, "Bob");
    expect(next).toHaveLength(2);
    expect(next[1].source).toBe("invite");
  });

  it("ignore un doublon (nom normalisé) ou un nom vide", () => {
    const effectif = mapPresentsToPlayers(["Alice"]);
    expect(addGuest(effectif, "  alice ")).toHaveLength(1);
    expect(addGuest(effectif, "   ")).toHaveLength(1);
  });
});

describe("addPlayers / removePlayer", () => {
  it("addPlayers n'ajoute pas les présents déjà dans l'effectif", () => {
    const effectif = mapPresentsToPlayers(["Alice"]);
    const more = mapPresentsToPlayers(["Alice", "Bob"]);
    expect(addPlayers(effectif, more).map((player) => player.nom)).toEqual(["Alice", "Bob"]);
  });

  it("removePlayer retire par id", () => {
    const player = aMatrixPlayer();
    expect(removePlayer([player], player.id)).toHaveLength(0);
  });
});
