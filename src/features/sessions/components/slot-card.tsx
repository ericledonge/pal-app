import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";
import { useThemeColors } from "@/lib/theme";

import type { AgendaSlotViewModel } from "../domain/session.service";

interface SlotCardProps {
  slot: AgendaSlotViewModel;
}

export const SlotCard = ({ slot }: SlotCardProps) => {
  const { onSurfaceMuted, primary, secondary } = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const hasRoster = slot.inscrits.length > 0;

  return (
    <Card
      className="gap-sm border-l-4 p-md"
      style={{ borderLeftColor: slot.matchesMyLevel ? primary : secondary }}
    >
      {/* Horaire + badge niveau aligné sous l'heure */}
      <View className="gap-2xs">
        <View className="flex-row items-center gap-2xs">
          <Ionicons name="time-outline" size={18} color={onSurfaceMuted} />
          <Text variant="cardTitle">{slot.horaire}</Text>
        </View>
        {slot.levelLabel ? (
          <View
            className="ml-[24px] self-start rounded-full px-sm py-2xs"
            style={{
              backgroundColor: slot.matchesMyLevel ? "rgba(255,87,0,0.15)" : "rgba(255,184,0,0.20)",
            }}
          >
            <Text
              variant="label"
              weight="semibold"
              className={slot.matchesMyLevel ? "text-primary" : "text-on-surface-muted"}
            >
              {slot.levelLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Lieu : court area, courts et capacité en colonne */}
      <View className="gap-2xs">
        <View className="flex-row items-center gap-2xs">
          <Ionicons
            name="location-outline"
            size={16}
            color={onSurfaceMuted}
            style={{ marginTop: 2 }}
          />
          <Text variant="label" className="text-on-surface-muted">
            {slot.courtAreaLabel}
          </Text>
        </View>
        {slot.terrainsLabel ? (
          <View className="ml-[22px] flex-row items-center gap-2xs">
            <Ionicons name="grid-outline" size={14} color={onSurfaceMuted} />
            <Text variant="label" className="text-on-surface-muted">
              {slot.terrains.length > 1 ? "Courts" : "Court"} {slot.terrainsLabel}
            </Text>
          </View>
        ) : null}
        <View className="ml-[22px] flex-row items-center gap-2xs">
          <Ionicons name="people-outline" size={14} color={onSurfaceMuted} />
          <Text variant="label" className="text-on-surface-muted">
            {slot.capaciteLabel}
          </Text>
        </View>
      </View>

      {hasRoster ? (
        <>
          <View className="h-px bg-outline" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t("sessions.registrants")} (${slot.count})`}
            onPress={() => setExpanded((value) => !value)}
            className="flex-row items-center justify-between gap-sm"
          >
            <Text variant="label" weight="semibold" className="flex-1 text-primary">
              {t("sessions.registrants")} ({slot.count})
            </Text>
            <Ionicons
              name={expanded ? "chevron-up" : "chevron-down"}
              size={18}
              color={onSurfaceMuted}
            />
          </Pressable>
          {expanded ? (
            <View className="gap-2xs">
              {slot.inscrits.map((nom, index) => (
                <Text key={`${nom}-${index}`} variant="label" className="text-on-surface">
                  {nom}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </Card>
  );
};
