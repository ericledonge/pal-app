import { createExampleViewModel } from "../example.service";
import { anExampleDto } from "./example.builders";

describe("createExampleViewModel", () => {
  it("transforme le DTO en view model (label en majuscules)", () => {
    const viewModel = createExampleViewModel(anExampleDto({ id: "ex-9", rawLabel: "salut" }));
    expect(viewModel).toEqual({ id: "ex-9", label: "SALUT" });
  });
});
