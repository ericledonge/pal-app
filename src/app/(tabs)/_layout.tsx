import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { t } from "@/lib/i18n";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="sessions"
        options={{
          title: t("tabs.sessions"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="matrice"
        options={{
          title: t("tabs.matrix"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
