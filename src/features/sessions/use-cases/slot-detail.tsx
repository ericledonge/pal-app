import { Modal, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

import type { AgendaSlotViewModel } from "../domain/session.service";

interface SlotDetailProps {
  slot: AgendaSlotViewModel | null;
  onClose: () => void;
}

// Détail d'un créneau (mode « Mon niveau ») : infos + liste complète des inscrits.
export const SlotDetail = ({ slot, onClose }: SlotDetailProps) => {
  return (
    <Modal visible={slot !== null} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 gap-md bg-background px-lg pt-2xl">
        {slot ? (
          <>
            <Text variant="title">{slot.heure}</Text>
            <Text variant="body" className="text-on-surface-muted">
              {[slot.plateauLabel, slot.levelLabel || slot.kindLabel, slot.terrainsLabel]
                .filter(Boolean)
                .join(" · ")}
            </Text>

            <Text variant="label">
              {t("sessions.registrants")} · {slot.countLabel}
            </Text>
            <ScrollView contentContainerClassName="gap-2xs pb-2xl">
              {slot.inscrits.length === 0 ? (
                <Text variant="body" className="text-on-surface-muted">
                  {t("sessions.noRegistrants")}
                </Text>
              ) : (
                slot.inscrits.map((nom, index) => (
                  <Text key={`${nom}-${index}`} variant="body">
                    {nom}
                  </Text>
                ))
              )}
            </ScrollView>

            <Button variant="secondary" label={t("common.close")} onPress={onClose} />
          </>
        ) : null}
      </View>
    </Modal>
  );
};
