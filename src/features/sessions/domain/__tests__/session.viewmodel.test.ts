import { createAgendaViewModel, type GetSlotWeather } from "../session.service";
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
