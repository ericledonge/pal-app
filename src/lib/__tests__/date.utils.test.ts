import { nowMinutes, toMinutes } from "../date.utils";

describe("toMinutes", () => {
  it("convertit une heure « HH:MM » en minutes depuis minuit", () => {
    expect(toMinutes("00:00")).toBe(0);
    expect(toMinutes("18:30")).toBe(1110);
    expect(toMinutes("23:59")).toBe(1439);
  });

  it("tolère un format à un chiffre et les espaces", () => {
    expect(toMinutes("9:05")).toBe(545);
    expect(toMinutes("  18:00 ")).toBe(1080);
  });

  it("retourne null pour une valeur non exploitable", () => {
    expect(toMinutes("")).toBeNull();
    expect(toMinutes("midi")).toBeNull();
    expect(toMinutes("24:00")).toBeNull();
    expect(toMinutes("18:60")).toBeNull();
  });
});

describe("nowMinutes", () => {
  it("retourne les minutes depuis minuit de l'instant fourni", () => {
    expect(nowMinutes(new Date(2026, 5, 24, 18, 30))).toBe(1110);
  });
});
