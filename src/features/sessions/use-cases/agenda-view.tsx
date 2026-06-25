import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

import { Chip } from "@/components/ui/chip";
import { ScreenHeader } from "@/components/ui/screen-header";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/components/ui/screen-state";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

import type { AgendaMode } from "../domain/session.service";
import type { Day } from "../domain/session.types";
import { SlotCard } from "./slot-card";
import { useAgenda } from "./use-agenda";

export const AgendaView = () => {
  const [day, setDay] = useState<Day>("today");
  const [mode, setMode] = useState<AgendaMode>("myLevel");
  const { colorScheme } = useColorScheme();
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
        <SegmentedControl
          values={[t("sessions.today"), t("sessions.tomorrow")]}
          selectedIndex={day === "today" ? 0 : 1}
          onChange={({ nativeEvent }) =>
            setDay(nativeEvent.selectedSegmentIndex === 0 ? "today" : "tomorrow")
          }
          appearance={colorScheme === "dark" ? "dark" : "light"}
        />
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
