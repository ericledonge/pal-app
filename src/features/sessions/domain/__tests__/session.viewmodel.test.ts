import { createAgendaViewModel, formatDayDate, type GetSlotWeather } from "../session.service";
import { aSlot } from "./session.builders";

const SLOTS = [
  aSlot({
    courtArea: "patinoire",
    heure: "20:00",
    codes: ["3.5T"],
    inscrits: [{ nom: "Ana" }],
    count: 1,
  }),
  aSlot({
    courtArea: "parc",
    heure: "18:00",
    codes: ["3.0C"],
    inscrits: [{ nom: "Bo" }, { nom: "Cy" }],
    count: 2,
  }),
  aSlot({ courtArea: "parc", heure: "08:00", codes: ["4.0C"], inscrits: [], count: 0 }),
];

// Stub de météo injectée : encode l'heure reçue pour vérifier qu'elle est bien transmise.
const stubWeather: GetSlotWeather = (heure) => ({
  apparentTemperatureLabel: `${heure} 21°`,
  precipitationLabel: "30 %",
  precipitationProbability: 30,
  precipitationSeverity: "normal",
  precipitationMmLabel: "0 mm",
  windLabel: "5 km/h",
  windSeverity: "normal",
  a11yLabel: "x",
});

describe("createAgendaViewModel", () => {
  it("mode « Tous » : groupé parc→patinoire, trié par heure, inscrits inclus", () => {
    const vm = createAgendaViewModel(SLOTS, { mode: "all", myLevel: null });
    expect(vm.map((section) => section.courtArea)).toEqual(["parc", "patinoire"]);
    expect(vm[0].slots.map((slot) => slot.heure)).toEqual(["08:00", "18:00"]);
    const slots = vm.flatMap((section) => section.slots);
    expect(slots.find((slot) => slot.heure === "18:00")?.inscrits).toEqual(["Bo", "Cy"]);
    expect(slots.find((slot) => slot.heure === "20:00")?.inscrits).toEqual(["Ana"]);
  });

  it("mode « Mon niveau » : filtre par niveau et inclut les inscrits", () => {
    const vm = createAgendaViewModel(SLOTS, { mode: "myLevel", myLevel: "3.0C" });
    const slots = vm.flatMap((section) => section.slots);
    expect(slots).toHaveLength(1);
    expect(slots[0].levelLabel).toBe("3.0C");
    expect(slots[0].inscrits).toEqual(["Bo", "Cy"]);
  });

  it("applique l'exception 4.0C → 3.5T", () => {
    const vm = createAgendaViewModel(SLOTS, { mode: "myLevel", myLevel: "4.0C" });
    const labels = vm
      .flatMap((section) => section.slots)
      .map((slot) => slot.levelLabel)
      .toSorted();
    expect(labels).toEqual(["3.5T", "4.0C"]);
  });

  it("attache la météo (par heure de début) quand getWeather est fourni", () => {
    const vm = createAgendaViewModel(SLOTS, {
      mode: "all",
      myLevel: null,
      getWeather: stubWeather,
    });
    const slots = vm.flatMap((section) => section.slots);
    expect(slots.every((slot) => slot.weather !== undefined)).toBe(true);
    expect(slots[0].weather?.apparentTemperatureLabel).toBe(`${slots[0].heure} 21°`);
  });

  it("laisse weather indéfini quand getWeather n'est pas fourni", () => {
    const vm = createAgendaViewModel(SLOTS, { mode: "all", myLevel: null });
    expect(vm.flatMap((section) => section.slots).every((slot) => slot.weather === undefined)).toBe(
      true,
    );
  });
});

