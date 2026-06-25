import { useColorScheme } from "nativewind";

// Source de vérité des couleurs côté JS — pour tout ce qui exige une couleur sous forme de
// string passée à une API native (props `color` des icônes Ionicons/Lucide, ActivityIndicator,
// `placeholderTextColor`, pistes de Switch, `tintColor` des onglets…).
//
// JUMEAU de `src/global.css` : mêmes valeurs, exprimées en hex plutôt qu'en triplets RGB.
// Toute modification d'une couleur DOIT être reportée dans les deux fichiers. Les classes
// Tailwind (`bg-*`, `text-*`, `border-*`) lisent `global.css` ; le code JS lit ce fichier.
// `primary`, `on-primary`, `secondary`, `on-secondary` sont identiques en clair et en sombre.
export const palette = {
  // Thème CLAIR — référence des maquettes (primaire).
  light: {
    background: "#f4f5f7",
    surface: "#ffffff",
    surfaceMuted: "#edeef0",
    onSurface: "#1a1c1e",
    onSurfaceMuted: "#60646c",
    outline: "#e1e4e8",
    primary: "#ff5700",
    onPrimary: "#ffffff",
    secondary: "#ffb800",
    onSecondary: "#1a1c1e",
    error: "#ba1a1a",
  },
  // Thème SOMBRE — variante Midnight Pro (navy #0b1326).
  dark: {
    background: "#0b1326",
    surface: "#171f33",
    surfaceMuted: "#131b2e",
    onSurface: "#dae2fd",
    onSurfaceMuted: "#9aa6c4",
    outline: "#2d3449",
    primary: "#ff5700",
    onPrimary: "#ffffff",
    secondary: "#ffb800",
    onSecondary: "#1a1c1e",
    error: "#ffb4ab",
  },
} as const;

export type ThemeColors = Record<keyof typeof palette.light, string>;

// Renvoie la palette du thème actif (suit le réglage système et la préférence appliquée par
// NativeWind). À utiliser dès qu'une couleur doit être passée comme string à une API native ;
// pour le style déclaratif, préférer les classes Tailwind sémantiques.
export const useThemeColors = (): ThemeColors => {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? palette.dark : palette.light;
};
