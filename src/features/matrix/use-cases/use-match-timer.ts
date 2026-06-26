import { useCallback, useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";

// Minuteur de match basé sur l'horloge (timestamp) plutôt qu'un simple décompte : exact malgré
// le passage en arrière-plan ou un throttling de l'intervalle. Réinitialise si la durée change.
// `onFinish` est appelé une seule fois, pile à l'instant où le décompte atteint 0:00.
export const useMatchTimer = (durationMin: number, onFinish?: () => void) => {
  const totalMs = Math.max(0, durationMin) * 60_000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [running, setRunning] = useState(false);
  const endAt = useRef<number | null>(null);
  // Ref « dernière valeur » : appelle le onFinish courant sans relancer l'intervalle à chaque render.
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

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
        onFinishRef.current?.();
      }
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react/exhaustive-deps
  }, [running]);

  const start = useCallback(() => {
    // Ne pas relancer un minuteur déjà écoulé : il « finirait » aussitôt et redéclencherait l'alarme.
    if (remainingMs <= 0) {
      return;
    }
    trackEvent("timer_started");
    setRunning(true);
  }, [remainingMs]);
  const pause = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => {
    setRunning(false);
    setRemainingMs(totalMs);
    endAt.current = null;
  }, [totalMs]);

  return { remainingMs, running, isFinished: remainingMs <= 0, start, pause, reset };
};
