import type { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./text";

export interface ScreenHeaderProps {
  title: string;
  /** Action optionnelle alignée à droite (ex. bouton réglages). */
  action?: ReactNode;
}

// En-tête d'écran standardisé, réutilisé par profil / réglages / feedback.
export const ScreenHeader = ({ title, action }: ScreenHeaderProps) => {
  return (
    <View className="flex-row items-end justify-between bg-background px-lg pb-sm pt-2xl">
      <Text variant="title">{title}</Text>
      {action ? <View>{action}</View> : null}
    </View>
  );
};
