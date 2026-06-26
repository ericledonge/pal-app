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
  // Couleur d'accent du créneau : orange si c'est mon niveau, or sinon — partagée par la
  // pastille de niveau et le libellé des inscrits pour un code couleur cohérent.
  const accentColor = slot.matchesMyLevel ? "#ff5700" : "#8a6200";

  // Heure : protégée par shrink-0 pour ne jamais être écrasée par la pastille à côté.
  const clock = (
    <View className="shrink-0 flex-row items-center gap-2xs">
      <Ionicons name="time-outline" size={18} color={onSurfaceMuted} />
      <Text variant="cardTitle">{slot.horaire}</Text>
    </View>
  );

  // Pastille de niveau, alignement géré par le conteneur parent (top-right vs pleine largeur).
  // `wrap` : autorise le passage à la ligne pour la pastille pleine largeur (libellés longs) ;
  // la pastille en ligne (code court) reste sur une seule ligne.
  const renderLevelPill = (wrap: boolean) =>
    slot.levelLabel ? (
      <View
        className="rounded-full px-sm py-2xs"
        style={{
          backgroundColor: slot.matchesMyLevel ? "rgba(255,87,0,0.15)" : "rgba(255,184,0,0.15)",
        }}
      >
        <Text
          variant="label"
          weight="semibold"
          numberOfLines={wrap ? undefined : 1}
          style={{ color: accentColor }}
        >
          {slot.levelLabel}
        </Text>
      </View>
    ) : null;

  // Code de niveau unique (court) → pastille en haut à droite, sur la ligne de l'heure.
  // Multi-groupes (ex. « 2.0C & 2.5C & 2.5T ») ou libellé de jeu libre (long) → pastille
  // pleine largeur sous l'heure, qui passe à la ligne au lieu de déborder.
  const pillInline = slot.isLevelCode && !slot.multiNiveau;

  return (
    <Card
      className="gap-sm border-l-4 p-md"
      style={{ borderLeftColor: slot.matchesMyLevel ? primary : secondary }}
    >
      {pillInline ? (
        <View className="flex-row items-center justify-between gap-sm">
          {clock}
          <View className="min-w-0 shrink">{renderLevelPill(false)}</View>
        </View>
      ) : (
        <View className="gap-2xs">
          {clock}
          {slot.levelLabel ? <View className="self-start">{renderLevelPill(true)}</View> : null}
        </View>
      )}

      {/* Lieu · courts · capacité sur une rangée horizontale (exploite la largeur). */}
      <View className="flex-row flex-wrap items-center gap-md">
        <View className="flex-row items-center gap-2xs">
          <Ionicons name="location-outline" size={16} color={onSurfaceMuted} />
          <Text variant="label" className="text-on-surface-muted">
            {slot.courtAreaLabel}
          </Text>
        </View>
        {slot.terrainsLabel ? (
          <View className="flex-row items-center gap-2xs">
            <Ionicons name="grid-outline" size={14} color={onSurfaceMuted} />
            <Text variant="label" className="text-on-surface-muted">
              {slot.terrains.length > 1 ? "Courts" : "Court"} {slot.terrainsLabel}
            </Text>
          </View>
        ) : null}
        <View className="flex-row items-center gap-2xs">
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
            <Text
              variant="label"
              weight="semibold"
              className="flex-1"
              style={{ color: accentColor }}
            >
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
