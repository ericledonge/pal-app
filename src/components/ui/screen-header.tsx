import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { t } from "@/lib/i18n";
import { useThemeColors } from "@/lib/theme";

import { Text } from "./text";

export interface ScreenHeaderProps {
  title: string;
  /** Action optionnelle alignée à droite (ex. bouton réglages). */
  action?: ReactNode;
  /** Si fourni, affiche un bouton de fermeture (×) à droite — pour les écrans en modal. */
  onClose?: () => void;
}

// En-tête d'écran standardisé, réutilisé par profil / réglages / feedback.
// Le padding haut intègre l'inset de safe area (notch / Dynamic Island) ; valeur dynamique
// → style inline (NativeWind ne gère pas les insets). Le +12 ménage une respiration sous le notch.
// onClose : pour les écrans modaux (feedback, sélection de niveau), donne une sortie explicite
// (× en haut à droite) — sinon, sur Android, seul le bouton retour système permet de quitter.
export const ScreenHeader = ({ title, action, onClose }: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  return (
    <View
      className="flex-row items-start justify-between gap-sm bg-background px-lg pb-sm"
      style={{ paddingTop: insets.top + 12 }}
    >
      {/* flex-1 : le titre occupe l'espace dispo et passe sur plusieurs lignes (gros corps de
          police accessibilité) au lieu de pousser l'action/× hors écran ou de la tronquer. */}
      <Text variant="title" className="flex-1">
        {title}
      </Text>
      {action || onClose ? (
        <View className="flex-row items-center gap-sm">
          {action}
          {onClose ? (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
              // Zone tactile 44×44 (guideline HIG). Taille en style inline : garantie par RN,
              // indépendante du rendu NativeWind des classes de dimension arbitraires.
              style={{ height: 44, width: 44 }}
              className="items-center justify-center rounded-full border border-outline bg-surface-muted active:opacity-70"
            >
              <Ionicons name="close" size={24} color={colors.onSurface} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};
