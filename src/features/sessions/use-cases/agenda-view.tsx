import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

import { Card } from "@/components/ui/card";
import { ScreenHeader } from "@/components/ui/screen-header";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/components/ui/screen-state";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

import type { AgendaMode } from "../domain/session.service";
import type { Day } from "../domain/session.types";
import { PlateauSection } from "./plateau-section";
import { useAgenda } from "./use-agenda";

type AgendaContentProps = Pick<
  ReturnType<typeof useAgenda>,
  "sections" | "isLoading" | "isError" | "isRefreshing" | "errorKind" | "isEmpty" | "refresh"
> & { mode: AgendaMode };

const AgendaContent = ({
  sections,
  mode,
  isLoading,
  isError,
  isRefreshing,
  errorKind,
  isEmpty,
  refresh,
}: AgendaContentProps) => {
  if (isLoading) {
    return <ScreenLoading />;
  }

  if (isError) {
    return (
      <ScreenError
        message={errorKind === "parsing" ? t("sessions.errorParsing") : t("sessions.errorNetwork")}
        onRetry={refresh}
      />
    );
  }

  if (isEmpty) {
    return (
      <ScreenEmpty
        message={mode === "myLevel" ? t("sessions.emptyMyLevel") : t("sessions.empty")}
      />
    );
  }

  return (
    <ScrollView
      contentContainerClassName="gap-md px-lg pb-2xl"
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
    >
      {sections.map((section) => (
        <PlateauSection key={section.plateau} section={section} />
      ))}
    </ScrollView>
  );
};

export const AgendaView = () => {
  const [day, setDay] = useState<Day>("today");
  const [mode, setMode] = useState<AgendaMode>("myLevel");
  const { colorScheme } = useColorScheme();
  const { sections, myLevel, isLoading, isError, isRefreshing, errorKind, isEmpty, refresh } =
    useAgenda(day, mode);

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
        <Card className="flex-row items-center justify-between gap-md p-md">
          <View className="flex-1 gap-2xs">
            <Text variant="cardTitle">{t("sessions.myLevel")}</Text>
            <Text variant="label">
              {myLevel
                ? t("sessions.myLevelFilterSubtitle", { level: myLevel })
                : t("sessions.myLevelFilterSubtitleGeneric")}
            </Text>
          </View>
          <Switch
            value={mode === "myLevel"}
            onValueChange={(on) => setMode(on ? "myLevel" : "all")}
            accessibilityLabel={t("sessions.myLevel")}
          />
        </Card>
      </View>
      <AgendaContent
        sections={sections}
        mode={mode}
        isLoading={isLoading}
        isError={isError}
        isRefreshing={isRefreshing}
        errorKind={errorKind}
        isEmpty={isEmpty}
        refresh={refresh}
      />
    </View>
  );
};
