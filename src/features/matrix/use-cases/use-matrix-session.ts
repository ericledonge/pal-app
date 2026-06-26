import { useCallback, useEffect, useState } from "react";

import { trackEvent } from "@/lib/analytics";

import {
  clearMatrixSession,
  readMatrixSession,
  writeMatrixSession,
} from "../domain/matrix-session.storage";
import { generateRound } from "../domain/matrix.matchmaking";
import {
  addGuest as addGuestToEffectif,
  addPlayers,
  removePlayer as removePlayerFromEffectif,
} from "../domain/matrix.service";
import {
  DEFAULT_MATCH_MINUTES,
  type MatrixConfig,
  type MatrixPlayer,
  type Round,
} from "../domain/matrix.types";

export type MatrixPhase = "config" | "live";

// Orchestration complète de la session (mono-appareil) : effectif + config + rondes + phase.
// Glue : délègue la logique pure (matchmaking, helpers d'effectif) au domaine.
export const useMatrixSession = () => {
  const [effectif, setEffectif] = useState<MatrixPlayer[]>([]);
  const [config, setConfig] = useState<MatrixConfig>({
    nbTerrains: 2,
    dureeMatchMin: DEFAULT_MATCH_MINUTES,
  });
  const [rounds, setRounds] = useState<Round[]>([]);
  const [phase, setPhase] = useState<MatrixPhase>("config");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Reprise : restaure une session persistée au lancement.
  useEffect(() => {
    let active = true;
    void readMatrixSession().then((saved) => {
      if (active && saved) {
        setEffectif(saved.effectif);
        setConfig(saved.config);
        setRounds(saved.rounds);
        setPhase(saved.phase);
        setCurrentIndex(saved.currentIndex);
      }
      if (active) {
        setHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persiste l'état après hydratation (à chaque changement).
  useEffect(() => {
    if (hydrated) {
      void writeMatrixSession({ effectif, config, rounds, phase, currentIndex });
    }
  }, [hydrated, effectif, config, rounds, phase, currentIndex]);

  const addPresents = useCallback((players: MatrixPlayer[]) => {
    setEffectif((current) => addPlayers(current, players));
  }, []);
  // Synchronise l'effectif sur la session détectée/choisie : on repart des seuls joueurs de cette
  // session. Les invités saisis à la main sont propres à la session courante — ils ne « collent »
  // pas d'une session à l'autre : un changement (ou une re-détection au lancement) les oublie.
  const setPresents = useCallback((players: MatrixPlayer[]) => {
    setEffectif(players);
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

  const startSession = useCallback(() => {
    trackEvent("matrix_generated", { joueurs: effectif.length, terrains: config.nbTerrains });
    setRounds([generateRound(effectif, config.nbTerrains, [])]);
    setCurrentIndex(0);
    setPhase("live");
  }, [effectif, config.nbTerrains]);

  // Avance : navigue vers la ronde suivante existante, ou en génère une nouvelle à la volée.
  const nextRound = useCallback(() => {
    setRounds((previous) =>
      currentIndex < previous.length - 1
        ? previous
        : [...previous, generateRound(effectif, config.nbTerrains, previous)],
    );
    setCurrentIndex((index) => index + 1);
  }, [currentIndex, effectif, config.nbTerrains]);

  const prevRound = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  const endSession = useCallback(() => {
    void clearMatrixSession();
    setRounds([]);
    setCurrentIndex(0);
    setPhase("config");
  }, []);

  return {
    effectif,
    config,
    rounds,
    phase,
    currentIndex,
    currentRound: rounds[currentIndex] ?? null,
    canStart: effectif.length >= 4,
    addPresents,
    setPresents,
    addGuest,
    removePlayer,
    setTerrains,
    setDuration,
    startSession,
    nextRound,
    prevRound,
    endSession,
  };
};

export type UseMatrixSession = ReturnType<typeof useMatrixSession>;
