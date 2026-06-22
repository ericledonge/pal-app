import { generateRound, generateRounds } from "../matrix.matchmaking";
import { aMatrixPlayer, someMatrixPlayers } from "./matrix.builders";

const playingIds = (round: { pairings: { equipeA: string[]; equipeB: string[] }[] }): string[] =>
  round.pairings.flatMap((pairing) => [...pairing.equipeA, ...pairing.equipeB]);

describe("generateRound — invariants", () => {
  it("4 joueurs par terrain, aucun doublon, bench = effectif − terrains×4", () => {
    const players = someMatrixPlayers(10);
    const round = generateRound(players, 2, [], 42);
    const playing = playingIds(round);
    expect(round.pairings).toHaveLength(2);
    expect(playing).toHaveLength(8);
    expect(new Set(playing).size).toBe(8);
    expect(round.bench).toHaveLength(2);
    expect(new Set([...playing, ...round.bench]).size).toBe(10);
  });

  it("est déterministe (même seed → même ronde)", () => {
    const players = someMatrixPlayers(8);
    expect(generateRound(players, 2, [], 7)).toEqual(generateRound(players, 2, [], 7));
  });

  it("effectif minimal (4) : un terrain, zéro banc", () => {
    const round = generateRound(someMatrixPlayers(4), 2, [], 1);
    expect(round.pairings).toHaveLength(1);
    expect(round.bench).toHaveLength(0);
  });

  it("effectif insuffisant (<4) : aucune partie", () => {
    const round = generateRound(someMatrixPlayers(3), 1, [], 1);
    expect(round.pairings).toHaveLength(0);
    expect(round.bench).toHaveLength(3);
  });
});

describe("generateRounds — équité et variété", () => {
  it("équité des benchs : écart ≤ 1 sur plusieurs rondes", () => {
    const players = someMatrixPlayers(6); // 1 terrain → 2 au banc par ronde
    const rounds = generateRounds(players, 1, 9, 1);
    const bench = new Map<string, number>();
    for (const round of rounds) {
      for (const id of round.bench) {
        bench.set(id, (bench.get(id) ?? 0) + 1);
      }
    }
    const counts = players.map((player) => bench.get(player.id) ?? 0);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });

  it("variété : aucune paire de partenaires répétée plus de 2 fois sur 6 rondes", () => {
    const players = someMatrixPlayers(8);
    const rounds = generateRounds(players, 2, 6, 3);
    const partner = new Map<string, number>();
    for (const round of rounds) {
      for (const pairing of round.pairings) {
        for (const team of [pairing.equipeA, pairing.equipeB]) {
          const key = [...team].toSorted().join("~");
          partner.set(key, (partner.get(key) ?? 0) + 1);
        }
      }
    }
    expect(Math.max(...partner.values())).toBeLessThanOrEqual(2);
  });
});

describe("modifications en cours de session", () => {
  it("retrait : les rondes suivantes excluent le joueur retiré (historique pris en compte)", () => {
    const players = someMatrixPlayers(8);
    const round1 = generateRound(players, 2, [], 1);
    const remaining = players.filter((player) => player.id !== players[0].id);
    const round2 = generateRound(remaining, 2, [round1], 2);
    const ids2 = [...playingIds(round2), ...round2.bench];
    expect(ids2).not.toContain(players[0].id);
    expect(round1.pairings).toHaveLength(2); // la ronde en cours n'est pas modifiée
  });

  it("ajout : un nouveau joueur entre dans les rondes suivantes", () => {
    const players = someMatrixPlayers(7);
    const round1 = generateRound(players, 1, [], 1);
    const extra = aMatrixPlayer();
    const round2 = generateRound([...players, extra], 1, [round1], 2);
    expect([...playingIds(round2), ...round2.bench]).toContain(extra.id);
  });
});
