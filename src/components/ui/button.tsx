import { ActivityIndicator, Pressable, type PressableProps } from "react-native";

import { Text } from "@/components/ui/text";
import { cn } from "@/lib/cn";
import { useThemeColors } from "@/lib/theme";

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
  const colors = useThemeColors();
  const isDisabled = disabled || loading;
  // Le spinner reprend la couleur du libellé du variant (blanc sur primary, on-surface sur
  // secondary, accent sur ghost) — sinon il serait invisible sur les fonds clairs.
  const spinnerColor: Record<ButtonVariant, string> = {
    primary: colors.onPrimary,
    secondary: colors.onSurface,
    ghost: colors.primary,
  };
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
        <ActivityIndicator color={spinnerColor[variant]} />
      ) : (
        <Text variant="body" weight="bold" className={LABEL[variant]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};
