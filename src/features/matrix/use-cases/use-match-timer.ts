import { useCallback, useEffect, useRef, useState } from "react";

import { trackEvent } from "@/lib/analytics";

// Minuteur de match basé sur l'horloge (timestamp) plutôt qu'un simple décompte : la valeur
// affichée reste exacte malgré le passage en arrière-plan ou un throttling de l'intervalle (elle
// se recale au réveil). Réinitialise si la durée change.
// `onFinish` est appelé une seule fois, au premier tick atteignant 0:00 — TANT QUE le thread JS
// tourne. Écran éteint, l'OS suspend le JS et `onFinish` ne se déclenche qu'au réveil : c'est
// pourquoi l'écran live garde l'écran allumé (useKeepAwakeWhileActive) et programme une
// notification locale de secours (useMatchEndNotification) qui sonne via l'OS, indépendamment du JS.
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
