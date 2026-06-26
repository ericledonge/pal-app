import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// Désactivé avec « Ajouter depuis les présents » (voir bloc commenté plus bas) :
// import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Text } from "@/components/ui/text";
import { t } from "@/lib/i18n";
import { useTabBarScrollPadding } from "@/lib/safe-area";
import { setUpdatesBlocked } from "@/lib/updates/update-gate";

// Désactivé avec « Ajouter depuis les présents » (réactiver `useMemo` ci-dessus aussi) :
// import { mapPresentsToPlayers, normalizeName } from "../domain/matrix.service";
import { MatrixLiveView } from "./matrix-live-view";
import { SessionSelector } from "./session-selector";
import { useMatrixSession } from "./use-matrix-session";
import { useSessionRoster } from "./use-session-roster";

export const MatrixView = () => {
  const { windows, rows, autoSession, myLevel } = useSessionRoster();
  const session = useMatrixSession();
  const bottomPadding = useTabBarScrollPadding();
  const { effectif, config, phase, setPresents } = session;
  const [guest, setGuest] = useState("");
  // Désactivé avec « Ajouter depuis les présents » :
  // const [selection, setSelection] = useState<Set<string>>(new Set());
  // Session sélectionnée (par id, stable). Seedée une fois par la détection auto ; ensuite
  // l'utilisateur garde la main — l'horloge qui avance ne change plus la session choisie.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const appliedId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedId === null && autoSession) {
      setSelectedId(autoSession.id);
    }
  }, [autoSession, selectedId]);

  // Garde-fou auto-update : tant qu'une matrice est live, on bloque l'application d'une MAJ OTA (un
  // reload remettrait à zéro le minuteur de match). À la fin de la matrice, la MAJ en attente
  // s'applique. Posé sur le parent (phase stable) plutôt que sur MatrixLiveView, remontée à chaque
  // ronde.
  useEffect(() => {
    if (phase !== "live") {
      return undefined;
    }
    setUpdatesBlocked("matrix-live", true);
    return () => setUpdatesBlocked("matrix-live", false);
  }, [phase]);

  // Pré-remplit l'effectif avec la session sélectionnée — uniquement en phase config, et une seule
  // fois par session : un refetch des grilles ou un tick d'horloge ne réécrase pas l'effectif (le
  // garde repose sur l'id, stable), et une matrice déjà lancée (phase « live ») n'est pas touchée.
  useEffect(() => {
    if (phase !== "config" || selectedId === null || appliedId.current === selectedId) {
      return;
    }
    const chosen = windows.find((window) => window.id === selectedId);
    if (!chosen) {
      return;
    }
    setPresents(chosen.players);
    appliedId.current = selectedId;
  }, [phase, selectedId, windows, setPresents]);

  // Désactivé avec « Ajouter depuis les présents » : on n'a pas encore le nom de tous les présents
  // (réponses au sondage F1), donc cette liste afficherait trop de monde. Conservé pour réactivation.
  // const available = useMemo(() => {
  //   const allPresents = mapPresentsToPlayers(
  //     windows.flatMap((window) => window.players.map((player) => player.nom)),
  //   );
  //   const inEffectif = new Set(effectif.map((player) => normalizeName(player.nom)));
  //   return allPresents.filter((player) => !inEffectif.has(normalizeName(player.nom)));
  // }, [windows, effectif]);

  if (phase === "live") {
    return <MatrixLiveView key={session.currentIndex} session={session} />;
  }

  // Désactivé avec « Ajouter depuis les présents » :
  // const toggle = (id: string) => {
  //   setSelection((current) => {
  //     const next = new Set(current);
  //     if (next.has(id)) {
  //       next.delete(id);
  //     } else {
  //       next.add(id);
  //     }
  //     return next;
  //   });
  // };

  // const addSelection = () => {
  //   session.addPresents(available.filter((player) => selection.has(player.id)));
  //   setSelection(new Set());
  // };

  const confirmRemove = (id: string) => {
    Alert.alert(t("matrix.removeTitle"), t("matrix.removeConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("matrix.remove"), style: "destructive", onPress: () => session.removePlayer(id) },
    ]);
  };

  const handleAddGuest = () => {
    session.addGuest(guest);
    setGuest("");
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("matrix.title")} />
      <ScrollView
        contentContainerClassName="gap-md px-lg pt-md"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <SessionSelector
          rows={rows}
          selectedId={selectedId}
          hasLevel={myLevel !== null}
          onSelect={setSelectedId}
        />

        <Card className="gap-sm">
          <View className="flex-row items-center justify-between">
            <Text variant="label">{t("matrix.terrains")}</Text>
            <View className="flex-row items-center gap-sm">
              <Button
                variant="secondary"
                label="−"
                accessibilityLabel={t("matrix.decreaseTerrains")}
                onPress={() => session.setTerrains(Math.max(1, config.nbTerrains - 1))}
              />
              <Text variant="stat">{config.nbTerrains}</Text>
              <Button
                variant="secondary"
                label="+"
                accessibilityLabel={t("matrix.increaseTerrains")}
                onPress={() => session.setTerrains(config.nbTerrains + 1)}
              />
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <Text variant="label">{t("matrix.matchDuration")}</Text>
            <Input
              keyboardType="number-pad"
              value={String(config.dureeMatchMin)}
              onChangeText={(value) => session.setDuration(Number.parseInt(value, 10) || 0)}
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
              <View key={player.id} className="flex-row items-center justify-between gap-sm">
                <View className="flex-1">
                  <Text variant="bodySm" numberOfLines={1}>
                    {player.nom}
                  </Text>
                  {player.source === "invite" ? (
                    <Text variant="caption">{t("matrix.guest")}</Text>
                  ) : null}
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

        {/* Désactivé : on n'a pas encore le nom de tous les présents (réponses au sondage F1),
            la liste afficherait trop de monde. Conservé pour réactivation ultérieure.
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
        */}

        {session.canStart ? (
          <Button label={t("matrix.generate")} onPress={session.startSession} />
        ) : (
          <Text variant="caption" className="text-center">
            {t("matrix.insufficient")}
          </Text>
        )}
      </ScrollView>
    </View>
  );
};
