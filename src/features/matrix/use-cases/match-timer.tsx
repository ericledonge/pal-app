import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";

import { formatCountdown } from "../domain/matrix.timer";

interface MatchTimerProps {
  remainingMs: number;
  running: boolean;
  isFinished: boolean;
  alarming: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStopAlarm: () => void;
}

export const MatchTimer = ({
  remainingMs,
  running,
  isFinished,
  alarming,
  onStart,
  onPause,
  onReset,
  onStopAlarm,
}: MatchTimerProps) => (
  <View className="items-center gap-sm">
    <Text className={cn("font-lexend text-[48px]", isFinished ? "text-error" : "text-on-surface")}>
      {formatCountdown(remainingMs)}
    </Text>
    {isFinished ? (
      <Text variant="label" className="text-error">
        {t("matrix.finished")}
      </Text>
    ) : null}
    <View className="flex-row gap-sm">
      {alarming ? (
        // Coupe uniquement la sonnerie : laisse le temps au battement entre les rondes.
        <Button label={t("matrix.stopAlarm")} onPress={onStopAlarm} />
      ) : running ? (
        <Button variant="secondary" label={t("matrix.pause")} onPress={onPause} />
      ) : (
        <Button label={t("matrix.start")} onPress={onStart} disabled={isFinished} />
      )}
      <Button variant="ghost" label={t("matrix.reset")} onPress={onReset} />
    </View>
  </View>
);
