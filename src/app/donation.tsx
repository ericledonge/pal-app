import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { DONATION } from "@/lib/config";
import { t } from "@/lib/i18n";

export default function DonationScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("donation.title")} onClose={() => router.back()} />
      <ScrollView contentContainerClassName="gap-md px-lg py-md">
        <Text variant="body" className="text-on-surface-muted">
          {t("donation.intro")}
        </Text>

        {DONATION.kofiUrl ? (
          <View className="gap-2xs">
            <Button
              label={t("donation.cardCta")}
              onPress={() => void WebBrowser.openBrowserAsync(DONATION.kofiUrl)}
            />
            <Text variant="caption" className="text-center">
              {t("donation.cardHint")}
            </Text>
          </View>
        ) : null}

        <Card className="gap-sm">
          <Text variant="label">{t("donation.interacTitle")}</Text>
          <Text variant="caption">{t("donation.interacHint")}</Text>
          <View className="gap-2xs">
            <Text variant="caption">{t("donation.interacEmailLabel")}</Text>
            <Text variant="body" selectable className="text-primary">
              {DONATION.interacEmail}
            </Text>
          </View>
          {DONATION.interacAnswer ? (
            <View className="gap-2xs">
              <Text variant="caption">{t("donation.interacAnswerLabel")}</Text>
              <Text variant="body" selectable className="text-primary">
                {DONATION.interacAnswer}
              </Text>
            </View>
          ) : null}
        </Card>

        <Text variant="caption" className="text-center text-on-surface-muted">
          {t("donation.note")}
        </Text>
      </ScrollView>
    </View>
  );
}
