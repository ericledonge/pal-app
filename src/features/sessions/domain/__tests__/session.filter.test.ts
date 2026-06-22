import { LEVELS } from "@/shared/domain/level";

import { isSlotForLevel } from "../session.service";
import { aSlot } from "./session.builders";

describe("isSlotForLevel — règle « mon niveau »", () => {
  it("vrai pour un code exact", () => {
    expect(isSlotForLevel(aSlot({ codes: ["3.0C"] }), "3.0C")).toBe(true);
  });

  it("vrai pour un multi-groupes incluant le niveau", () => {
    expect(isSlotForLevel(aSlot({ codes: ["3.5C", "3.5T"] }), "3.5T")).toBe(true);
  });

  it("faux si le niveau n'est pas dans le créneau", () => {
    expect(isSlotForLevel(aSlot({ codes: ["2.5C"] }), "3.0C")).toBe(false);
  });

  describe("exception asymétrique 4.0C → 3.5T", () => {
    it("un 4.0C voit un créneau 3.5T", () => {
      expect(isSlotForLevel(aSlot({ codes: ["3.5T"] }), "4.0C")).toBe(true);
    });

    it("un 3.5T NE voit PAS un créneau 4.0C (non-réciprocité)", () => {
      expect(isSlotForLevel(aSlot({ codes: ["4.0C"] }), "3.5T")).toBe(false);
    });

    it("aucune autre paire ne bénéficie de l'exception", () => {
      expect(isSlotForLevel(aSlot({ codes: ["3.5C"] }), "4.0C")).toBe(false);
      expect(isSlotForLevel(aSlot({ codes: ["3.0T"] }), "3.5C")).toBe(false);
    });
  });

  it("chacun des 9 codes voit son propre créneau", () => {
    for (const code of LEVELS) {
      expect(isSlotForLevel(aSlot({ codes: [code] }), code)).toBe(true);
    }
  });
});
