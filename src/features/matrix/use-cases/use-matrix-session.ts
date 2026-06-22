import { useCallback, useState } from "react";

import {
  addGuest as addGuestToEffectif,
  addPlayers,
  removePlayer as removePlayerFromEffectif,
} from "../domain/matrix.service";
import {
  DEFAULT_MATCH_MINUTES,
  type MatrixConfig,
  type MatrixPlayer,
} from "../domain/matrix.types";

// État local de la session de matrice (mono-appareil). Glue : délègue aux helpers purs du service.
export const useMatrixSession = () => {
  const [effectif, setEffectif] = useState<MatrixPlayer[]>([]);
  const [config, setConfig] = useState<MatrixConfig>({
    nbTerrains: 2,
    dureeMatchMin: DEFAULT_MATCH_MINUTES,
  });

  const addPresents = useCallback((players: MatrixPlayer[]) => {
    setEffectif((current) => addPlayers(current, players));
  }, []);

  const addGuest = useCallback((nom: string) => {
    setEffectif((current) => addGuestToEffectif(current, nom));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setEffectif((current) => removePlayerFromEffectif(current, id));
  }, []);

  const setTerrains = useCallback((nbTerrains: number) => {
    setConfig((current) => ({ ...current, nbTerrains }));
  }, []);

  const setDuration = useCallback((dureeMatchMin: number) => {
    setConfig((current) => ({ ...current, dureeMatchMin }));
  }, []);

  return { effectif, config, addPresents, addGuest, removePlayer, setTerrains, setDuration };
};
