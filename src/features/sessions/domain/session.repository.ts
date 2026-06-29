import { useQuery } from "@tanstack/react-query";

import { logger } from "@/lib/logger";

import { fetchTodayGrid, fetchTomorrowGrid } from "./session.adapter";
import { parseGrid } from "./session.parser";
import { assertValidGrid, GridParseError } from "./session.service";
import type { Day, CourtArea, Slot } from "./session.types";

const SESSIONS_KEY = ["sessions"] as const;

// Enchaîne fetch HTML → parse → validation. Les erreurs remontent telles quelles :
// HttpError (réseau/HTTP) et GridParseError (parsing) sont distinguables par le consommateur.
// Une GridParseError signale une CASSE DU PARSER (format HTML du site changé) : on la remonte à
// Sentry ici, à la frontière IO, avant de la relancer — c'est le levier de détection à distance.
const fetchGrid = async (day: Day, courtArea: CourtArea): Promise<Slot[]> => {
  const html =
    day === "today" ? await fetchTodayGrid(courtArea) : await fetchTomorrowGrid(courtArea);
  try {
    return assertValidGrid(html, parseGrid(html, courtArea));
  } catch (error) {
    if (error instanceof GridParseError) {
      logger.error(error, { day, courtArea });
    }
    throw error;
  }
};

/** Présences d'un (jour, court area). Clé de cache distincte par combinaison ; staleTime court. */
export const useGrid = (day: Day, courtArea: CourtArea) =>
  useQuery({
    queryKey: [...SESSIONS_KEY, day, courtArea],
    queryFn: () => fetchGrid(day, courtArea),
    staleTime: 30_000, // présences mouvantes : fraîches ~30 s, refetch au focus/reconnect (defaults)
    // Une casse du parser ne se répare pas en réessayant le même HTML : échec immédiat (et une seule
    // remontée Sentry). Les erreurs réseau gardent les 2 tentatives par défaut.
    retry: (failureCount, error) => !(error instanceof GridParseError) && failureCount < 2,
  });
