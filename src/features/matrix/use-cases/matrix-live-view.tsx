import { useMemo } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const nameOf = useMemo(() => {
    const names = new Map(effectif.map((player) => [player.id, player.nom]));
    return (id: string) => names.get(id) ?? id;
  }, [effectif]);

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

        <View className="flex-row items-center gap-sm">
          <Button
            variant="secondary"
            label="←"
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
