import { Feather, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { WeatherSeverity } from "@/features/weather/domain/weather.types";
import { t } from "@/lib/i18n";
import { useThemeColors } from "@/lib/theme";

import type { AgendaSlotViewModel } from "../domain/session.service";

interface SlotCardProps {
  slot: AgendaSlotViewModel;
}

export const SlotCard = ({ slot }: SlotCardProps) => {
  const { onSurfaceMuted, primary, secondary, warning, error } = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const hasRoster = slot.inscrits.length > 0;
  // Couleur d'accent du créneau : orange si c'est mon niveau, or sinon — partagée par la
  // pastille de niveau et le libellé des inscrits pour un code couleur cohérent.
  const accentColor = slot.matchesMyLevel ? "#ff5700" : "#8a6200";
  const weather = slot.weather;
  // Code couleur de la sévérité météo : orange (warning) / rouge (alert) ; `undefined` = sourd
  // par défaut (la ligne garde la couleur muted et la graisse normale).
  const severityColor = (severity: WeatherSeverity): string | undefined =>
    severity === "alert" ? error : severity === "warning" ? warning : undefined;
  const precipColor = weather ? severityColor(weather.precipitationSeverity) : undefined;
  const windColor = weather ? severityColor(weather.windSeverity) : undefined;

  // Heure : protégée par shrink-0 pour ne jamais être écrasée par la pastille à côté.
  const clock = (
    <View className="shrink-0 flex-row items-center gap-2xs">
      <Ionicons name="time-outline" size={18} color={onSurfaceMuted} />
      <Text variant="cardTitle">{slot.horaire}</Text>
    </View>
  );

  // Pastille de niveau. La graisse par défaut des items flex en RN est `flexShrink: 0`, et on
  // ne fixe aucun `numberOfLines` : le texte n'est donc jamais tronqué. En cas de manque de place
  // (libellé long ou police agrandie), la pastille passe simplement à la ligne (flex-wrap).
  const renderLevelPill = () =>
    slot.levelLabel ? (
      <View
        className="rounded-full px-sm py-2xs"
        style={{
          backgroundColor: slot.matchesMyLevel ? "rgba(255,87,0,0.15)" : "rgba(255,184,0,0.15)",
        }}
      >
        <Text variant="label" weight="semibold" style={{ color: accentColor }}>
          {slot.levelLabel}
        </Text>
      </View>
    ) : null;

  // Code de niveau unique (court) → pastille en haut à droite, sur la ligne de l'heure ;
  // elle repasse sous l'heure si la place manque. Multi-groupes ou libellé de jeu libre (long)
  // → pastille pleine largeur sous l'heure dès le départ.
  const pillInline = slot.isLevelCode && !slot.multiNiveau;

  return (
    <Card
      className="gap-sm border-l-4 p-md"
      style={{ borderLeftColor: slot.matchesMyLevel ? primary : secondary }}
    >
      {pillInline ? (
        <View className="flex-row flex-wrap items-center justify-between gap-sm">
          {clock}
          {renderLevelPill()}
        </View>
      ) : (
        <View className="gap-2xs">
          {clock}
          {slot.levelLabel ? <View className="self-start">{renderLevelPill()}</View> : null}
        </View>
      )}

      {/* Détails alignés (mêmes icône + retrait) : courts puis météo, sans fond. Le plateau
          (parc/patinoire) n'est pas répété — c'est déjà le titre de la section. */}
      <View className="gap-xs">
        {slot.terrainsLabel ? (
          <View className="flex-row items-center gap-2xs">
            <Ionicons name="grid-outline" size={14} color={onSurfaceMuted} />
            <Text variant="label" className="text-on-surface-muted">
              {slot.terrains.length > 1 ? "Courts" : "Court"} {slot.terrainsLabel}
            </Text>
          </View>
        ) : null}
        {weather ? (
          <View accessible accessibilityLabel={weather.a11yLabel} className="gap-xs">
            <View className="flex-row items-center gap-2xs">
              <Ionicons name="thermometer-outline" size={14} color={onSurfaceMuted} />
              <Text variant="label" className="text-on-surface-muted">
                {weather.apparentTemperatureLabel} ressenti
              </Text>
            </View>
            <View className="flex-row items-center gap-2xs">
              <Ionicons name="water-outline" size={14} color={precipColor ?? onSurfaceMuted} />
              <Text
                variant="label"
                weight={precipColor ? "semibold" : "regular"}
                className="text-on-surface-muted"
                style={precipColor ? { color: precipColor } : undefined}
              >
                {weather.precipitationLabel} de pluie ({weather.precipitationMmLabel})
              </Text>
            </View>
            <View className="flex-row items-center gap-2xs">
              <Feather name="wind" size={14} color={windColor ?? onSurfaceMuted} />
              <Text
                variant="label"
                weight={windColor ? "semibold" : "regular"}
                className="text-on-surface-muted"
                style={windColor ? { color: windColor } : undefined}
              >
                {weather.windLabel}
              </Text>
            </View>
          </View>
        ) : null}
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
