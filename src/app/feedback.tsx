import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { FEEDBACK_CATEGORIES, useFeedback } from "@/features/feedback/use-cases/use-feedback";
import { t } from "@/lib/i18n";

const CATEGORY_LABELS = {
  bug: "feedback.categoryBug",
  idea: "feedback.categoryIdea",
  other: "feedback.categoryOther",
} as const;

export default function FeedbackScreen() {
  const router = useRouter();
  const { category, setCategory, message, setMessage, status, error, canSubmit, submit } =
    useFeedback();

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("feedback.title")} onClose={() => router.back()} />
      <ScrollView contentContainerClassName="gap-md px-lg py-md">
        <Text variant="body" className="text-on-surface-muted">
          {t("feedback.intro")}
        </Text>

        <View className="gap-sm">
          <Text variant="label">{t("feedback.category")}</Text>
          <View className="flex-row gap-sm">
            {FEEDBACK_CATEGORIES.map((value) => (
              <Chip
                key={value}
                label={t(CATEGORY_LABELS[value])}
                selected={category === value}
                onPress={() => setCategory(value)}
              />
            ))}
          </View>
        </View>

        <View className="gap-sm">
          <Text variant="label">{t("feedback.message")}</Text>
          <Input
            multiline
            value={message}
            onChangeText={setMessage}
            placeholder={t("feedback.messagePlaceholder")}
            textAlignVertical="top"
            className="h-32"
          />
        </View>

        {error ? (
          <Text variant="caption" className="text-error">
            {error}
          </Text>
        ) : null}
        {status === "success" ? (
          <Text variant="caption" className="text-primary">
            {t("feedback.success")}
          </Text>
        ) : null}
        {status === "error" ? (
          <Text variant="caption" className="text-error">
            {t("feedback.error")}
          </Text>
        ) : null}

        <Button
          label={t("feedback.send")}
          disabled={!canSubmit}
          loading={status === "sending"}
          onPress={() => void submit()}
        />
      </ScrollView>
    </View>
  );
}
