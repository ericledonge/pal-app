import { createAgendaViewModel } from "../session.service";
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

describe("createAgendaViewModel", () => {
  it("mode « Tous » : groupé parc→patinoire, trié par heure, sans noms", () => {
    const vm = createAgendaViewModel(SLOTS, { mode: "all", myLevel: null });
    expect(vm.map((section) => section.courtArea)).toEqual(["parc", "patinoire"]);
    expect(vm[0].slots.map((slot) => slot.heure)).toEqual(["08:00", "18:00"]);
    expect(vm.flatMap((section) => section.slots).every((slot) => slot.inscrits.length === 0)).toBe(
      true,
    );
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
});
