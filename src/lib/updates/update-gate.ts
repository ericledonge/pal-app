// Garde-fou des mises à jour OTA (EAS Update). Permet à une feature de bloquer temporairement
// l'application d'une MAJ déjà téléchargée (reloadAsync) tant qu'une opération sensible est en
// cours — typiquement une matrice de jeu live, dont le minuteur (en mémoire) serait remis à zéro
// par un reload. Pur : aucune dépendance React / expo. Simple registre de « raisons » de blocage.

type GateListener = (blocked: boolean) => void;

const reasons = new Set<string>();
const listeners = new Set<GateListener>();

/** true dès qu'au moins une raison de blocage est active. */
export const areUpdatesBlocked = (): boolean => reasons.size > 0;

/** Active / désactive une raison de blocage (idempotent par clé). Notifie au passage bloqué↔libre. */
export const setUpdatesBlocked = (reason: string, blocked: boolean): void => {
  const was = reasons.size > 0;
  if (blocked) {
    reasons.add(reason);
  } else {
    reasons.delete(reason);
  }
  const now = reasons.size > 0;
  if (was !== now) {
    listeners.forEach((listener) => listener(now));
  }
};

/** S'abonne aux transitions bloqué↔libre. Renvoie une fonction de désabonnement. */
export const subscribeUpdatesGate = (listener: GateListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
