import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { t } from "@/lib/i18n";
import { logger } from "@/lib/logger";

// Notifications locales — filet de l'alarme du minuteur de match. Quand l'écran est verrouillé à la
// main ou l'app en arrière-plan, le thread JS est suspendu : l'alarme sonore intégrée (useMatchAlarm)
// ne peut pas se déclencher. Une notification locale PROGRAMMÉE à l'instant de fin est, elle, honorée
// par l'OS indépendamment du JS. Importé directement (pas de DI), comme analytics/logger.

// Canal Android : c'est lui qui porte le son (Android 8+ ignore `content.sound`). Immuable après
// création — changer le son imposerait un nouvel identifiant de canal.
const CHANNEL_ID = "match-timer";
// Fichier embarqué via le config plugin expo-notifications (`sounds` dans app.json), référencé par
// nom seul. 1 s, bien sous la limite iOS de ~30 s. Underscore obligatoire (pas de trait d'union) :
// le nom devient une ressource Android (res/raw), qui n'autorise que [a-z0-9_].
const ALARM_SOUND = "match_end.wav";

// iOS : un refus de permission est définitif sans passer par les Réglages ; on ne redemande pas en
// boucle.
let permissionAsked = false;

// À appeler une fois au démarrage de l'app. Définit le comportement de présentation (silencieux au
// premier plan : l'alarme intégrée prend le relais, on évite le double bip) et le canal Android.
export const setupMatchNotifications = async (): Promise<void> => {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldShowBanner: false,
        shouldShowList: false,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: t("matrix.notifChannel"),
        importance: Notifications.AndroidImportance.MAX,
        sound: ALARM_SOUND,
        vibrationPattern: [0, 700, 500],
      });
    }
  } catch (error) {
    logger.error(error, { scope: "setupMatchNotifications" });
  }
};

const ensurePermission = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  if (!current.canAskAgain && permissionAsked) {
    return false;
  }
  permissionAsked = true;
  const result = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true },
  });
  return result.granted;
};

// Programme l'alarme OS à l'instant de fin (maintenant + temps restant). Renvoie l'identifiant pour
// pouvoir l'annuler, ou null si la permission est refusée ou le délai nul.
export const scheduleMatchEndNotification = async (remainingMs: number): Promise<string | null> => {
  if (remainingMs <= 0) {
    return null;
  }
  try {
    const granted = await ensurePermission();
    if (!granted) {
      return null;
    }
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: t("matrix.notifTitle"),
        body: t("matrix.notifBody"),
        sound: ALARM_SOUND,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: Date.now() + remainingMs,
        channelId: CHANNEL_ID,
      },
    });
  } catch (error) {
    logger.error(error, { scope: "scheduleMatchEndNotification" });
    return null;
  }
};

export const cancelMatchEndNotification = async (id: string | null): Promise<void> => {
  if (!id) {
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    logger.error(error, { scope: "cancelMatchEndNotification" });
  }
};
