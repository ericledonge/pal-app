import { areUpdatesBlocked, setUpdatesBlocked, subscribeUpdatesGate } from "../update-gate";

// Le garde-fou est un état module partagé : on repart toujours d'un état libre entre les tests.
afterEach(() => {
  setUpdatesBlocked("a", false);
  setUpdatesBlocked("b", false);
  setUpdatesBlocked("matrix-live", false);
});

describe("areUpdatesBlocked / setUpdatesBlocked", () => {
  it("est libre par défaut", () => {
    expect(areUpdatesBlocked()).toBe(false);
  });

  it("bloque tant qu'une raison est active", () => {
    setUpdatesBlocked("matrix-live", true);
    expect(areUpdatesBlocked()).toBe(true);
    setUpdatesBlocked("matrix-live", false);
    expect(areUpdatesBlocked()).toBe(false);
  });

  it("reste bloqué tant qu'au moins une raison subsiste", () => {
    setUpdatesBlocked("a", true);
    setUpdatesBlocked("b", true);
    setUpdatesBlocked("a", false);
    expect(areUpdatesBlocked()).toBe(true);
    setUpdatesBlocked("b", false);
    expect(areUpdatesBlocked()).toBe(false);
  });

  it("est idempotent par clé (deux activations, une libération suffit)", () => {
    setUpdatesBlocked("a", true);
    setUpdatesBlocked("a", true);
    setUpdatesBlocked("a", false);
    expect(areUpdatesBlocked()).toBe(false);
  });
});

describe("subscribeUpdatesGate", () => {
  it("notifie uniquement aux transitions libre↔bloqué", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeUpdatesGate(listener);

    setUpdatesBlocked("a", true); // libre → bloqué : notifie
    setUpdatesBlocked("b", true); // reste bloqué : pas de notif
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith(true);

    setUpdatesBlocked("a", false); // reste bloqué : pas de notif
    setUpdatesBlocked("b", false); // bloqué → libre : notifie
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenLastCalledWith(false);

    unsubscribe();
    setUpdatesBlocked("a", true);
    expect(listener).toHaveBeenCalledTimes(2); // plus notifié après désabonnement
  });
});
