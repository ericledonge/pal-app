import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { ScrollView, Switch, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";
import { usePreferences } from "@/features/preferences/use-cases/use-preferences";
import { t } from "@/lib/i18n";

export default function ProfilScreen() {
  const router = useRouter();
  const { level } = useLevelPreference();
  const { preferences, setPreference } = usePreferences();
  const version = Constants.expoConfig?.version ?? "—";

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("profile.title")} />
      <ScrollView contentContainerClassName="gap-md px-lg py-md">
        <Card className="gap-sm">
          <View className="gap-2xs">
            <Text variant="label" className="text-on-surface-muted">
              {t("profile.myLevel")}
            </Text>
            <Text variant="cardTitle">{level ?? t("profile.noLevel")}</Text>
          </View>
          <Button
            variant="secondary"
            label={t("profile.changeLevel")}
            onPress={() => router.push("/select-level")}
          />
        </Card>

        <Card className="gap-sm">
          <Text variant="label">{t("profile.preferences")}</Text>
          <View className="flex-row items-center justify-between gap-md">
            <Text variant="body" className="flex-1">
              {t("preferences.defaultAllLevels")}
            </Text>
            <Switch
              value={preferences.defaultAllLevels}
              onValueChange={(value) => void setPreference("defaultAllLevels", value)}
              trackColor={{ true: "#ff5700", false: "#cbd2e0" }}
            />
          </View>
          <Text variant="caption">{t("preferences.themeNote")}</Text>
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
