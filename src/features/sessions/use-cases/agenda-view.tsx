import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

import { Chip } from "@/components/ui/chip";
import { ScreenHeader } from "@/components/ui/screen-header";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/components/ui/screen-state";
import { Text } from "@/components/ui/text";
import { usePreferences } from "@/features/preferences/use-cases/use-preferences";
import { t } from "@/lib/i18n";

import type { AgendaMode, AgendaSlotViewModel } from "../domain/session.service";
import type { Day } from "../domain/session.types";
import { SlotCard } from "./slot-card";
import { SlotDetail } from "./slot-detail";
import { useAgenda } from "./use-agenda";

export const AgendaView = () => {
  const { preferences } = usePreferences();
  const [day, setDay] = useState<Day>("today");
  const [mode, setMode] = useState<AgendaMode>(preferences.defaultAllLevels ? "all" : "myLevel");
  const [selected, setSelected] = useState<AgendaSlotViewModel | null>(null);
  const { sections, isLoading, isError, isRefreshing, errorKind, isEmpty, refresh } = useAgenda(
    day,
    mode,
  );

  let body;
  if (isLoading) {
    body = <ScreenLoading />;
  } else if (isError) {
    body = (
      <ScreenError
        message={errorKind === "parsing" ? t("sessions.errorParsing") : t("sessions.errorNetwork")}
        onRetry={refresh}
      />
    );
  } else if (isEmpty) {
    body = (
      <ScreenEmpty
        message={mode === "myLevel" ? t("sessions.emptyMyLevel") : t("sessions.empty")}
      />
    );
  } else {
    body = (
      <ScrollView
        contentContainerClassName="gap-md px-lg pb-2xl"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
      >
        {sections.map((section) => (
          <View key={section.plateau} className="gap-sm">
            <Text variant="label" className="text-on-surface-muted">
              {section.plateauLabel}
            </Text>
            {section.slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onPress={mode === "myLevel" ? () => setSelected(slot) : undefined}
              />
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
      <SlotDetail slot={selected} onClose={() => setSelected(null)} />
    </View>
  );
};
