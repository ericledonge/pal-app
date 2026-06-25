import { SegmentedControl } from "@expo/ui/community/segmented-control";
import { useColorScheme } from "react-native";

import { t } from "@/lib/i18n";

type DaySelectorProps = {
  day: "today" | "tomorrow";
  onDayChange: (day: "today" | "tomorrow") => void;
};

export const DaySelector = ({ day, onDayChange }: DaySelectorProps) => {
  const colorScheme = useColorScheme();

  return (
    <SegmentedControl
      values={[t("sessions.today"), t("sessions.tomorrow")]}
      selectedIndex={day === "today" ? 0 : 1}
      onChange={({ nativeEvent }) =>
        onDayChange(nativeEvent.selectedSegmentIndex === 0 ? "today" : "tomorrow")
      }
      appearance={colorScheme === "dark" ? "dark" : "light"}
    />
  );
};
