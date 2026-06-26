import { act, renderHook } from "@testing-library/react-native";
import * as Updates from "expo-updates";
import { AppState, type AppStateStatus } from "react-native";

import { setUpdatesBlocked } from "../update-gate";
import { useAutoUpdate } from "../use-auto-update";

// __esModule: true → `import * as Updates` pointe sur ce même objet (pas une copie), donc muter
// `updates.isEnabled` depuis le test affecte bien ce que le hook lit.
jest.mock("expo-updates", () => ({
  __esModule: true,
  isEnabled: true,
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

// Évite Sentry et le bruit console pendant les tests.
jest.mock("@/lib/logger", () => ({
  logger: { error: jest.fn(), info: jest.fn(), warn: jest.fn() },
}));

const updates = Updates as unknown as {
  isEnabled: boolean;
  checkForUpdateAsync: jest.Mock;
  fetchUpdateAsync: jest.Mock;
  reloadAsync: jest.Mock;
};

// Handler AppState enregistré par le hook, capturé pour le déclencher à la demande.
let appStateHandler: ((state: AppStateStatus) => void) | undefined;

const T0 = 10_000_000; // base de temps élevée : la 1re vérification passe le throttle (lastCheck = 0).

beforeEach(() => {
  jest.clearAllMocks();
  updates.isEnabled = true;
  updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: true });
  updates.fetchUpdateAsync.mockResolvedValue({ isNew: true });
  updates.reloadAsync.mockResolvedValue(undefined);

  appStateHandler = undefined;
  jest.spyOn(AppState, "addEventListener").mockImplementation((_type, handler) => {
    appStateHandler = handler as (state: AppStateStatus) => void;
    return { remove: jest.fn() };
  });

  jest.spyOn(Date, "now").mockReturnValue(T0);
});

afterEach(() => {
  setUpdatesBlocked("matrix-live", false);
  jest.restoreAllMocks();
});

// Monte le hook et draine les chaînes de promesses déclenchées par l'effet.
const mountHook = async () => {
  await act(async () => {
    renderHook(() => useAutoUpdate());
  });
  await flushPromises();
};

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const foreground = async () => {
  await act(async () => {
    appStateHandler?.("active");
  });
  await flushPromises();
};

describe("useAutoUpdate", () => {
  it("au montage : télécharge la MAJ disponible mais ne recharge pas", async () => {
    await mountHook();

    expect(updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);
    expect(updates.fetchUpdateAsync).toHaveBeenCalledTimes(1);
    expect(updates.reloadAsync).not.toHaveBeenCalled();
  });

  it("ne fait rien si les updates sont désactivées (dev / Expo Go)", async () => {
    updates.isEnabled = false;
    await mountHook();

    expect(updates.checkForUpdateAsync).not.toHaveBeenCalled();
    expect(AppState.addEventListener).not.toHaveBeenCalled();
    expect(updates.reloadAsync).not.toHaveBeenCalled();
  });

  it("au retour au premier plan : applique (reload) la MAJ téléchargée", async () => {
    await mountHook();
    expect(updates.reloadAsync).not.toHaveBeenCalled();

    await foreground();

    expect(updates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it("ne recharge pas pendant une matrice live, puis recharge dès sa fin", async () => {
    await mountHook();

    // Matrice live : bloque l'application.
    await act(async () => {
      setUpdatesBlocked("matrix-live", true);
    });
    await foreground();
    expect(updates.reloadAsync).not.toHaveBeenCalled();

    // Fin de matrice : la MAJ en attente s'applique aussitôt.
    await act(async () => {
      setUpdatesBlocked("matrix-live", false);
    });
    await flushPromises();
    expect(updates.reloadAsync).toHaveBeenCalledTimes(1);
  });

  it("limite les vérifications réseau (throttle) entre deux premiers plans rapprochés", async () => {
    await mountHook();
    expect(updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);

    // Moins de 5 min plus tard : pas de nouvelle vérification réseau.
    (Date.now as jest.Mock).mockReturnValue(T0 + 200_000);
    await foreground();
    expect(updates.checkForUpdateAsync).toHaveBeenCalledTimes(1);

    // Plus de 5 min plus tard : nouvelle vérification.
    (Date.now as jest.Mock).mockReturnValue(T0 + 400_000);
    await foreground();
    expect(updates.checkForUpdateAsync).toHaveBeenCalledTimes(2);
  });

  it("ne télécharge pas s'il n'y a pas de MAJ disponible", async () => {
    updates.checkForUpdateAsync.mockResolvedValue({ isAvailable: false });
    await mountHook();

    expect(updates.fetchUpdateAsync).not.toHaveBeenCalled();
    expect(updates.reloadAsync).not.toHaveBeenCalled();
  });
});
