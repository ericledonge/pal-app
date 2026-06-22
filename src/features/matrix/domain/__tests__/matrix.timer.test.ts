import { formatCountdown } from "../matrix.timer";

describe("formatCountdown", () => {
  it("formate en m:ss", () => {
    expect(formatCountdown(13 * 60_000)).toBe("13:00");
    expect(formatCountdown(90_000)).toBe("1:30");
    expect(formatCountdown(5_000)).toBe("0:05");
  });

  it("borne à 0 et arrondit à la seconde supérieure", () => {
    expect(formatCountdown(-1_000)).toBe("0:00");
    expect(formatCountdown(1_500)).toBe("0:02");
  });
});
