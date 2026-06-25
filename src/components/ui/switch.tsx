import { useColorScheme } from "nativewind";
import { Switch as RNSwitch, type SwitchProps } from "react-native";

// Piste activée : accent de marque (#ff5700, constant clair/sombre). Piste désactivée : neutre
// d'outline selon le thème. Le pouce reste blanc dans les deux modes (cf. maquette Stitch).
const TRACK_ON = "#ff5700";
const THUMB = "#ffffff";
const TRACK_OFF_LIGHT = "#e1e4e8"; // --color-outline (clair)
const TRACK_OFF_DARK = "#2d3449"; // --color-outline (sombre)

export type SwitchUIProps = Omit<SwitchProps, "trackColor" | "thumbColor" | "ios_backgroundColor">;

export const Switch = (props: SwitchUIProps) => {
  const { colorScheme } = useColorScheme();
  const trackOff = colorScheme === "dark" ? TRACK_OFF_DARK : TRACK_OFF_LIGHT;

  return (
    <RNSwitch
      trackColor={{ false: trackOff, true: TRACK_ON }}
      thumbColor={THUMB}
      ios_backgroundColor={trackOff}
      {...props}
    />
  );
};
