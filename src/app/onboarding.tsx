import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { LevelGrid } from "@/features/level/use-cases/level-grid";
import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";
import { trackEvent } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import type { LevelCode } from "@/shared/domain/level";

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setLevel } = useLevelPreference();
  const [selected, setSelected] = useState<LevelCode | null>(null);
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    if (!selected) {
      return;
    }
    setSaving(true);
    await setLevel(selected);
    trackEvent("onboarding_completed", { level: selected });
    router.replace("/sessions");
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-lg px-lg"
      contentContainerStyle={{ paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }}
    >
      <View className="gap-2xs">
        <Text variant="title">{t("onboarding.title")}</Text>
        <Text variant="body" className="text-on-surface-muted">
          {t("onboarding.intro")}
        </Text>
      </View>

      <Card className="gap-2xs">
        <Text variant="label" className="text-on-surface">
          {t("onboarding.ctTitle")}
        </Text>
        <Text variant="caption">{t("onboarding.ctExplainer")}</Text>
      </Card>

      <View className="gap-sm">
        <Text variant="label">{t("onboarding.selectInstruction")}</Text>
        <LevelGrid selected={selected} onSelect={setSelected} />
      </View>

      <Button
        label={t("onboarding.start")}
        disabled={!selected}
        loading={saving}
        onPress={() => void handleStart()}
      />
    </ScrollView>
  );
}
