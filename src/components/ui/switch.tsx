import { Switch as RNSwitch, type SwitchProps } from "react-native";

import { useThemeColors } from "@/lib/theme";

// Piste activée : accent de marque (primary, constant clair/sombre). Piste désactivée : neutre
// d'outline selon le thème. Le pouce reste blanc (on-primary) dans les deux modes (cf. maquette).
export type SwitchUIProps = Omit<SwitchProps, "trackColor" | "thumbColor" | "ios_backgroundColor">;

export const Switch = (props: SwitchUIProps) => {
  const colors = useThemeColors();

  return (
    <RNSwitch
      trackColor={{ false: colors.outline, true: colors.primary }}
      thumbColor={colors.onPrimary}
      ios_backgroundColor={colors.outline}
      {...props}
    />
  );
};
