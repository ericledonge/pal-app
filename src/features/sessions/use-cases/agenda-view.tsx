import { useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

import { Chip } from "@/components/ui/chip";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { usePreferences } from "@/features/preferences/use-cases/use-preferences";
import { t } from "@/lib/i18n";

import type { AgendaMode } from "../domain/session.service";
import type { Day } from "../domain/session.types";
import { SlotCard } from "./slot-card";
import { useAgenda } from "./use-agenda";

export const AgendaView = () => {
  const { preferences } = usePreferences();
  const [day, setDay] = useState<Day>("today");
  const [mode, setMode] = useState<AgendaMode>(preferences.defaultAllLevels ? "all" : "myLevel");
  const { sections, isLoading, isError, isEmpty, refresh } = useAgenda(day, mode);

  let body;
  if (isLoading) {
    body = (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  } else if (isError) {
    body = (
      <View className="flex-1 items-center justify-center gap-sm px-lg">
        <Text variant="body" className="text-center text-error">
          {t("sessions.error")}
        </Text>
        <Chip label={t("common.retry")} onPress={refresh} />
      </View>
    );
  } else if (isEmpty) {
    body = (
      <View className="flex-1 items-center justify-center px-lg">
        <Text variant="body" className="text-center text-on-surface-muted">
          {mode === "myLevel" ? t("sessions.emptyMyLevel") : t("sessions.empty")}
        </Text>
      </View>
    );
  } else {
    body = (
      <ScrollView contentContainerClassName="gap-md px-lg pb-2xl">
        {sections.map((section) => (
          <View key={section.plateau} className="gap-sm">
            <Text variant="label" className="text-on-surface-muted">
              {section.plateauLabel}
            </Text>
            {section.slots.map((slot) => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("sessions.title")} />
      <View className="gap-sm px-lg pb-sm">
        <View className="flex-row gap-sm">
          <Chip
            label={t("sessions.today")}
            selected={day === "today"}
            onPress={() => setDay("today")}
          />
          <Chip
            label={t("sessions.tomorrow")}
            selected={day === "tomorrow"}
            onPress={() => setDay("tomorrow")}
          />
        </View>
        <View className="flex-row gap-sm">
          <Chip
            label={t("sessions.myLevel")}
            selected={mode === "myLevel"}
            onPress={() => setMode("myLevel")}
          />
          <Chip
            label={t("sessions.allLevels")}
            selected={mode === "all"}
            onPress={() => setMode("all")}
          />
        </View>
      </View>
      {body}
    </View>
  );
};
