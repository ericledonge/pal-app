import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";
import { useKeepAwakeWhileActive } from "@/lib/keep-awake";
import { useTabBarScrollPadding } from "@/lib/safe-area";
import { useThemeColors } from "@/lib/theme";

import { MatchTimer } from "./match-timer";
import { useMatchAlarm } from "./use-match-alarm";
import { useMatchEndNotification } from "./use-match-end-notification";
import { useMatchTimer } from "./use-match-timer";
import type { UseMatrixSession } from "./use-matrix-session";

interface MatrixLiveViewProps {
  session: UseMatrixSession;
}

// Écran de match live : minuteur, appariements par terrain, salle d'attente, navigation des rondes.
export const MatrixLiveView = ({ session }: MatrixLiveViewProps) => {
  const { effectif, config, currentRound, currentIndex } = session;
  const alarm = useMatchAlarm();
  const timer = useMatchTimer(config.dureeMatchMin, alarm.start);
  const notification = useMatchEndNotification();
  // Garde l'écran allumé pendant le décompte ET la sonnerie : sinon l'OS suspend le JS et l'alarme
  // ne sonne qu'au réveil. (Si l'utilisateur verrouille à la main, la notification OS prend le relais.)
  useKeepAwakeWhileActive(timer.running || alarm.alarming);
  const bottomPadding = useTabBarScrollPadding();
  const { onSurfaceMuted } = useThemeColors();
  const [guest, setGuest] = useState("");
  // Effectif replié par défaut : en plein match l'édition est rare, on garde le haut de l'écran
  // focalisé sur le jeu et « Ronde suivante » accessible sans scroller par-dessus la liste.
  const [rosterExpanded, setRosterExpanded] = useState(false);

  const nameOf = useMemo(() => {
    const names = new Map(effectif.map((player) => [player.id, player.nom]));
    return (id: string) => names.get(id) ?? id;
  }, [effectif]);

  const handleAddGuest = () => {
    session.addGuest(guest);
    setGuest("");
  };

  // L'alarme sonne en boucle jusqu'à la reprise du contrôle : tout bouton de minuteur ou de
  // navigation de ronde la coupe d'abord.
  const stopAlarmThen = (action: () => void) => () => {
    alarm.stop();
    action();
  };

  // Pause/Réinitialiser arrêtent le décompte : on coupe la sonnerie ET on annule la notification OS
  // en attente (plus de minuteur en cours → plus besoin du filet).
  const interrupt = (action: () => void) => () => {
    alarm.stop();
    notification.cancel();
    action();
  };

  // Démarrer/reprendre : coupe une éventuelle sonnerie, (re)programme la notification de secours pour
  // le temps restant, puis lance le décompte. `timer.start` ignore un minuteur déjà écoulé, et
  // `schedule` ignore un délai nul — cohérents.
  const handleStart = () => {
    alarm.stop();
    notification.cancel();
    timer.start();
    notification.schedule(timer.remainingMs);
  };

  // Terminer efface les rondes : on confirme d'abord (l'alarme est coupée à l'ouverture de la modale).
  const confirmEndSession = stopAlarmThen(() => {
    Alert.alert(t("matrix.endSessionTitle"), t("matrix.endSessionConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("matrix.endSession"),
        style: "destructive",
        onPress: () => {
          notification.cancel();
          session.endSession();
        },
      },
    ]);
  });

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={`${t("matrix.round")} ${currentRound?.numero ?? 1}`} />
      <ScrollView
        contentContainerClassName="gap-md px-lg pt-md"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Card className="items-center">
          <MatchTimer
            remainingMs={timer.remainingMs}
            running={timer.running}
            isFinished={timer.isFinished}
            alarming={alarm.alarming}
            onStart={handleStart}
            onPause={interrupt(timer.pause)}
            onReset={interrupt(timer.reset)}
            onStopAlarm={alarm.stop}
          />
        </Card>

        {currentRound?.pairings.map((pairing) => (
          <Card key={pairing.terrain} className="gap-2xs">
            <Text variant="label" className="text-on-surface-muted">
              {t("matrix.terrain")} {pairing.terrain}
            </Text>
            <Text variant="bodySm">{pairing.equipeA.map(nameOf).join(" + ")}</Text>
            <Text variant="caption" className="text-on-surface-muted">
              {t("matrix.versus")}
            </Text>
            <Text variant="bodySm">{pairing.equipeB.map(nameOf).join(" + ")}</Text>
          </Card>
        ))}

        <Card className="gap-2xs">
          <Text variant="label">{t("matrix.waitingArea")}</Text>
          {currentRound && currentRound.bench.length > 0 ? (
            <Text variant="bodySm">{currentRound.bench.map(nameOf).join(", ")}</Text>
          ) : (
            <Text variant="caption">{t("matrix.noBench")}</Text>
          )}
        </Card>

        <View className="flex-row items-center gap-sm">
          <Button
            variant="secondary"
            label="←"
            accessibilityLabel={t("matrix.previousRound")}
            disabled={currentIndex === 0}
            onPress={stopAlarmThen(session.prevRound)}
          />
          <View className="flex-1">
            <Button label={t("matrix.nextRound")} onPress={stopAlarmThen(session.nextRound)} />
          </View>
        </View>
        <Button variant="ghost" label={t("matrix.endSession")} onPress={confirmEndSession} />

        <Card className="gap-sm">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t("matrix.editRoster")} (${effectif.length})`}
            onPress={() => setRosterExpanded((value) => !value)}
            className="flex-row items-center justify-between gap-sm"
          >
            <Text variant="label" weight="semibold" className="flex-1">
              {t("matrix.editRoster")} ({effectif.length})
            </Text>
            <Ionicons
              name={rosterExpanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={onSurfaceMuted}
            />
          </Pressable>
          {rosterExpanded ? (
            <>
              <View className="h-px bg-outline" />
              {effectif.map((player) => (
                <View key={player.id} className="flex-row items-center justify-between gap-sm">
                  <Text variant="bodySm" numberOfLines={1} className="flex-1">
                    {player.nom}
                  </Text>
                  <Button
                    variant="ghost"
                    label={t("matrix.remove")}
                    onPress={() => session.removePlayer(player.id)}
                  />
                </View>
              ))}
              <Input
                value={guest}
                onChangeText={setGuest}
                placeholder={t("matrix.guestPlaceholder")}
                autoCapitalize="words"
              />
              <Button
                label={t("matrix.addGuest")}
                disabled={guest.trim().length === 0}
                onPress={handleAddGuest}
              />
            </>
          ) : null}
        </Card>
      </ScrollView>
    </View>
  );
};
