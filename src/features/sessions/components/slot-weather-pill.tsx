import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import { Text } from "@/components/ui/text";
import type { SlotWeatherViewModel } from "@/features/weather/domain/weather.types";
import { useThemeColors } from "@/lib/theme";

interface SlotWeatherPillProps {
  weather: SlotWeatherViewModel;
}

// Pastille météo compacte (coin haut-droit de la carte) : température + risque de pluie à
// l'heure de début. Le risque élevé ressort via l'accent de marque (orange).
export const SlotWeatherPill = ({ weather }: SlotWeatherPillProps) => {
  const { onSurface, onSurfaceMuted, primary } = useThemeColors();
  const precipColor =
    weather.precipitationLevel === "high"
      ? primary
      : weather.precipitationLevel === "moderate"
        ? onSurface
        : onSurfaceMuted;

  return (
    <View
      accessibilityLabel={weather.a11yLabel}
      className="shrink-0 flex-row items-center gap-2xs rounded-full bg-surface-muted px-sm py-2xs"
    >
      <Text variant="label" weight="semibold" className="text-on-surface">
        {weather.temperatureLabel}
      </Text>
      <View className="h-3 w-px bg-outline" />
      <View className="flex-row items-center gap-2xs">
        <Ionicons name="water-outline" size={14} color={precipColor} />
        <Text
          variant="label"
          weight={weather.precipitationLevel === "high" ? "semibold" : "regular"}
          style={{ color: precipColor }}
        >
          {weather.precipitationLabel}
        </Text>
      </View>
    </View>
  );
};
