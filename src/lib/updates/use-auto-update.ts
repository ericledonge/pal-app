import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

import { logger } from "@/lib/logger";

import { areUpdatesBlocked, subscribeUpdatesGate } from "./update-gate";

// Intervalle minimal entre deux vérifications réseau, pour ne pas re-checker à chaque micro-bascule
// au premier plan.
const CHECK_THROTTLE_MS = 5 * 60_000;

// Mécanisme d'auto-update OTA (EAS Update). À monter une seule fois, à la racine de l'app.
//
// Principe : on sépare « télécharger » (toujours sans risque — n'affecte pas le JS en cours) de
// « appliquer » (reloadAsync, qui redémarre le JS et remettrait à zéro un minuteur de match).
//   - Démarrage : on télécharge une éventuelle MAJ sans recharger ; elle s'appliquera au prochain
//     lancement (comportement natif d'expo-updates) ou au prochain retour au premier plan.
//   - Retour au premier plan : on vérifie + télécharge, puis on applique (reload silencieux) si
//     aucune opération sensible n'est en cours.
//   - Garde-fou : une matrice live bloque l'application (cf. update-gate). La MAJ reste prête et
//     s'applique dès la libération du garde-fou (fin de matrice).
// En dev / Expo Go, Updates.isEnabled est false : tout est neutralisé.
export const useAutoUpdate = (): void => {
  const lastCheck = useRef(0);
  // true dès qu'une MAJ a été téléchargée mais pas encore appliquée (en attente d'un moment sûr).
  const pendingApply = useRef(false);

  useEffect(() => {
    if (!Updates.isEnabled) {
      return undefined;
    }

    const checkAndFetch = async (): Promise<void> => {
      const now = Date.now();
      if (now - lastCheck.current < CHECK_THROTTLE_MS) {
        return;
      }
      lastCheck.current = now;
      try {
        const check = await Updates.checkForUpdateAsync();
        if (!check.isAvailable) {
          return;
        }
        const fetched = await Updates.fetchUpdateAsync();
        if (fetched.isNew) {
          pendingApply.current = true;
        }
      } catch (error) {
        logger.error(error, { feature: "auto-update", step: "check-fetch" });
      }
    };

    const applyIfSafe = async (): Promise<void> => {
      if (!pendingApply.current || areUpdatesBlocked()) {
        return;
      }
      pendingApply.current = false;
      try {
        await Updates.reloadAsync();
      } catch (error) {
        // Échec du reload : on garde la MAJ en attente pour réessayer plus tard.
        pendingApply.current = true;
        logger.error(error, { feature: "auto-update", step: "reload" });
      }
    };

    // Retour au premier plan : vérifier + télécharger, puis appliquer si l'état est sûr.
    const subscription = AppState.addEventListener("change", (status) => {
      if (status !== "active") {
        return;
      }
      void checkAndFetch().then(applyIfSafe);
    });

    // Le garde-fou se libère (ex. fin de matrice) : appliquer une MAJ en attente.
    const unsubscribeGate = subscribeUpdatesGate((blocked) => {
      if (!blocked) {
        void applyIfSafe();
      }
    });

    // Au démarrage : télécharger sans recharger (la MAJ s'appliquera au prochain lancement ou au
    // prochain retour au premier plan).
    void checkAndFetch();

    return () => {
      subscription.remove();
      unsubscribeGate();
    };
  }, []);
};
