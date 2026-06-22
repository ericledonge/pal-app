import type { MatrixPlayer, Pairing, Round } from "./matrix.types";

// Algorithme de matchmaking en double — pur et déterministe (seed injectable).
// Joueurs interchangeables (aucune pondération par niveau). Génère la PROCHAINE ronde à la volée
// à partir de l'historique : rotation des partenaires/adversaires + répartition équitable des benchs.

const createRng = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffled = <T>(items: T[], rng: () => number): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pairKey = (a: string, b: string): string => [a, b].toSorted().join("~");

interface History {
  partner: Map<string, number>;
  opponent: Map<string, number>;
  bench: Map<string, number>;
}

const bump = (map: Map<string, number>, key: string): void => {
  map.set(key, (map.get(key) ?? 0) + 1);
};

const tally = (rounds: Round[]): History => {
  const partner = new Map<string, number>();
  const opponent = new Map<string, number>();
  const bench = new Map<string, number>();
  for (const round of rounds) {
    for (const id of round.bench) {
      bump(bench, id);
    }
    for (const pairing of round.pairings) {
      bump(partner, pairKey(pairing.equipeA[0], pairing.equipeA[1]));
      bump(partner, pairKey(pairing.equipeB[0], pairing.equipeB[1]));
      for (const a of pairing.equipeA) {
        for (const b of pairing.equipeB) {
          bump(opponent, pairKey(a, b));
        }
      }
    }
  }
  return { partner, opponent, bench };
};

// Parmi 4 joueurs, choisit le découpage en 2 équipes minimisant les répétitions de partenaires
// (poids fort) puis d'adversaires (poids faible).
const splitFour = (four: string[], history: History): Pick<Pairing, "equipeA" | "equipeB"> => {
  const [a, b, c, d] = four;
  const options: [[string, string], [string, string]][] = [
    [
      [a, b],
      [c, d],
    ],
    [
      [a, c],
      [b, d],
    ],
    [
      [a, d],
      [b, c],
    ],
  ];
  const partner = (x: string, y: string) => history.partner.get(pairKey(x, y)) ?? 0;
  const opponentCost = (t1: [string, string], t2: [string, string]) =>
    t1.reduce(
      (sum, x) => sum + t2.reduce((acc, y) => acc + (history.opponent.get(pairKey(x, y)) ?? 0), 0),
      0,
    );

  let best = options[0];
  let bestCost = Number.POSITIVE_INFINITY;
  for (const [t1, t2] of options) {
    const cost = (partner(t1[0], t1[1]) + partner(t2[0], t2[1])) * 10 + opponentCost(t1, t2);
    if (cost < bestCost) {
      bestCost = cost;
      best = [t1, t2];
    }
  }
  return { equipeA: best[0], equipeB: best[1] };
};

/** Génère la prochaine ronde à partir de l'historique. */
export const generateRound = (
  effectif: MatrixPlayer[],
  nbTerrains: number,
  history: Round[] = [],
  seed: number = history.length + 1,
): Round => {
  const counts = tally(history);
  const courtsUsed = Math.min(nbTerrains, Math.floor(effectif.length / 4));
  const playingCount = courtsUsed * 4;
  const rng = createRng(seed);

  // Banc équitable : on assoit ceux qui ont le moins bénéficié du banc (tiebreak seedé) ; les autres jouent.
  const ordered = shuffled(effectif, rng).toSorted(
    (x, y) => (counts.bench.get(x.id) ?? 0) - (counts.bench.get(y.id) ?? 0),
  );
  const benchPlayers = ordered.slice(0, effectif.length - playingCount);
  const playing = shuffled(ordered.slice(effectif.length - playingCount), rng);

  const pairings: Pairing[] = [];
  for (let court = 0; court < courtsUsed; court += 1) {
    const four = playing.slice(court * 4, court * 4 + 4).map((player) => player.id);
    pairings.push({ terrain: court + 1, ...splitFour(four, counts) });
  }

  return {
    numero: history.length + 1,
    pairings,
    bench: benchPlayers.map((player) => player.id),
  };
};

/** Génère `count` rondes successives (pratique pour tester variété et équité). */
export const generateRounds = (
  effectif: MatrixPlayer[],
  nbTerrains: number,
  count: number,
  baseSeed = 1,
): Round[] => {
  const rounds: Round[] = [];
  for (let index = 0; index < count; index += 1) {
    rounds.push(generateRound(effectif, nbTerrains, rounds, baseSeed + index));
  }
  return rounds;
};
