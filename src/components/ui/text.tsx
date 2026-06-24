import { Text as RNText, type TextProps } from "react-native";

import { cn } from "@/lib/cn";

export type TextVariant =
  | "display"
  | "title"
  | "subtitle"
  | "cardTitle"
  | "stat"
  | "bodyLg"
  | "body"
  | "label"
  | "caption";

const VARIANT_CLASS: Record<TextVariant, string> = {
  display: "font-lexend text-[48px] text-on-surface",
  title: "font-lexend text-[32px] text-on-surface",
  subtitle: "font-lexend text-[28px] text-on-surface",
  cardTitle: "font-lexend text-[24px] text-on-surface",
  stat: "font-lexend text-[20px] text-on-surface",
  bodyLg: "font-inter text-[20px] text-on-surface",
  body: "font-inter text-[18px] text-on-surface",
  label: "font-inter text-[16px] text-on-surface-muted",
  caption: "font-inter text-[14px] text-on-surface-muted",
};

export interface TextUIProps extends TextProps {
  variant?: TextVariant;
  className?: string;
}

export const Text = ({ variant = "body", className, ...props }: TextUIProps) => {
  return <RNText className={cn(VARIANT_CLASS[variant], className)} {...props} />;
};
