import { useQuery } from "@tanstack/react-query";

import { fetchTodayGrid, fetchTomorrowGrid } from "./session.adapter";
import { parseGrid } from "./session.parser";
import { assertValidGrid } from "./session.service";
import type { Day, Plateau, Slot } from "./session.types";

const SESSIONS_KEY = ["sessions"] as const;

// Enchaîne fetch HTML → parse → validation. Les erreurs remontent telles quelles :
// HttpError (réseau/HTTP) et GridParseError (parsing) sont distinguables par le consommateur.
const fetchGrid = async (day: Day, plateau: Plateau): Promise<Slot[]> => {
  const html = day === "today" ? await fetchTodayGrid(plateau) : await fetchTomorrowGrid(plateau);
  return assertValidGrid(html, parseGrid(html, plateau));
};

/** Présences d'un (jour, plateau). Clé de cache distincte par combinaison ; staleTime court. */
export const useGrid = (day: Day, plateau: Plateau) =>
  useQuery({
    queryKey: [...SESSIONS_KEY, day, plateau],
    queryFn: () => fetchGrid(day, plateau),
    staleTime: 30_000, // présences mouvantes : fraîches ~30 s, refetch au focus/reconnect (defaults)
  });
