import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Hauteur standard du contenu de la tab bar iOS (au-dessus de l'inset bas / home indicator).
// Stable de longue date côté UIKit ; la barre « liquid glass » des NativeTabs s'aligne dessus.
const IOS_TAB_BAR_CONTENT_HEIGHT = 49;
// Respiration (= token `md`) pour que la dernière carte ne soit pas collée sous la barre glass.
const BREATHING = 16;

// L'inset de contenu automatique d'Expo pour les NativeTabs ne s'applique qu'au PREMIER ScrollView
// d'un écran. Nos écrans placent un en-tête fixe (ScreenHeader) au-dessus du ScrollView, qui n'est
// donc jamais détecté → la barre glass masque le bas du contenu. On compense le padding manuellement.
// Sur Android, le contenu est déjà enveloppé dans un SafeAreaView par les NativeTabs → 0.
export const useTabBarScrollPadding = (): number => {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== "ios") {
    return 0;
  }
  return insets.bottom + IOS_TAB_BAR_CONTENT_HEIGHT + BREATHING;
};
