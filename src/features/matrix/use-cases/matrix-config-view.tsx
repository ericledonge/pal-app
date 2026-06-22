import { useEffect, useRef, useState } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

import { useMatrixSession } from "./use-matrix-session";
import { usePresentPlayers } from "./use-present-players";

export const MatrixConfigView = () => {
  const { players: presents } = usePresentPlayers();
  const { effectif, addGuest, addPresents } = useMatrixSession();
  const [guest, setGuest] = useState("");
  const preloaded = useRef(false);

  // Pré-charge l'effectif depuis les présents F1, une seule fois (au démarrage de la session).
  useEffect(() => {
    if (!preloaded.current && presents.length > 0) {
      addPresents(presents);
      preloaded.current = true;
    }
    // eslint-disable-next-line react/exhaustive-deps
  }, [presents]);

  const handleAddGuest = () => {
    addGuest(guest);
    setGuest("");
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("matrix.title")} />
      <ScrollView contentContainerClassName="gap-md px-lg py-md">
        <Card className="gap-sm">
          <Text variant="label">
            {t("matrix.roster")} ({effectif.length})
          </Text>
          {effectif.length === 0 ? (
            <Text variant="caption">{t("matrix.empty")}</Text>
          ) : (
            effectif.map((player) => (
              <View key={player.id} className="flex-row items-center justify-between">
                <Text variant="body">{player.nom}</Text>
                <Text variant="caption">
                  {player.source === "present" ? t("matrix.present") : t("matrix.guest")}
                </Text>
              </View>
            ))
          )}
        </Card>

        <Card className="gap-sm">
          <Text variant="label">{t("matrix.addGuest")}</Text>
          <Input
            value={guest}
            onChangeText={setGuest}
            placeholder={t("matrix.guestPlaceholder")}
            autoCapitalize="words"
          />
          <Button
            label={t("matrix.addGuest")}
            disabled={guest.trim().length === 0}
            onPress={handleAddGuest}
          />
        </Card>
      </ScrollView>
    </View>
  );
};
