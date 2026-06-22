import { useCallback, useEffect, useRef, useState } from "react";

// Minuteur de match basé sur l'horloge (timestamp) plutôt qu'un simple décompte : exact malgré
// le passage en arrière-plan ou un throttling de l'intervalle. Réinitialise si la durée change.
export const useMatchTimer = (durationMin: number) => {
  const totalMs = Math.max(0, durationMin) * 60_000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [running, setRunning] = useState(false);
  const endAt = useRef<number | null>(null);

  useEffect(() => {
    setRemainingMs(totalMs);
    setRunning(false);
    endAt.current = null;
  }, [totalMs]);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    endAt.current = Date.now() + remainingMs;
    const interval = setInterval(() => {
      const left = Math.max(0, (endAt.current ?? Date.now()) - Date.now());
      setRemainingMs(left);
      if (left <= 0) {
        setRunning(false);
      }
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react/exhaustive-deps
  }, [running]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setRemainingMs(totalMs);
    endAt.current = null;
  }, [totalMs]);

  return { remainingMs, running, isFinished: remainingMs <= 0, start, pause, reset };
};
