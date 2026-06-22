import { Text, View } from "react-native";

import { t } from "@/lib/i18n";

export default function OnboardingScreen() {
  // Placeholder sans logique — la sélection du niveau arrive à l'issue #16.
  return (
    <View className="flex-1 items-center justify-center gap-sm bg-background px-xl">
      <Text className="font-lexend text-[28px] text-on-surface">{t("onboarding.title")}</Text>
      <Text className="font-inter text-[16px] text-on-surface-muted">
        {t("onboarding.subtitle")}
      </Text>
    </View>
  );
}
