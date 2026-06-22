import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";

export interface InputProps extends TextInputProps {
  className?: string;
}

export const Input = ({ className, ...props }: InputProps) => {
  return (
    <TextInput
      placeholderTextColor="#9aa6c4"
      className={cn(
        "rounded-xl border border-outline bg-surface px-md py-sm font-inter text-[16px] text-on-surface",
        className,
      )}
      {...props}
    />
  );
};
