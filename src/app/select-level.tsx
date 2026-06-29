import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { LevelGrid } from "@/features/level/use-cases/level-grid";
import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";
import { trackEvent } from "@/lib/analytics";
import { t } from "@/lib/i18n";
import type { LevelCode } from "@/shared/domain/level";

// Sélecteur modal de niveau (depuis le profil). Pré-rempli sur le niveau actuel ;
// fermer sans enregistrer ne change rien.
export default function SelectLevelScreen() {
  const router = useRouter();
  const { level, setLevel } = useLevelPreference();
  const [selected, setSelected] = useState<LevelCode | null>(level);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) {
      return;
    }
    setSaving(true);
    await setLevel(selected);
    trackEvent("level_changed", { level: selected });
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title={t("profile.changeLevel")} onClose={() => router.back()} />
      <ScrollView contentContainerClassName="gap-lg px-lg py-md">
        <LevelGrid selected={selected} onSelect={setSelected} />
        <Button
          label={t("common.save")}
          disabled={!selected}
          loading={saving}
          onPress={() => void handleSave()}
        />
      </ScrollView>
    </View>
  );
}
