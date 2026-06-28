import { useCallback, useRef } from "react";

import { cancelMatchEndNotification, scheduleMatchEndNotification } from "@/lib/notifications";

// Programme/annule la notification locale de fin de ronde en miroir du minuteur — filet de sécurité
// quand l'écran est verrouillé à la main ou l'app en arrière-plan (c'est l'OS qui sonne, pas le JS).
// Glue uniquement : la logique (calcul de l'instant, appels natifs) vit dans `@/lib/notifications`.
export const useMatchEndNotification = () => {
  const idRef = useRef<string | null>(null);
  // Jeton de génération : invalide une programmation « en vol » si un cancel/start survient avant sa
  // résolution (le scheduling est asynchrone), évitant une notification orpheline.
  const tokenRef = useRef(0);

  const schedule = useCallback((remainingMs: number) => {
    const token = ++tokenRef.current;
    void scheduleMatchEndNotification(remainingMs).then((id) => {
      if (token !== tokenRef.current) {
        void cancelMatchEndNotification(id);
        return;
      }
      idRef.current = id;
    });
  }, []);

  const cancel = useCallback(() => {
    tokenRef.current += 1;
    void cancelMatchEndNotification(idRef.current);
    idRef.current = null;
  }, []);

  return { schedule, cancel };
};
