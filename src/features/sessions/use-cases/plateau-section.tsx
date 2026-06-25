import { View } from "react-native";

import { Text } from "@/components/ui/text";

import type { AgendaSection } from "../domain/session.service";
import { SlotCard } from "./slot-card";

interface PlateauSectionProps {
  section: AgendaSection;
}

// Un plateau de l'agenda (parc / patinoire) : libellé du lieu suivi de ses créneaux.
export const PlateauSection = ({ section }: PlateauSectionProps) => (
  <View className="gap-sm">
    <Text variant="label" className="text-on-surface-muted">
      {section.plateauLabel}
    </Text>
    {section.slots.map((slot) => (
      <SlotCard key={slot.id} slot={slot} />
    ))}
  </View>
);
