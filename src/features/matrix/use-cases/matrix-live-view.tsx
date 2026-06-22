import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

import { MatchTimer } from "./match-timer";
import { useMatchTimer } from "./use-match-timer";
import type { UseMatrixSession } from "./use-matrix-session";

interface MatrixLiveViewProps {
  session: UseMatrixSession;
}

// Écran de match live : minuteur, appariements par terrain, salle d'attente, navigation des rondes.
export const MatrixLiveView = ({ session }: MatrixLiveViewProps) => {
  const { effectif, config, currentRound, currentIndex } = session;
  const timer = useMatchTimer(config.dureeMatchMin);
  const [guest, setGuest] = useState("");

  const nameOf = useMemo(() => {
    const names = new Map(effectif.map((player) => [player.id, player.nom]));
    return (id: string) => names.get(id) ?? id;
  }, [effectif]);

  const handleAddGuest = () => {
    session.addGuest(guest);
    setGuest("");
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={`${t("matrix.round")} ${currentRound?.numero ?? 1}`} />
      <ScrollView contentContainerClassName="gap-md px-lg py-md">
        <Card className="items-center">
          <MatchTimer
            remainingMs={timer.remainingMs}
            running={timer.running}
            isFinished={timer.isFinished}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={timer.reset}
          />
        </Card>

        {currentRound?.pairings.map((pairing) => (
          <Card key={pairing.terrain} className="gap-2xs">
            <Text variant="label" className="text-on-surface-muted">
              {t("matrix.terrain")} {pairing.terrain}
            </Text>
            <Text variant="body">{pairing.equipeA.map(nameOf).join(" + ")}</Text>
            <Text variant="caption" className="text-on-surface-muted">
              {t("matrix.versus")}
            </Text>
            <Text variant="body">{pairing.equipeB.map(nameOf).join(" + ")}</Text>
          </Card>
        ))}

        <Card className="gap-2xs">
          <Text variant="label">{t("matrix.waitingArea")}</Text>
          {currentRound && currentRound.bench.length > 0 ? (
            <Text variant="body">{currentRound.bench.map(nameOf).join(", ")}</Text>
          ) : (
            <Text variant="caption">{t("matrix.noBench")}</Text>
          )}
        </Card>

        <Card className="gap-sm">
          <Text variant="label">
            {t("matrix.roster")} ({effectif.length})
          </Text>
          {effectif.map((player) => (
            <View key={player.id} className="flex-row items-center justify-between">
              <Text variant="body">{player.nom}</Text>
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
        </Card>

        <View className="flex-row items-center gap-sm">
          <Button
            variant="secondary"
            label="←"
            accessibilityLabel={t("matrix.previousRound")}
            disabled={currentIndex === 0}
            onPress={session.prevRound}
          />
          <View className="flex-1">
            <Button label={t("matrix.nextRound")} onPress={session.nextRound} />
          </View>
        </View>
        <Button variant="ghost" label={t("matrix.endSession")} onPress={session.endSession} />
      </ScrollView>
    </View>
  );
};
