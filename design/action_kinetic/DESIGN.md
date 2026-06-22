---
name: Action Kinetic
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#5b4037'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#907065'
  outline-variant: '#e5beb2'
  surface-tint: '#aa3700'
  primary: '#a63600'
  on-primary: '#ffffff'
  primary-container: '#cf4500'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59b'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#5a5c5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#737577'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#822800'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#e2e2e5'
  tertiary-fixed-dim: '#c6c6c9'
  on-tertiary-fixed: '#1a1c1e'
  on-tertiary-fixed-variant: '#454749'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Lexend
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  timer-display:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
  margin-tablet: 32px
---

## Brand & Style

The design system is built for the high-energy, community-driven world of pickleball. It targets active players in the Lévis region who require immediate access to court schedules, match timers, and player levels. The brand personality is **Athletic, Energetic, and Highly Legible**.

The visual style is **Corporate/Modern with High-Contrast accents**. It prioritizes clarity and speed of use. By leveraging a crisp white and soft gray foundation, the vibrant "Action Orange" and "Court Yellow" from the logo are used strategically to guide the eye toward primary actions, active statuses, and critical timers. The interface avoids unnecessary decoration, focusing instead on structural integrity and performance-oriented layouts that remain readable even in bright outdoor conditions.

## Colors

This color palette is designed for maximum visibility. The **Primary Color (#FF5700)** is a high-octane orange derived from the logo, used for CTA buttons, active progress indicators, and primary branding elements. The **Secondary Color (#FFB800)** acts as a supportive accent for secondary highlights, level badges (e.g., intermediate/advanced), and secondary status indicators.

The background is predominantly **Neutral White (#FFFFFF)** or **Soft Gray (#F4F5F7)** to ensure a clean, professional aesthetic that feels native to modern mobile operating systems. Text and structural borders utilize a deep **Charcoal (#1A1C1E)** to maintain high contrast ratios for accessibility.

## Typography

The design system utilizes **Lexend** across all levels. Chosen for its origins in improving reading proficiency and its athletic, geometric appearance, Lexend provides the perfect balance of modern tech and sports-focused clarity.

Large headlines use heavy weights and tighter letter spacing to create a sense of impact. For the match timer and scoreboards, a specialized `timer-display` role is used to ensure numbers are recognizable at a glance from several feet away. Labels and metadata use medium to semi-bold weights to remain distinct from body copy in information-dense lists.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile-first interaction. We utilize a 4px baseline grid to ensure all elements align harmoniously.

- **Mobile:** A 4-column grid with 16px side margins and 16px gutters. This accommodates "snackable" content like session cards and player lists.
- **Tablet:** Scaled to an 8-column grid with 32px margins. 
- **Rhythm:** Vertical spacing relies on the `md (16px)` and `lg (24px)` units to group related content (e.g., court number and time) while clearly separating distinct session blocks. Match timers and progress bars should be pinned to the top or bottom "Safe Areas" for persistent visibility during active play.

## Elevation & Depth

To maintain an athletic and professional feel, depth is conveyed through **Tonal Layers** and **Low-contrast outlines** rather than heavy shadows.

- **Surface Tiers:** The main app background is `#F4F5F7`. Cards and interactive containers use a pure white `#FFFFFF` surface to "pop" forward.
- **Outlines:** Cards and input fields use a subtle 1px border (`#E1E4E8`) to define boundaries without adding visual clutter.
- **Active State Elevation:** When an element is pressed or "Active" (like a selected court), it may gain a soft, high-diffusion shadow (8px blur, 4% opacity, tinted with Primary Orange) to indicate focus.

## Shapes

The design system uses a **Rounded** shape language. This softens the high-contrast "athletic" aesthetic, making the app feel approachable and community-oriented. 

- **Primary Buttons & Cards:** 0.5rem (8px) corner radius.
- **Large Containers (e.g., Timer Modules):** 1.5rem (24px) for a more distinct, modern appearance.
- **Chips & Level Tags:** Fully pill-shaped to differentiate them from functional buttons.

## Components

### Buttons
- **Primary:** Solid "Action Orange" background with white text. High-contrast and bold.
- **Secondary:** White background with 1.5px Orange border and Orange text.
- **Tertiary/Ghost:** No background, deep charcoal text, used for "Cancel" or "Back" actions.

### Cards (Session Listings)
Cards are the primary vehicle for content. They feature a white background, a 1px soft gray border, and a vertical "Action Orange" accent bar on the left edge for "Live" or "Upcoming" sessions. They contain time, location, and player count.

### Progress Indicators
Match timers utilize a thick, circular or linear stroke in Primary Orange. Background tracks for the timers use a 15% opacity version of the primary color to show the remaining duration clearly.

### Toggle Switches & Filters
Toggle switches use a high-contrast transition: "Action Orange" when ON, and a medium gray when OFF. Level filters (Beginner, Intermediate, Pro) are displayed as a horizontal scroll of pill-shaped chips that fill with color when selected.

### Input Fields
Clean, outlined boxes with a 16px internal padding. Labels are positioned above the field in `label-sm` typography. The focus state replaces the gray border with a 2px "Action Orange" border.

### Iconography
Icons should be stroke-based (2px weight) with rounded caps to match the font and shape language. Use symbols for:
- **Court:** Map pin or rectangular grid icon.
- **Level:** Chevron-up or star icons.
- **Players:** User or group icons.