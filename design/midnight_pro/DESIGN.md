---
name: Midnight Pro
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#e5beb2'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#ab897e'
  outline-variant: '#5b4037'
  surface-tint: '#ffb59b'
  primary: '#ffb59b'
  on-primary: '#5c1a00'
  primary-container: '#ff5701'
  on-primary-container: '#501600'
  inverse-primary: '#aa3700'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#b9c7e0'
  on-tertiary: '#233144'
  tertiary-container: '#8392a9'
  on-tertiary-container: '#1c2a3d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#822800'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#d5e3fd'
  tertiary-fixed-dim: '#b9c7e0'
  on-tertiary-fixed: '#0d1c2f'
  on-tertiary-fixed-variant: '#3a485c'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Lexend
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  stats-number:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 16px
  container-padding-desktop: 32px
  gutter: 16px
  section-gap: 40px
---

## Brand & Style
The design system is engineered for a high-end, competitive pickleball experience. It balances the high-intensity energy of the sport with a premium, late-night "pro circuit" aesthetic. The personality is athletic, exclusive, and precise.

The style leverages **Modern Glassmorphism** and **Subtle Tonal Depth**. By avoiding pure black in favor of deep charcoals and navy, the UI maintains a soft, readable contrast that feels expensive and intentional. Vibrant accents are used sparingly to guide the user toward action, ensuring the energy of the brand is felt without overwhelming the sophisticated backdrop.

## Colors
This design system utilizes a deep, multi-layered dark palette to create a sense of infinite space and professional focus.

- **Primary (#FF5700):** A high-octane "Court Orange" used for calls to action, scoring indicators, and active states.
- **Background (#0F172A):** A rich "Midnight Navy" that serves as the base layer, providing better readability than pure black.
- **Surface & Glass:** Use `#1E293B` for secondary containers. For glass effects, use white at 5-10% opacity with a 16px background blur.
- **Support Colors:** Success states use a vibrant lime (evoking the pickleball itself), while warnings use a soft amber.

## Typography
The typography system pairs **Lexend** for headlines to provide an athletic, modern, and slightly rounded character with **Inter** for body text to ensure maximum utility and legibility in data-dense screens (like match results and player stats).

Headlines should use tighter letter spacing to maintain a "locked-in" professional look. Labels and metadata should use Inter Medium to differentiate clearly from standard body text.

## Layout & Spacing
The system follows a strict 8px grid. Layouts should feel breathable yet structured.

- **Mobile:** Use a single-column fluid layout with 16px horizontal margins.
- **Desktop:** Use a 12-column fixed grid (max-width 1280px). 
- **Rhythm:** Use 16px for internal card padding and 24px-32px for spacing between distinct content groups. 
- **Alignment:** Content should be predominantly left-aligned, though scoreboards and player avatars may use centered layouts for impact.

## Elevation & Depth
Depth is communicated through **Tonal Stacking** and **Glassmorphism** rather than traditional heavy shadows.

1.  **Level 0 (Base):** The #0F172A background.
2.  **Level 1 (Cards/Surfaces):** #1E293B with a subtle 1px border of white at 10% opacity.
3.  **Level 2 (Modals/Overlays):** A semi-transparent glass layer (White @ 8%) with a 20px Backdrop Blur and a thin top-down inner glow to simulate light hitting the edge.
4.  **Shadows:** When used, shadows should be large, very soft (30px-40px blur), and tinted with the primary orange or navy to avoid a "dirty" look on dark backgrounds.

## Shapes
The shape language is "Softly Geometric." Elements use a 12px base radius (`rounded-lg` in this system) to feel approachable but professional. 

Buttons and input fields should strictly adhere to the 8px-12px range. Avatars should be circular to contrast against the predominantly rectangular grid. Interactive icons should be contained within squircle-shaped backgrounds.

## Components

- **Buttons:** Primary buttons use a solid #FF5700 fill with white text. Secondary buttons use a glass background with a 1px white (15%) border.
- **Cards:** Use a #1E293B background. Apply a very subtle vertical gradient (lighter at the top) to give the card a slight 3D "lift." 
- **Input Fields:** Darker than the surface level (#0F172A) with a 1px border that glows Primary Orange on focus.
- **Chips:** Small, pill-shaped indicators. For "Active" status, use a subtle lime green glow. For "Skill Level," use transparent fills with high-contrast borders.
- **Scoreboard:** A custom component featuring oversized Lexend numbers. Use a high-gloss glass background to make live scores pop against the background.
- **Progress Bars:** Use a neutral charcoal track with a Primary Orange fill, including a subtle outer glow to simulate an "active" lit-up court.