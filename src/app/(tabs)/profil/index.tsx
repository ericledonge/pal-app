import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";
import type { ThemeMode } from "@/features/preferences/domain/preferences.storage";
import { usePreferences } from "@/features/preferences/use-cases/use-preferences";
import { t } from "@/lib/i18n";
import { useThemeColors } from "@/lib/theme";

const PRIVACY_URL = "https://ericledonge.github.io/pal-app/privacy.html";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const Chevron = ({ color }: { color: string }) => (
  <Ionicons name="chevron-forward" size={20} color={color} />
);

interface SettingsRowProps {
  icon: IoniconName;
  iconColor: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

const SettingsRow = ({
  icon,
  iconColor,
  title,
  subtitle,
  right,
  onPress,
  accessibilityLabel,
}: SettingsRowProps) => (
  <Pressable
    accessibilityRole={onPress ? "button" : undefined}
    accessibilityLabel={accessibilityLabel}
    disabled={!onPress}
    onPress={onPress}
  >
    <Card className="flex-row items-center gap-md">
      <Ionicons name={icon} size={22} color={iconColor} />
      <View className="flex-1 gap-2xs">
        <Text variant="body">{title}</Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {right}
    </Card>
  </Pressable>
);

export default function ProfilScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { level } = useLevelPreference();
  const { preferences, setPreference } = usePreferences();
  const version = Constants.expoConfig?.version ?? "—";

  const iconColor = colors.onSurface;
  const mutedColor = colors.onSurfaceMuted;

  const themeOptions: { mode: ThemeMode; label: string }[] = [
    { mode: "system", label: t("profile.themeSystem") },
    { mode: "light", label: t("profile.themeLight") },
    { mode: "dark", label: t("profile.themeDark") },
  ];

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("profile.title")} />
      <ScrollView contentContainerClassName="gap-md px-lg py-md">
        <SettingsRow
          icon="tennisball-outline"
          iconColor={iconColor}
          title={t("profile.myLevel")}
          subtitle={t("profile.changeLevelSubtitle")}
          onPress={() => router.push("/select-level")}
          accessibilityLabel={t("profile.changeLevel")}
          right={
            <View className="flex-row items-center gap-sm">
              <Text variant="body" className="text-primary">
                {level ?? t("profile.noLevel")}
              </Text>
              <Chevron color={mutedColor} />
            </View>
          }
        />

        <Card className="gap-sm">
          <View className="flex-row items-center gap-md">
            <Ionicons name="contrast-outline" size={22} color={iconColor} />
            <View className="flex-1 gap-2xs">
              <Text variant="body">{t("profile.theme")}</Text>
              <Text variant="caption">{t("profile.themeSubtitle")}</Text>
            </View>
          </View>
          <View className="flex-row gap-sm">
            {themeOptions.map((option) => (
              <Chip
                key={option.mode}
                label={option.label}
                selected={preferences.themeMode === option.mode}
                onPress={() => void setPreference("themeMode", option.mode)}
              />
            ))}
          </View>
        </Card>

        <SettingsRow
          icon="chatbubble-ellipses-outline"
          iconColor={iconColor}
          title={t("profile.feedback")}
          subtitle={t("profile.feedbackSubtitle")}
          onPress={() => router.push("/feedback")}
          right={<Chevron color={mutedColor} />}
        />

        <SettingsRow
          icon="lock-closed-outline"
          iconColor={iconColor}
          title={t("profile.privacy")}
          subtitle={t("profile.privacySubtitle")}
          onPress={() => void WebBrowser.openBrowserAsync(PRIVACY_URL)}
          right={<Chevron color={mutedColor} />}
        />

        <View className="items-center pt-md">
          <Text variant="caption">
            {t("profile.version")} {version}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
