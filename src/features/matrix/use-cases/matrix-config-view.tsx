import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";

import { normalizeName } from "../domain/matrix.service";
import { useMatrixSession } from "./use-matrix-session";
import { usePresentPlayers } from "./use-present-players";

export const MatrixConfigView = () => {
  const { players: presents } = usePresentPlayers();
  const { effectif, config, addGuest, addPresents, removePlayer, setTerrains, setDuration } =
    useMatrixSession();
  const [guest, setGuest] = useState("");
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const preloaded = useRef(false);

  // Pré-charge l'effectif depuis les présents F1, une seule fois (au démarrage de la session).
  useEffect(() => {
    if (!preloaded.current && presents.length > 0) {
      addPresents(presents);
      preloaded.current = true;
    }
    // eslint-disable-next-line react/exhaustive-deps
  }, [presents]);

  // Présents pas encore dans l'effectif (les déjà-ajoutés sont masqués de la sélection).
  const available = useMemo(() => {
    const inEffectif = new Set(effectif.map((player) => normalizeName(player.nom)));
    return presents.filter((player) => !inEffectif.has(normalizeName(player.nom)));
  }, [presents, effectif]);

  const toggle = (id: string) => {
    setSelection((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addSelection = () => {
    addPresents(available.filter((player) => selection.has(player.id)));
    setSelection(new Set());
  };

  const confirmRemove = (id: string) => {
    Alert.alert(t("matrix.removeTitle"), t("matrix.removeConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("matrix.remove"), style: "destructive", onPress: () => removePlayer(id) },
    ]);
  };

  const handleAddGuest = () => {
    addGuest(guest);
    setGuest("");
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("matrix.title")} />
      <ScrollView contentContainerClassName="gap-md px-lg py-md">
        <Card className="gap-sm">
          <View className="flex-row items-center justify-between">
            <Text variant="label">{t("matrix.terrains")}</Text>
            <View className="flex-row items-center gap-sm">
              <Button
                variant="secondary"
                label="−"
                onPress={() => setTerrains(Math.max(1, config.nbTerrains - 1))}
              />
              <Text variant="stat">{config.nbTerrains}</Text>
              <Button
                variant="secondary"
                label="+"
                onPress={() => setTerrains(config.nbTerrains + 1)}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text variant="label">{t("matrix.matchDuration")}</Text>
            <Input
              keyboardType="number-pad"
              value={String(config.dureeMatchMin)}
              onChangeText={(value) => setDuration(Number.parseInt(value, 10) || 0)}
              className="w-20 text-center"
            />
          </View>
        </Card>

        <Card className="gap-sm">
          <Text variant="label">
            {t("matrix.roster")} ({effectif.length})
          </Text>
          {effectif.length === 0 ? (
            <Text variant="caption">{t("matrix.empty")}</Text>
          ) : (
            effectif.map((player) => (
              <View key={player.id} className="flex-row items-center justify-between">
                <View>
                  <Text variant="body">{player.nom}</Text>
                  <Text variant="caption">
                    {player.source === "present" ? t("matrix.present") : t("matrix.guest")}
                  </Text>
                </View>
                <Button
                  variant="ghost"
                  label={t("matrix.remove")}
                  onPress={() => confirmRemove(player.id)}
                />
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

        {available.length > 0 ? (
          <Card className="gap-sm">
            <Text variant="label">{t("matrix.addFromPresents")}</Text>
            <View className="flex-row flex-wrap gap-sm">
              {available.map((player) => (
                <Chip
                  key={player.id}
                  label={player.nom}
                  selected={selection.has(player.id)}
                  onPress={() => toggle(player.id)}
                />
              ))}
            </View>
            <Button
              label={`${t("matrix.addSelection")} (${selection.size})`}
              disabled={selection.size === 0}
              onPress={addSelection}
            />
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
};
