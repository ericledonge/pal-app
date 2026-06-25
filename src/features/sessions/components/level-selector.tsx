import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { useColorScheme } from "react-native";

import { t } from "@/lib/i18n";

type LevelSelectorProps = {
  mode: "myLevel" | "all";
  onModeChange: (mode: "myLevel" | "all") => void;
};

export const LevelSelector = ({ mode, onModeChange }: LevelSelectorProps) => {
  const colorScheme = useColorScheme();

  return (
    <SegmentedControl
      values={[t("sessions.myLevel"), t("sessions.allLevels")]}
      selectedIndex={mode === "myLevel" ? 0 : 1}
      onChange={({ nativeEvent }) =>
        onModeChange(nativeEvent.selectedSegmentIndex === 0 ? "myLevel" : "all")
      }
      appearance={colorScheme === "dark" ? "dark" : "light"}
    />
  );
};
