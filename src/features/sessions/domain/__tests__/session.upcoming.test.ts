import { createAgendaViewModel, filterUpcomingForDay, isSlotPast } from "../session.service";
import { aSlot } from "./session.builders";

// 26 juin 2026, heure locale fixée pour des comparaisons déterministes.
const at = (h: number, m = 0) => new Date(2026, 5, 26, h, m, 0);

describe("isSlotPast — créneau terminé (heure de fin dépassée)", () => {
  // Builder par défaut : 18:00 – 20:00.
  it("à venir (avant le début) → non passé", () => {
    expect(isSlotPast(aSlot(), at(17))).toBe(false);
  });

  it("en cours (entre début et fin) → non passé", () => {
    expect(isSlotPast(aSlot(), at(19))).toBe(false);
  });

  it("pile à l'heure de fin → non passé (cohérent avec le statut « en cours » de la matrice)", () => {
    expect(isSlotPast(aSlot(), at(20))).toBe(false);
  });

  it("après l'heure de fin → passé", () => {
    expect(isSlotPast(aSlot(), at(20, 1))).toBe(true);
  });

  it("heure de fin absente → durée par défaut de 2 h appliquée", () => {
    const noEnd = aSlot({ heure: "18:00", heureFin: "" });
    expect(isSlotPast(noEnd, at(19, 59))).toBe(false); // fin supposée 20:00
    expect(isSlotPast(noEnd, at(20, 1))).toBe(true);
  });

  it("heure de début illisible → jamais déclaré passé (on ne masque pas faute de pouvoir trancher)", () => {
    expect(isSlotPast(aSlot({ heure: "", heureFin: "" }), at(23, 59))).toBe(false);
  });

  it("créneau franchissant minuit (23:00 – 01:00) → en cours à 23:30, non passé", () => {
    const overnight = aSlot({ heure: "23:00", heureFin: "01:00" });
    expect(isSlotPast(overnight, at(23, 30))).toBe(false);
  });
});

describe("filterUpcomingForDay", () => {
  const morning = aSlot({ heure: "08:00", heureFin: "10:00" });
  const evening = aSlot({ heure: "18:00", heureFin: "20:00" });

  it("« today » : retire les séances terminées, garde celles en cours / à venir", () => {
    const kept = filterUpcomingForDay([morning, evening], "today", at(19));
    expect(kept).toEqual([evening]);
  });

  it("« tomorrow » : ne masque rien (aucune notion de passé pour demain)", () => {
    const kept = filterUpcomingForDay([morning, evening], "tomorrow", at(19));
    expect(kept).toEqual([morning, evening]);
  });

  it("jour non précisé : ne masque rien", () => {
    const kept = filterUpcomingForDay([morning, evening], undefined, at(19));
    expect(kept).toEqual([morning, evening]);
  });

  it("ne mute pas le tableau fourni", () => {
    const input = [morning, evening];
    filterUpcomingForDay(input, "today", at(19));
    expect(input).toEqual([morning, evening]);
  });
});

describe("createAgendaViewModel — masquage des séances passées (today)", () => {
  const morning = aSlot({
    courtArea: "parc",
    heure: "08:00",
    heureFin: "10:00",
    codes: ["3.0C"],
  });
  const evening = aSlot({
    courtArea: "parc",
    heure: "18:00",
    heureFin: "20:00",
    codes: ["3.0C"],
  });

  it("« today » à 19:00 : la séance du matin a disparu, celle du soir reste", () => {
    const vm = createAgendaViewModel([morning, evening], {
      mode: "all",
      myLevel: null,
      day: "today",
      now: at(19),
    });
    const heures = vm.flatMap((section) => section.slots).map((slot) => slot.heure);
    expect(heures).toEqual(["18:00"]);
  });

  it("« today » en soirée tardive : agenda vide (toutes les séances terminées)", () => {
    const vm = createAgendaViewModel([morning, evening], {
      mode: "all",
      myLevel: null,
      day: "today",
      now: at(22),
    });
    expect(vm).toEqual([]);
  });

  it("« tomorrow » : aucune séance masquée quelle que soit l'heure", () => {
    const vm = createAgendaViewModel([morning, evening], {
      mode: "all",
      myLevel: null,
      day: "tomorrow",
      now: at(22),
    });
    expect(vm.flatMap((section) => section.slots)).toHaveLength(2);
  });

  it("sans `day` : comportement inchangé (aucun masquage temporel)", () => {
    const vm = createAgendaViewModel([morning, evening], { mode: "all", myLevel: null });
    expect(vm.flatMap((section) => section.slots)).toHaveLength(2);
  });
});
