import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { t } from "@/lib/i18n";

export default function MatriceScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-sm bg-background px-xl">
      <Stack.Screen options={{ title: t("matrix.title") }} />
      <Text className="font-lexend text-[28px] text-on-surface">{t("matrix.title")}</Text>
      <Text className="font-inter text-[16px] text-on-surface-muted">{t("matrix.subtitle")}</Text>
    </View>
  );
}
