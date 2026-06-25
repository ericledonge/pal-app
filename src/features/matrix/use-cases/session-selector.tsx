import { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";
import { t } from "@/lib/i18n";

import type { SessionPickerRow, SessionStatus } from "../domain/matrix.session-select";

interface SessionSelectorProps {
  rows: SessionPickerRow[];
  /** Id de la session effective (auto ou choisie), `null` si aucune. */
  selectedId: string | null;
  /** Vrai si l'utilisateur a défini son niveau (détection auto possible). */
  hasLevel: boolean;
  onSelect: (id: string) => void;
}

const STATUS_PILL: Record<SessionStatus, string> = {
  "en-cours": "border-primary bg-primary",
  "a-venir": "border-outline bg-surface-muted",
  passee: "border-outline bg-surface-muted opacity-60",
};

const StatusPill = ({ row }: { row: SessionPickerRow }) => (
  <View className={cn("self-start rounded-full border px-sm py-2xs", STATUS_PILL[row.status])}>
    <Text
      variant="caption"
      className={row.status === "en-cours" ? "text-on-primary" : "text-on-surface-muted"}
    >
      {row.statusLabel}
    </Text>
  </View>
);

export const SessionSelector = ({ rows, selectedId, hasLevel, onSelect }: SessionSelectorProps) => {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = rows.find((row) => row.id === selectedId) ?? null;

  const choose = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <>
      <Card className="gap-sm">
        {selected ? (
          <View className="flex-row items-center justify-between gap-md">
            <View className="flex-1 gap-2xs">
              <StatusPill row={selected} />
              <Text variant="cardTitle">
                {selected.horaire} · {selected.niveauLabel}
              </Text>
              <Text variant="caption">
                {t("matrix.sessionMeta", { count: selected.count, lieu: selected.lieuLabel })}
              </Text>
            </View>
            <Button
              variant="secondary"
              label={t("matrix.changeSession")}
              onPress={() => setOpen(true)}
            />
          </View>
        ) : (
          <View className="gap-sm">
            <Text variant="cardTitle">{t("matrix.sessionNone")}</Text>
            <Text variant="caption">
              {hasLevel ? t("matrix.sessionNoneHint") : t("matrix.sessionSetLevel")}
            </Text>
            <Button label={t("matrix.chooseSession")} onPress={() => setOpen(true)} />
          </View>
        )}
      </Card>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        {/* Backdrop : layout 100 % en style inline. NativeWind gère mal un className couplé à un
            id de style (StyleSheet.absoluteFill) → on évite le merge pour garantir le plein écran. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.close")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
          onPress={() => setOpen(false)}
        >
          {/* onPress vide : absorbe les taps sur la feuille pour ne pas fermer la modale.
              maxHeight inline (et non className) : NativeWind ne plafonne pas un `%` arbitraire. */}
          <Pressable
            onPress={() => {}}
            style={{ maxHeight: "70%", paddingBottom: insets.bottom + 16 }}
            className="rounded-t-3xl border border-outline bg-background px-lg pt-lg"
          >
            <View className="mb-md flex-row items-center justify-between">
              <Text variant="cardTitle">{t("matrix.sessionPickerTitle")}</Text>
              <Button variant="ghost" label={t("common.close")} onPress={() => setOpen(false)} />
            </View>
            {rows.length === 0 ? (
              <Text variant="caption">{t("matrix.sessionEmpty")}</Text>
            ) : (
              <ScrollView contentContainerClassName="gap-sm">
                {rows.map((row) => (
                  <Pressable
                    key={row.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: row.id === selectedId }}
                    onPress={() => choose(row.id)}
                    className={cn(
                      "flex-row items-center justify-between gap-md rounded-xl border p-md",
                      row.id === selectedId
                        ? "border-primary bg-surface"
                        : "border-outline bg-surface",
                    )}
                  >
                    <View className="flex-1 gap-2xs">
                      <Text variant="body" weight="semibold">
                        {row.horaire} · {row.niveauLabel}
                      </Text>
                      <Text variant="caption">
                        {t("matrix.sessionMeta", { count: row.count, lieu: row.lieuLabel })}
                      </Text>
                    </View>
                    <StatusPill row={row} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
