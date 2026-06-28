import { renderHook, waitFor } from "@testing-library/react-native";

import type { PersistedMatrix } from "../../domain/matrix-session.storage";
import { readMatrixSession } from "../../domain/matrix-session.storage";
import type { MatrixPlayer, Round } from "../../domain/matrix.types";
import { DEFAULT_MATCH_MINUTES } from "../../domain/matrix.types";
import { useMatrixSession } from "../use-matrix-session";

// On mocke la frontière IO (storage) et l'analytics : aucun module natif (AsyncStorage / Amplitude)
// n'est chargé. La logique pure (matchmaking) reste réelle.
jest.mock("../../domain/matrix-session.storage", () => ({
  readMatrixSession: jest.fn(),
  writeMatrixSession: jest.fn().mockResolvedValue(undefined),
  clearMatrixSession: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("@/lib/analytics", () => ({ trackEvent: jest.fn() }));

const mockedRead = readMatrixSession as jest.MockedFunction<typeof readMatrixSession>;

const aGuest: MatrixPlayer = { id: "invite:zoe", nom: "Zoé", source: "invite" };
const aPresent: MatrixPlayer = { id: "present:alice", nom: "Alice", source: "present" };

const aPersisted = (overrides?: Partial<PersistedMatrix>): PersistedMatrix => ({
  effectif: [aPresent, aGuest],
  config: { nbTerrains: 2, dureeMatchMin: DEFAULT_MATCH_MINUTES },
  rounds: [],
  phase: "config",
  currentIndex: 0,
  ...overrides,
});

afterEach(() => jest.clearAllMocks());

describe("useMatrixSession — reprise / hydratation", () => {
  it("NE restaure PAS l'effectif d'une config persistée (les invités ne collent pas)", async () => {
    mockedRead.mockResolvedValue(aPersisted({ phase: "config", effectif: [aPresent, aGuest] }));

    const { result } = await renderHook(() => useMatrixSession());
    await waitFor(() => expect(result.current.effectif).toEqual([]));

    expect(result.current.phase).toBe("config");
  });

  it("repart avec un effectif vide même si une config était persistée", async () => {
    mockedRead.mockResolvedValue(aPersisted({ phase: "config" }));

    const { result } = await renderHook(() => useMatrixSession());
    await waitFor(() => expect(result.current.phase).toBe("config"));

    expect(result.current.effectif).toHaveLength(0);
    expect(result.current.canStart).toBe(false);
  });

  it("reprend une matrice LIVE avec son effectif et ses rondes", async () => {
    const round: Round = {
      numero: 1,
      pairings: [{ terrain: 1, equipeA: ["a", "b"], equipeB: ["c", "d"] }],
      bench: [],
    };
    mockedRead.mockResolvedValue(
      aPersisted({ phase: "live", effectif: [aPresent, aGuest], rounds: [round], currentIndex: 0 }),
    );

    const { result } = await renderHook(() => useMatrixSession());
    await waitFor(() => expect(result.current.phase).toBe("live"));

    expect(result.current.effectif).toEqual([aPresent, aGuest]);
    expect(result.current.rounds).toEqual([round]);
    expect(result.current.currentRound).toEqual(round);
  });

  it("restaure toujours les préférences (terrains / durée), même en phase config", async () => {
    mockedRead.mockResolvedValue(
      aPersisted({ phase: "config", config: { nbTerrains: 4, dureeMatchMin: 11 } }),
    );

    const { result } = await renderHook(() => useMatrixSession());
    await waitFor(() => expect(result.current.config.nbTerrains).toBe(4));

    expect(result.current.config.dureeMatchMin).toBe(11);
    expect(result.current.effectif).toEqual([]);
  });

  it("part d'un effectif vide quand rien n'est persisté", async () => {
    mockedRead.mockResolvedValue(null);

    const { result } = await renderHook(() => useMatrixSession());
    await waitFor(() => expect(result.current.effectif).toEqual([]));

    expect(result.current.phase).toBe("config");
  });
});
