import { Ionicons } from "@expo/vector-icons";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { t } from "@/lib/i18n";

// Onglets natifs (react-native-screens) : barre liquid glass automatique sur iOS 26+,
// Material 3 sur Android. On ne fixe PAS de `backgroundColor` — il rendrait la barre
// opaque et supprimerait l'effet glass. Le `tintColor` colore l'onglet sélectionné.
// Icônes : SF Symbols sur iOS (rendu natif), repli Ionicons via `src` sur Android.
export default function TabsLayout() {
  return (
    <NativeTabs tintColor="#ff5700">
      <NativeTabs.Trigger name="sessions">
        <NativeTabs.Trigger.Icon
          sf="calendar"
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="calendar-outline" />}
        />
        <NativeTabs.Trigger.Label>{t("tabs.sessions")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="matrice">
        <NativeTabs.Trigger.Icon
          sf="square.grid.2x2"
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="grid-outline" />}
        />
        <NativeTabs.Trigger.Label>{t("tabs.matrix")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profil">
        <NativeTabs.Trigger.Icon
          sf="person.crop.circle"
          src={<NativeTabs.Trigger.VectorIcon family={Ionicons} name="person-outline" />}
        />
        <NativeTabs.Trigger.Label>{t("tabs.profile")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
