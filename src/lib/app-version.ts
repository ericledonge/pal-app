import * as Application from "expo-application";
import Constants from "expo-constants";
import * as Updates from "expo-updates";

const UPDATE_ID_PREVIEW_LENGTH = 6;

/**
 * Construit le libellé de version affiché dans le profil.
 * Format complet : `1.0.0 (42) - a1b2c3` — build et extrait d'update id sont optionnels
 * (absents en dev / Expo Go ou sur un binaire embarqué sans OTA appliquée).
 */
export const formatVersionLabel = (
  version: string | null | undefined,
  build: string | null | undefined,
  updateId: string | null | undefined,
): string => {
  const base = version ?? "—";
  const withBuild = build ? `${base} (${build})` : base;
  const shortUpdate = updateId?.slice(0, UPDATE_ID_PREVIEW_LENGTH);
  return shortUpdate ? `${withBuild} - ${shortUpdate}` : withBuild;
};

/** Lit les sources natives (binaire + OTA) et renvoie le libellé prêt à afficher. */
export const getVersionLabel = (): string =>
  formatVersionLabel(
    Application.nativeApplicationVersion ?? Constants.expoConfig?.version,
    Application.nativeBuildVersion,
    Updates.updateId,
  );
