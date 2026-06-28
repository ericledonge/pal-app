import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useCallback, useEffect, useState } from "react";
import { Vibration } from "react-native";

// Sonnerie de fin de ronde (bips en boucle) jouée jusqu'à l'arrêt manuel.
const ALARM_SOURCE = require("@/assets/sounds/match_end.wav");

// Vibration soutenue répétée pendant l'alarme. Sur iOS les durées du motif sont ignorées (vibration
// fixe), mais la répétition fonctionne ; sur Android le motif est respecté tel quel.
const VIBRATION_PATTERN = [0, 700, 500];

// Alarme de fin de ronde : sonnerie en boucle + vibration, déclenchée à 0:00 et coupée à la reprise
// du contrôle (Pause / Réinitialiser / Ronde suivante). Sonne même en mode silencieux.
export const useMatchAlarm = () => {
  const player = useAudioPlayer(ALARM_SOURCE);
  // `alarming` = la sonnerie retentit en ce moment ; pilote l'affichage du bouton « Arrêter ».
  const [alarming, setAlarming] = useState(false);

  useEffect(() => {
    player.loop = true;
    // C'est une alarme : elle doit sonner même quand le téléphone est en mode silencieux.
    setAudioModeAsync({ playsInSilentMode: true });
  }, [player]);

  // Coupe la vibration si l'écran est démonté alors que l'alarme sonne encore.
  useEffect(() => () => Vibration.cancel(), []);

  const start = useCallback(() => {
    player.seekTo(0);
    player.play();
    Vibration.vibrate(VIBRATION_PATTERN, true);
    setAlarming(true);
  }, [player]);

  const stop = useCallback(() => {
    player.pause();
    player.seekTo(0);
    Vibration.cancel();
    setAlarming(false);
  }, [player]);

  return { alarming, start, stop };
};
