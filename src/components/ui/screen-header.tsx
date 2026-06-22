import type { ReactNode } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "./text";

export interface ScreenHeaderProps {
  title: string;
  /** Action optionnelle alignée à droite (ex. bouton réglages). */
  action?: ReactNode;
}

// En-tête d'écran standardisé, réutilisé par profil / réglages / feedback.
// Le padding haut intègre l'inset de safe area (notch / Dynamic Island) ; valeur dynamique
// → style inline (NativeWind ne gère pas les insets). Le +12 ménage une respiration sous le notch.
export const ScreenHeader = ({ title, action }: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-row items-end justify-between bg-background px-lg pb-sm"
      style={{ paddingTop: insets.top + 12 }}
    >
      <Text variant="title">{title}</Text>
      {action ? <View>{action}</View> : null}
    </View>
  );
};
