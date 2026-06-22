/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Deux palettes pilotées par variables CSS (voir src/global.css) :
      // clair = maquettes (primaire), sombre = Midnight Pro. Accent #ff5700 constant.
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
        "on-surface": "rgb(var(--color-on-surface) / <alpha-value>)",
        "on-surface-muted": "rgb(var(--color-on-surface-muted) / <alpha-value>)",
        outline: "rgb(var(--color-outline) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
      },
      // Grille 8px — tokens d'espacement 2xs (6) → 2xl (28).
      spacing: {
        "2xs": "6px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "28px",
      },
      fontFamily: {
        lexend: ["Lexend", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
