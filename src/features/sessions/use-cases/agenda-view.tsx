import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

import { ScreenHeader } from "@/components/ui/screen-header";
import { ScreenEmpty, ScreenError, ScreenLoading } from "@/components/ui/screen-state";
import { t } from "@/lib/i18n";

import type { AgendaMode } from "../domain/session.service";
import type { Day } from "../domain/session.types";
import { CourtAreaSection } from "./court-area-section";
import { DaySelector } from "./day-selector";
import { LevelSelector } from "./level-selector";
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
        <CourtAreaSection key={section.courtArea} section={section} />
      ))}
    </ScrollView>
  );
};

export const AgendaView = () => {
  const [day, setDay] = useState<Day>("today");
  const [mode, setMode] = useState<AgendaMode>("myLevel");
  const { sections, myLevel, isLoading, isError, isRefreshing, errorKind, isEmpty, refresh } =
    useAgenda(day, mode);

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("sessions.title")} />
      <View className="gap-sm px-lg pb-sm">
        <DaySelector day={day} onDayChange={setDay} />
        <LevelSelector mode={mode} onModeChange={setMode} myLevel={myLevel} />
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
