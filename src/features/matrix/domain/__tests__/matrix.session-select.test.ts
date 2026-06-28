import { aSlot } from "@/features/sessions/domain/__tests__/session.builders";

import {
  buildSessionWindows,
  createSessionPickerRows,
  selectableSessionRows,
  selectAutoSession,
  sessionStatus,
  type SessionWindow,
} from "../matrix.session-select";

// Heures de référence (minutes depuis minuit) pour une session 18:00 - 20:00 :
// début 1080, fin 1200, début − marge 15 = 1065 (17:45).
const aWindow = (overrides?: Partial<SessionWindow>): SessionWindow => ({
  id: "18:00|3.5T",
  heure: "18:00",
  heureFin: "20:00",
  codes: ["3.5T"],
  labels: [],
  courtAreas: ["parc"],
  players: [],
  ...overrides,
});

describe("buildSessionWindows", () => {
  it("fusionne parc + patinoire d'une même heure/niveau et dédoublonne les inscrits", () => {
    const windows = buildSessionWindows([
      aSlot({ courtArea: "parc", codes: ["3.5T"], inscrits: [{ nom: "Alice" }, { nom: "Bob" }] }),
      aSlot({
        courtArea: "patinoire",
        terrains: ["07"],
        codes: ["3.5T"],
        inscrits: [{ nom: "bob" }, { nom: "Carl" }],
      }),
    ]);

    expect(windows).toHaveLength(1);
    expect(windows[0].courtAreas).toEqual(["parc", "patinoire"]);
    expect(windows[0].players.map((player) => player.nom)).toEqual(["Alice", "Bob", "Carl"]);
  });

  it("sépare les niveaux distincts d'une même heure en fenêtres distinctes", () => {
    const windows = buildSessionWindows([aSlot({ codes: ["3.5T"] }), aSlot({ codes: ["3.0C"] })]);
    expect(windows).toHaveLength(2);
  });

  it("trie les fenêtres par heure croissante", () => {
    const windows = buildSessionWindows([
      aSlot({ heure: "20:00", codes: ["3.5T"] }),
      aSlot({ heure: "08:00", codes: ["3.5T"] }),
    ]);
    expect(windows.map((window) => window.heure)).toEqual(["08:00", "20:00"]);
  });

  it("trie numériquement les heures sans zéro initial (« 9:00 » avant « 18:00 »)", () => {
    const windows = buildSessionWindows([
      aSlot({ heure: "18:00", codes: ["3.5T"] }),
      aSlot({ heure: "9:00", codes: ["3.5T"] }),
    ]);
    expect(windows.map((window) => window.heure)).toEqual(["9:00", "18:00"]);
  });

  it("conserve un jeu libre (codes vides) comme fenêtre", () => {
    const windows = buildSessionWindows([aSlot({ codes: [], labels: ["Jeu libre public"] })]);
    expect(windows).toHaveLength(1);
    expect(windows[0].codes).toEqual([]);
    expect(windows[0].labels).toEqual(["Jeu libre public"]);
  });
});

describe("sessionStatus — marge de 15 min", () => {
  it("en cours pendant la plage", () => {
    expect(sessionStatus(aWindow(), 1100)).toBe("en-cours"); // 18:20
  });

  it("en cours dès 14 min avant le début (dans la marge)", () => {
    expect(sessionStatus(aWindow(), 1066)).toBe("en-cours"); // 17:46
  });

  it("encore à venir à 16 min avant le début (hors marge)", () => {
    expect(sessionStatus(aWindow(), 1064)).toBe("a-venir"); // 17:44
  });

  it("passée après l'heure de fin", () => {
    expect(sessionStatus(aWindow(), 1201)).toBe("passee"); // 20:01
  });

  it("durée par défaut de 2 h quand l'heure de fin est absente", () => {
    const window = aWindow({ heureFin: "" });
    expect(sessionStatus(window, 1200)).toBe("en-cours"); // 20:00, 18:00 + 2 h
    expect(sessionStatus(window, 1201)).toBe("passee");
  });

  it("gère un créneau passant minuit (fin < début)", () => {
    const window = aWindow({ heure: "23:00", heureFin: "01:00" }); // début 1380, fin 60 → 1500
    expect(sessionStatus(window, 1410)).toBe("en-cours"); // 23:30
    expect(sessionStatus(window, 1300)).toBe("a-venir"); // 21:40, avant 22:45 (début − marge)
  });
});

