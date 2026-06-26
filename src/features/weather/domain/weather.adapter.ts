import { httpGet } from "@/lib/http";

import { FORECAST_URL } from "./weather.constants";

// Frontière IO : renvoie l'objet JSON brut (NON validé) de la prévision Open-Meteo.
// Aucune logique métier ici (validation/transformation → service). Réutilise le client HTTP
// de bas niveau de @/lib (gestion timeout / HttpError).
export const fetchForecast = async (): Promise<unknown> => {
  const { body } = await httpGet(FORECAST_URL);
  return JSON.parse(body) as unknown;
};
