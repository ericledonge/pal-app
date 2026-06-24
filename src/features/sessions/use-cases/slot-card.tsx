import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

import type { AgendaSlotViewModel } from "../domain/session.service";

const PREVIEW = 4;

const initials = (nom: string): string =>
  nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

interface SlotCardProps {
  slot: AgendaSlotViewModel;
  /** Ouvre la liste complète des inscrits (mode « Mon niveau »). */
  onShowAll?: () => void;
}

// Carte d'un créneau : horaire, badge de niveau, lieu + courts, capacité, et liste d'inscrits
// dépliable (aperçu + « + N autres » → liste complète).
export const SlotCard = ({ slot, onShowAll }: SlotCardProps) => {
  const { colorScheme } = useColorScheme();
  const [expanded, setExpanded] = useState(false);
  const muted = colorScheme === "dark" ? "#9aa6c4" : "#60646c";
  const hasRoster = slot.inscrits.length > 0;
  const preview = slot.inscrits.slice(0, PREVIEW);
  const extra = slot.inscrits.length - preview.length;

  return (
    <Card className="gap-sm border-l-4 border-l-primary p-md">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2xs">
          <Ionicons name="time-outline" size={18} color={muted} />
          <Text variant="cardTitle">{slot.horaire}</Text>
        </View>
        {slot.levelLabel ? (
          <View
            className={`rounded-full px-sm py-2xs ${slot.multiNiveau ? "bg-secondary/20" : "bg-primary/15"}`}
          >
            <Text
              variant="caption"
              className={`font-inter-semibold ${slot.multiNiveau ? "text-on-secondary" : "text-primary"}`}
            >
              {slot.levelLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-center justify-between gap-sm">
        <View className="flex-1 flex-row items-center gap-2xs">
          <Ionicons name="location-outline" size={16} color={muted} />
          <Text variant="label" className="flex-1 text-on-surface-muted" numberOfLines={1}>
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
            className="flex-row items-center justify-between"
          >
            <Text variant="label" className="font-inter-semibold text-primary">
              {t("sessions.registrants")}
            </Text>
            <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={18} color={muted} />
          </Pressable>
          {expanded ? (
            <View className="gap-xs">
              {preview.map((nom, index) => (
                <View key={`${nom}-${index}`} className="flex-row items-center gap-sm">
                  <View className="h-7 w-7 items-center justify-center rounded-full bg-surface-muted">
                    <Text variant="caption" className="font-inter-semibold text-on-surface">
                      {initials(nom)}
                    </Text>
                  </View>
                  <Text variant="label" className="flex-1 text-on-surface" numberOfLines={1}>
                    {nom}
                  </Text>
                </View>
              ))}
              {extra > 0 ? (
                <Pressable accessibilityRole="button" onPress={onShowAll} className="pt-2xs">
                  <Text variant="caption" className="text-primary">
                    + {extra} {extra > 1 ? "autres" : "autre"}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}
    </Card>
  );
};
