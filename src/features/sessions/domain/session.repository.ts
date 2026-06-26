import { useQuery } from "@tanstack/react-query";

import { fetchTodayGrid, fetchTomorrowGrid } from "./session.adapter";
import { parseGrid } from "./session.parser";
import { assertValidGrid } from "./session.service";
import type { Day, CourtArea, Slot } from "./session.types";

const SESSIONS_KEY = ["sessions"] as const;

// Enchaîne fetch HTML → parse → validation. Les erreurs remontent telles quelles :
// HttpError (réseau/HTTP) et GridParseError (parsing) sont distinguables par le consommateur.
const fetchGrid = async (day: Day, courtArea: CourtArea): Promise<Slot[]> => {
  const html =
    day === "today" ? await fetchTodayGrid(courtArea) : await fetchTomorrowGrid(courtArea);
  const slots = assertValidGrid(html, parseGrid(html, courtArea));
  return slots;
};

/** Présences d'un (jour, court area). Clé de cache distincte par combinaison ; staleTime court. */
export const useGrid = (day: Day, courtArea: CourtArea) =>
  useQuery({
    queryKey: [...SESSIONS_KEY, day, courtArea],
    queryFn: () => fetchGrid(day, courtArea),
    staleTime: 30_000, // présences mouvantes : fraîches ~30 s, refetch au focus/reconnect (defaults)
  });
