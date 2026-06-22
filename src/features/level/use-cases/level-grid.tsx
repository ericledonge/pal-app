import { View } from "react-native";

import { Chip } from "@/components/ui/chip";
import { LEVELS, type LevelCode } from "@/shared/domain/level";

export interface LevelGridProps {
  selected: LevelCode | null;
  onSelect: (level: LevelCode) => void;
}

// Grille des 9 niveaux (sélection unique, ~3 colonnes). Mutualisée entre l'onboarding
// et le sélecteur « changer de niveau » du profil — une seule source de vérité visuelle.
export const LevelGrid = ({ selected, onSelect }: LevelGridProps) => {
  return (
    <View className="flex-row flex-wrap gap-sm">
      {LEVELS.map((code) => (
        <Chip
          key={code}
          label={code}
          selected={selected === code}
          onPress={() => onSelect(code)}
          className="w-[30%] items-center"
        />
      ))}
    </View>
  );
};
