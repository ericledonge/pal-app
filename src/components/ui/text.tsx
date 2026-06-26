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
  | "bodySm"
  | "label"
  | "caption";

// Graisse optionnelle : surcharge la famille de base du variant sans changer sa taille/couleur.
// Lexend n'expose que SemiBold (défaut) et Bold ; regular/medium retombent donc sur SemiBold.
export type TextWeight = "regular" | "medium" | "semibold" | "bold";

type Typeface = "lexend" | "inter";

const VARIANT: Record<TextVariant, { typeface: Typeface; class: string }> = {
  display: { typeface: "lexend", class: "text-[48px] text-on-surface" },
  title: { typeface: "lexend", class: "text-[32px] text-on-surface" },
  subtitle: { typeface: "lexend", class: "text-[28px] text-on-surface" },
  cardTitle: { typeface: "lexend", class: "text-[24px] text-on-surface" },
  stat: { typeface: "lexend", class: "text-[20px] text-on-surface" },
  bodyLg: { typeface: "inter", class: "text-[20px] text-on-surface" },
  body: { typeface: "inter", class: "text-[18px] text-on-surface" },
  // Même taille que `label` (16px) mais couleur pleine : contenu courant (noms, valeurs).
  bodySm: { typeface: "inter", class: "text-[16px] text-on-surface" },
  label: { typeface: "inter", class: "text-[16px] text-on-surface-muted" },
  caption: { typeface: "inter", class: "text-[14px] text-on-surface-muted" },
};

// Famille par défaut du variant quand aucune graisse n'est demandée (comportement historique).
const BASE_FONT: Record<Typeface, string> = {
  lexend: "font-lexend",
  inter: "font-inter",
};

const FONT: Record<Typeface, Record<TextWeight, string>> = {
  lexend: {
    regular: "font-lexend",
    medium: "font-lexend",
    semibold: "font-lexend",
    bold: "font-lexend-bold",
  },
  inter: {
    regular: "font-inter",
    medium: "font-inter-medium",
    semibold: "font-inter-semibold",
    bold: "font-inter-bold",
  },
};

export interface TextUIProps extends TextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  className?: string;
}

export const Text = ({ variant = "body", weight, className, ...props }: TextUIProps) => {
  const { typeface, class: variantClass } = VARIANT[variant];
  const fontClass = weight ? FONT[typeface][weight] : BASE_FONT[typeface];
  return <RNText className={cn(fontClass, variantClass, className)} {...props} />;
};
