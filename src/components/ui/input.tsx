import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";
import { useThemeColors } from "@/lib/theme";

export interface InputProps extends TextInputProps {
  className?: string;
}

export const Input = ({ className, ...props }: InputProps) => {
  const colors = useThemeColors();
  return (
    <TextInput
      placeholderTextColor={colors.onSurfaceMuted}
      className={cn(
        "rounded-xl border border-outline bg-surface px-md py-sm font-inter text-[18px] text-on-surface",
        className,
      )}
      {...props}
    />
  );
};
