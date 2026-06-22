import { ActivityIndicator, Pressable, type PressableProps, Text } from "react-native";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const CONTAINER: Record<ButtonVariant, string> = {
  primary: "bg-primary",
  secondary: "border border-outline bg-surface",
  ghost: "bg-transparent",
};

const LABEL: Record<ButtonVariant, string> = {
  primary: "text-on-primary",
  secondary: "text-on-surface",
  ghost: "text-primary",
};

export interface ButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  className?: string;
}

export const Button = ({
  label,
  variant = "primary",
  loading = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={cn(
        "min-h-[44px] flex-row items-center justify-center rounded-xl px-md py-sm",
        CONTAINER[variant],
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text className={cn("font-inter-bold text-[15px]", LABEL[variant])}>{label}</Text>
      )}
    </Pressable>
  );
};
