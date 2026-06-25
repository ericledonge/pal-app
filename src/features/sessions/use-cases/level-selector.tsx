import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

type LevelSelectorProps = {
  myLevel: string | null;
  mode: "myLevel" | "all";
  onModeChange: (mode: "myLevel" | "all") => void;
};

export const LevelSelector = ({
  myLevel,
  mode,
  onModeChange,
}: LevelSelectorProps) => {
  return (
    <Card className="flex-row items-center justify-between gap-md p-md">
      <View className="flex-1 gap-2xs">
        <Text variant="cardTitle">{t("sessions.myLevel")}</Text>
        <Text variant="label">
          {myLevel
            ? t("sessions.myLevelFilterSubtitle", { level: myLevel })
            : t("sessions.myLevelFilterSubtitleGeneric")}
        </Text>
      </View>
      <Switch
        value={mode === "myLevel"}
        onValueChange={(on) => onModeChange(on ? "myLevel" : "all")}
        accessibilityLabel={t("sessions.myLevel")}
      />
    </Card>
  );
};
