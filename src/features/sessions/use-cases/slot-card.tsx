import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

import type { AgendaSlotViewModel } from "../domain/session.service";

interface SlotCardProps {
  slot: AgendaSlotViewModel;
  /** Si fourni, la carte devient tappable (ouverture du détail en mode « Mon niveau »). */
  onPress?: () => void;
}

// Carte présentationnelle d'un créneau (résumé) : heure, niveau/type, nb d'inscrits, terrain(s).
export const SlotCard = ({ slot, onPress }: SlotCardProps) => {
  const content = (
    <Card className="gap-2xs">
      <View className="flex-row items-center justify-between">
        <Text variant="cardTitle">{slot.heure}</Text>
        <Text variant="label" className="text-on-surface-muted">
          {slot.countLabel}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text variant="body">{slot.levelLabel || slot.kindLabel || "—"}</Text>
        {slot.terrainsLabel ? <Text variant="caption">{slot.terrainsLabel}</Text> : null}
      </View>
      {slot.kindLabel && slot.levelLabel ? <Text variant="caption">{slot.kindLabel}</Text> : null}
    </Card>
  );

  if (!onPress) {
    return content;
  }
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
};
