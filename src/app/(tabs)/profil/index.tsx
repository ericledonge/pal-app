import Constants from "expo-constants";
import { ScrollView, View } from "react-native";

import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";
import { t } from "@/lib/i18n";

export default function ProfilScreen() {
  const { level } = useLevelPreference();
  const version = Constants.expoConfig?.version ?? "—";

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("profile.title")} />
      <ScrollView contentContainerClassName="gap-md px-lg py-md">
        <Card className="gap-2xs">
          <Text variant="label" className="text-on-surface-muted">
            {t("profile.myLevel")}
          </Text>
          <Text variant="cardTitle">{level ?? t("profile.noLevel")}</Text>
        </Card>

        <Card className="gap-2xs">
          <Text variant="label">{t("profile.preferences")}</Text>
          <Text variant="caption">{t("common.soon")}</Text>
        </Card>

        <Card className="gap-2xs">
          <Text variant="label">{t("profile.help")}</Text>
          <Text variant="caption">{t("common.soon")}</Text>
        </Card>

        <View className="items-center pt-md">
          <Text variant="caption">
            {t("profile.version")} {version}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
