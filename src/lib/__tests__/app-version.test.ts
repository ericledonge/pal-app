import { formatVersionLabel } from "@/lib/app-version";

// Le module lit des constantes natives au chargement : on neutralise les imports natifs
// pour que la suite ne teste que la logique pure de formatage.
jest.mock("expo-application", () => ({ nativeApplicationVersion: null, nativeBuildVersion: null }));
jest.mock("expo-updates", () => ({ updateId: null }));
jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: null } }));

const UPDATE_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("formatVersionLabel", () => {
  it("affiche version, build et les 6 premiers caractères de l'update id", () => {
    expect(formatVersionLabel("1.0.0", "42", UPDATE_ID)).toBe("1.0.0 (42) - a1b2c3");
  });

  it("omet le build quand il est absent", () => {
    expect(formatVersionLabel("1.0.0", null, UPDATE_ID)).toBe("1.0.0 - a1b2c3");
  });

  it("omet l'extrait d'update id sur un binaire embarqué sans OTA appliquée", () => {
    expect(formatVersionLabel("1.0.0", "42", null)).toBe("1.0.0 (42)");
  });

  it("n'affiche que la version quand build et update id sont absents (dev)", () => {
    expect(formatVersionLabel("1.0.0", undefined, undefined)).toBe("1.0.0");
  });

  it("retombe sur un tiret quand la version est inconnue", () => {
    expect(formatVersionLabel(null, null, null)).toBe("—");
  });
});
