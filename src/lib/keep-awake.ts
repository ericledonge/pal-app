import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";

// Tag dédié : ne libère la veille que lorsque CE verrou est relâché, sans interférer avec d'autres.
const TAG = "match-timer";

// Garde l'écran allumé tant que `active` est vrai. Sans ça, l'écran s'éteint par inactivité (1-2 min),
// l'OS suspend le thread JS, `setInterval` cesse de tourner et l'alarme de fin de ronde ne se
// déclenche qu'au réveil. À piloter avec « minuteur en cours OU sonnerie en boucle ». La veille est
// rétablie dès que `active` repasse à faux et au démontage de l'écran.
export const useKeepAwakeWhileActive = (active: boolean): void => {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    void activateKeepAwakeAsync(TAG);
    return () => {
      void deactivateKeepAwake(TAG);
    };
  }, [active]);
};