describe("selectAutoSession", () => {
  const morning = aWindow({ id: "08:00|3.5T", heure: "08:00", heureFin: "10:00" });
  const evening = aWindow({ id: "18:00|3.5T", heure: "18:00", heureFin: "20:00" });

  it("retourne la session en cours du calibre", () => {
    const picked = selectAutoSession([morning, evening], "3.5T", 1100); // 18:20
    expect(picked?.id).toBe("18:00|3.5T");
  });

  it("retourne la prochaine session à venir quand aucune n'est en cours", () => {
    const picked = selectAutoSession([morning, evening], "3.5T", 900); // 15:00
    expect(picked?.id).toBe("18:00|3.5T");
  });

  it("retourne null quand toutes les sessions sont passées", () => {
    const picked = selectAutoSession([morning, evening], "3.5T", 1400); // 23:20
    expect(picked).toBeNull();
  });

  it("retourne null quand aucune session ne concerne le calibre", () => {
    const picked = selectAutoSession([aWindow({ codes: ["2.5C"] })], "3.5T", 1100);
    expect(picked).toBeNull();
  });

  it("ignore les jeux libres (sans calibre) pour la détection auto", () => {
    const freePlay = aWindow({ id: "18:00|", codes: [], labels: ["Jeu libre"] });
    expect(selectAutoSession([freePlay], "3.5T", 1100)).toBeNull();
  });

  describe("exception asymétrique 4.0C → 3.5T", () => {
    it("un 4.0C est rattaché à une session 3.5T", () => {
      const picked = selectAutoSession([aWindow({ codes: ["3.5T"] })], "4.0C", 1100);
      expect(picked?.codes).toEqual(["3.5T"]);
    });

    it("privilégie la session 4.0C exacte quand les deux coexistent à la même heure", () => {
      const exact = aWindow({ id: "18:00|4.0C", codes: ["4.0C"] });
      const asym = aWindow({ id: "18:00|3.5T", codes: ["3.5T"] });
      const picked = selectAutoSession([asym, exact], "4.0C", 1100);
      expect(picked?.id).toBe("18:00|4.0C");
    });
  });
});

describe("createSessionPickerRows", () => {
  it("formate horaire, niveau, lieu et statut pour chaque fenêtre", () => {
    const rows = createSessionPickerRows(
      [
        aWindow({
          codes: ["3.5C", "3.5T"],
          courtAreas: ["parc", "patinoire"],
          players: [{ id: "present:a", nom: "Alice", source: "present" }],
        }),
      ],
      1100,
    );
    expect(rows[0]).toMatchObject({
      horaire: "18:00 - 20:00",
      niveauLabel: "3.5C & 3.5T",
      lieuLabel: "Parc · Patinoire",
      count: 1,
      status: "en-cours",
      statusLabel: "En cours",
    });
  });

  it("affiche le libellé du jeu libre quand il n'y a pas de code", () => {
    const rows = createSessionPickerRows(
      [aWindow({ codes: [], labels: ["Jeu libre public"] })],
      1100,
    );
    expect(rows[0].niveauLabel).toBe("Jeu libre public");
  });
});

describe("selectableSessionRows", () => {
  it("masque les sessions passées, garde celles en cours ou à venir", () => {
    const rows = createSessionPickerRows(
      [
        aWindow({ id: "08:00|3.5T", heure: "08:00", heureFin: "10:00" }), // passée à 18:20
        aWindow({ id: "18:00|3.5T", heure: "18:00", heureFin: "20:00" }), // en cours à 18:20
        aWindow({ id: "21:00|3.5T", heure: "21:00", heureFin: "23:00" }), // à venir à 18:20
      ],
      1100, // 18:20
    );

    const selectable = selectableSessionRows(rows);

    expect(selectable.map((row) => row.id)).toEqual(["18:00|3.5T", "21:00|3.5T"]);
    expect(selectable.every((row) => row.status !== "passee")).toBe(true);
  });

  it("retourne une liste vide quand toutes les sessions sont passées", () => {
    const rows = createSessionPickerRows(
      [aWindow({ id: "08:00|3.5T", heure: "08:00", heureFin: "10:00" })],
      1100, // 18:20
    );
    expect(selectableSessionRows(rows)).toEqual([]);
  });
});
