import { useQuery } from "@tanstack/react-query";

import { fetchForecast } from "./weather.adapter";
import { createWeatherForecast } from "./weather.service";

const WEATHER_KEY = ["weather"] as const;

/**
 * Prévision météo du club (Lévis), couvrant aujourd'hui et demain — indépendante du jour
 * sélectionné dans l'agenda. `staleTime` long : les prévisions n'évoluent qu'à l'échelle horaire.
 * Donnée **supplémentaire** : une erreur n'affecte pas l'agenda (le consommateur retombe
 * gracieusement sur « pas de pastille »). `createWeatherForecast` renvoie `null` si la forme
 * de la réponse est inattendue, sans lever d'erreur.
 */
export const useWeatherForecast = () =>
  useQuery({
    queryKey: WEATHER_KEY,
    queryFn: async () => createWeatherForecast(await fetchForecast()),
    staleTime: 30 * 60_000,
  });