describe("createAgendaViewModel — plage subdivisée (deux niveaux sur des courts distincts)", () => {
  // Même court area + même horaire, deux séances : 4.0C sur 01–03, 2.0C/2.0T sur 04–06.
  const SUBDIVIDED = [
    aSlot({ courtArea: "parc", heure: "12:00", codes: ["4.0C"], terrains: ["01", "02", "03"] }),
    aSlot({
      courtArea: "parc",
      heure: "12:00",
      codes: ["2.0C", "2.0T"],
      terrains: ["04", "05", "06"],
    }),
  ];

  it("mode « Tous » + mon niveau 4.0C : une seule carte (4.0C), courts 01–03", () => {
    const vm = createAgendaViewModel(SUBDIVIDED, { mode: "all", myLevel: "4.0C" });
    const slots = vm.flatMap((section) => section.slots);
    expect(slots).toHaveLength(1);
    expect(slots[0].levelLabel).toBe("4.0C");
    expect(slots[0].terrains).toEqual(["01", "02", "03"]);
  });

  it("mode « Tous » + mon niveau 2.0C : ne garde que la séance 2.0C/2.0T, courts 04–06", () => {
    const vm = createAgendaViewModel(SUBDIVIDED, { mode: "all", myLevel: "2.0C" });
    const slots = vm.flatMap((section) => section.slots);
    expect(slots).toHaveLength(1);
    expect(slots[0].terrains).toEqual(["04", "05", "06"]);
  });

  it("mode « Tous » + niveau ne correspondant à aucune séance (3.0C) : garde les deux", () => {
    const vm = createAgendaViewModel(SUBDIVIDED, { mode: "all", myLevel: "3.0C" });
    expect(vm.flatMap((section) => section.slots)).toHaveLength(2);
  });

  it("mode « Tous » sans niveau choisi : garde les deux séances", () => {
    const vm = createAgendaViewModel(SUBDIVIDED, { mode: "all", myLevel: null });
    expect(vm.flatMap((section) => section.slots)).toHaveLength(2);
  });

  it("mode « Mon niveau » 4.0C : le filtre ne laisse que la séance 4.0C", () => {
    const vm = createAgendaViewModel(SUBDIVIDED, { mode: "myLevel", myLevel: "4.0C" });
    const slots = vm.flatMap((section) => section.slots);
    expect(slots).toHaveLength(1);
    expect(slots[0].terrains).toEqual(["01", "02", "03"]);
  });

  it("une séance « jeu libre » (sans code) ne masque PAS une vraie séance de niveau", () => {
    // Plage subdivisée : séance 2.0C (avec inscrits) + jeu libre. Joueur 3.0C en mode « Tous ».
    const withJeuLibre = [
      aSlot({ courtArea: "parc", heure: "12:00", codes: ["2.0C"], terrains: ["01", "02", "03"] }),
      aSlot({
        courtArea: "parc",
        heure: "12:00",
        codes: [],
        labels: ["Jeu libre public"],
        terrains: ["04", "05", "06"],
        inscrits: [],
        count: 0,
      }),
    ];
    const vm = createAgendaViewModel(withJeuLibre, { mode: "all", myLevel: "3.0C" });
    // Les DEUX séances sont conservées (aucun code ne correspond → on ne masque rien).
    expect(vm.flatMap((section) => section.slots)).toHaveLength(2);
  });

  it("mode « Tous » : l'asymétrie 4.0C→3.5T ne masque pas une séance d'un autre niveau", () => {
    // Plage subdivisée 3.5T + 3.0C, joueur 4.0C. 4.0C n'a aucun code exact ici → garder les deux
    // (et NON ne montrer que 3.5T via l'asymétrie, ce qui cacherait la séance 3.0C voisine).
    const subdivided = [
      aSlot({ courtArea: "parc", heure: "12:00", codes: ["3.5T"], terrains: ["01", "02", "03"] }),
      aSlot({ courtArea: "parc", heure: "12:00", codes: ["3.0C"], terrains: ["04", "05", "06"] }),
    ];
    const vm = createAgendaViewModel(subdivided, { mode: "all", myLevel: "4.0C" });
    expect(vm.flatMap((section) => section.slots)).toHaveLength(2);
  });
});

describe("formatDayDate", () => {
  // 26 juin 2026 = un vendredi (heure locale).
  const friday = new Date(2026, 5, 26);

  it("« today » : date du jour, première lettre en majuscule (fr-CA)", () => {
    expect(formatDayDate("today", friday)).toBe("Vendredi 26 juin");
  });

  it("« tomorrow » : jour suivant", () => {
    expect(formatDayDate("tomorrow", friday)).toBe("Samedi 27 juin");
  });

  it("« tomorrow » franchit la fin de mois", () => {
    expect(formatDayDate("tomorrow", new Date(2026, 5, 30))).toBe("Mercredi 1 juillet");
  });

  it("ne mute pas la date fournie", () => {
    const now = new Date(2026, 5, 26);
    formatDayDate("tomorrow", now);
    expect(now.getDate()).toBe(26);
  });
});
