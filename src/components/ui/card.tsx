import { View, type ViewProps } from "react-native";

import { cn } from "@/lib/cn";

export interface CardProps extends ViewProps {
  className?: string;
}

export const Card = ({ className, ...props }: CardProps) => {
  return (
    <View
      className={cn("rounded-xl border border-outline bg-surface p-xl", className)}
      {...props}
    />
  );
};
