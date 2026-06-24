import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

import type { AgendaSlotViewModel } from "../domain/session.service";

interface SlotCardProps {
  slot: AgendaSlotViewModel;
}

// Carte d'un créneau : horaire, badge de niveau, lieu + courts, capacité, et liste complète
// des inscrits (dépliable). Conçue pour tolérer l'agrandissement du texte (Dynamic Type) :
// les rangées passent à la ligne plutôt que de déborder ou tronquer.
export const SlotCard = ({ slot }: SlotCardProps) => {
  const { colorScheme } = useColorScheme();
  const [expanded, setExpanded] = useState(false);
  const muted = colorScheme === "dark" ? "#9aa6c4" : "#60646c";
  const hasRoster = slot.inscrits.length > 0;

  return (
    <Card className="gap-sm border-l-4 border-l-primary p-md">
      <View className="flex-row flex-wrap items-center justify-between gap-2xs">
        <View className="flex-row items-center gap-2xs">
          <Ionicons name="time-outline" size={18} color={muted} />
          <Text variant="cardTitle">{slot.horaire}</Text>
        </View>
        {slot.levelLabel ? (
          <View className="rounded-full bg-primary/15 px-sm py-2xs">
            <Text variant="caption" className="font-inter-semibold text-primary">
              {slot.levelLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-start justify-between gap-sm">
        <View className="flex-1 flex-row items-start gap-2xs">
          <Ionicons name="location-outline" size={16} color={muted} style={{ marginTop: 2 }} />
          <Text variant="label" className="flex-1 text-on-surface-muted">
            {slot.lieuLabel}
          </Text>
        </View>
        <View className="flex-row items-center gap-2xs">
          <Ionicons name="people-outline" size={16} color={muted} />
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
            <Text variant="label" className="flex-1 font-inter-semibold text-primary">
              {t("sessions.registrants")} ({slot.count})
            </Text>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={muted} />
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
