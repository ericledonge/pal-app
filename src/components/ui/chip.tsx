import { Pressable, type PressableProps, Text } from "react-native";

import { cn } from "@/lib/cn";

export interface ChipProps extends Omit<PressableProps, "children"> {
  label: string;
  selected?: boolean;
  className?: string;
}

export const Chip = ({ label, selected = false, className, ...props }: ChipProps) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        "self-start rounded-full border px-sm py-2xs",
        selected ? "border-primary bg-primary" : "border-outline bg-surface-muted",
        className,
      )}
      {...props}
    >
      <Text
        className={cn(
          "font-inter text-[14px]",
          selected ? "text-on-primary" : "text-on-surface-muted",
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
};
