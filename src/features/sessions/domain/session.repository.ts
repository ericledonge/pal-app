import { useQuery } from "@tanstack/react-query";

import { logger } from "@/lib/logger";

import { fetchTodayGrid, fetchTomorrowGrid } from "./session.adapter";
import { parseGrid } from "./session.parser";
import { assertValidGrid } from "./session.service";
import type { Day, Plateau, Slot } from "./session.types";

const SESSIONS_KEY = ["sessions"] as const;

// Enchaîne fetch HTML → parse → validation. Les erreurs remontent telles quelles :
// HttpError (réseau/HTTP) et GridParseError (parsing) sont distinguables par le consommateur.
const fetchGrid = async (day: Day, plateau: Plateau): Promise<Slot[]> => {
  const html = day === "today" ? await fetchTodayGrid(plateau) : await fetchTomorrowGrid(plateau);
  const slots = assertValidGrid(html, parseGrid(html, plateau));
  if (__DEV__) {
    // Diagnostic du parsing (cœur fragile de la feature) : nb de créneaux + codes/inscrits vus.
    logger.info(
      `[sessions] ${day}/${plateau} → ${slots.length} créneaux | ` +
        slots
          .map((slot) => `${slot.heure} ${slot.codes.join("&") || "(sans code)"}×${slot.count}`)
          .join(", "),
    );
  }
  return slots;
};

/** Présences d'un (jour, plateau). Clé de cache distincte par combinaison ; staleTime court. */
export const useGrid = (day: Day, plateau: Plateau) =>
  useQuery({
    queryKey: [...SESSIONS_KEY, day, plateau],
    queryFn: () => fetchGrid(day, plateau),
    staleTime: 30_000, // présences mouvantes : fraîches ~30 s, refetch au focus/reconnect (defaults)
  });
