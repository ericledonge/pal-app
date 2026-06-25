import { View } from "react-native";

import { Text } from "@/components/ui/text";

import type { AgendaSection } from "../domain/session.service";
import { SlotCard } from "./slot-card";

interface CourtAreaSectionProps {
  section: AgendaSection;
}

// Une court area de l'agenda (parc / patinoire) : libellé du lieu suivi de ses créneaux.
export const CourtAreaSection = ({ section }: CourtAreaSectionProps) => (
  <View className="gap-sm">
    <Text variant="label" className="text-on-surface-muted">
      {section.courtAreaLabel}
    </Text>
    {section.slots.map((slot) => (
      <SlotCard key={slot.id} slot={slot} />
    ))}
  </View>
);
