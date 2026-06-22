import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { t } from "@/lib/i18n";

import { Button } from "./button";
import { Text } from "./text";

// Composants transverses d'état d'écran (chargement / vide / erreur), réutilisés partout.

export const ScreenLoading = () => (
  <View className="flex-1 items-center justify-center">
    <ActivityIndicator />
  </View>
);

interface ScreenEmptyProps {
  message: string;
  action?: ReactNode;
}

export const ScreenEmpty = ({ message, action }: ScreenEmptyProps) => (
  <View className="flex-1 items-center justify-center gap-md px-lg">
    <Text variant="body" className="text-center text-on-surface-muted">
      {message}
    </Text>
    {action}
  </View>
);

interface ScreenErrorProps {
  message: string;
  onRetry?: () => void;
}

export const ScreenError = ({ message, onRetry }: ScreenErrorProps) => (
  <View className="flex-1 items-center justify-center gap-md px-lg">
    <Text variant="body" className="text-center text-error">
      {message}
    </Text>
    {onRetry ? <Button variant="secondary" label={t("common.retry")} onPress={onRetry} /> : null}
  </View>
);
