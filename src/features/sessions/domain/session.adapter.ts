import { httpGet } from "@/lib/http";

import { PLATEAU_URLS } from "./session.constants";
import type { Plateau } from "./session.types";

// Frontière IO : renvoie le HTML brut de la grille. Aucun parsing ici.

/** « Aujourd'hui » : simple GET sur l'URL du plateau. */
export const fetchTodayGrid = async (plateau: Plateau): Promise<string> => {
  const { body } = await httpGet(PLATEAU_URLS[plateau]);
  return body;
};
