import { parseExample } from "../example.parser";

describe("parseExample", () => {
  it("normalise la charge brute en DTO typé", () => {
    expect(parseExample("  brut  ")).toEqual({ id: "brut", rawLabel: "brut" });
  });
});
