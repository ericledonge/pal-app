---
name: High-Contrast Tech Dark
colors:
  surface: '#1e100b'
  surface-dim: '#1e100b'
  surface-bright: '#48352e'
  surface-container-lowest: '#180b06'
  surface-container-low: '#271812'
  surface-container: '#2c1c16'
  surface-container-high: '#372620'
  surface-container-highest: '#43302a'
  on-surface: '#fadcd3'
  on-surface-variant: '#e5beb2'
  inverse-surface: '#fadcd3'
  inverse-on-surface: '#3e2c26'
  outline: '#ab897e'
  outline-variant: '#5b4037'
  surface-tint: '#ffb59b'
  primary: '#ffb59b'
  on-primary: '#5c1a00'
  primary-container: '#ff5701'
  on-primary-container: '#501600'
  inverse-primary: '#aa3700'
  secondary: '#c8c6c6'
  on-secondary: '#303030'
  secondary-container: '#474747'
  on-secondary-container: '#b6b5b4'
  tertiary: '#a1c9ff'
  on-tertiary: '#00325b'
  tertiary-container: '#0394fd'
  on-tertiary-container: '#002b4f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#822800'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#d3e4ff'
  tertiary-fixed-dim: '#a1c9ff'
  on-tertiary-fixed: '#001c38'
  on-tertiary-fixed-variant: '#004880'
  background: '#1e100b'
  on-background: '#fadcd3'
  surface-variant: '#43302a'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system is engineered for high-performance environments, blending technical precision with a bold, energetic personality. The aesthetic is rooted in **Modern Minimalism** with **High-Contrast** accents, optimized specifically for deep-dark interfaces. 

The brand personality is authoritative yet innovative, aiming to evoke a sense of focused energy and reliability. By utilizing a near-black foundation punctuated by a singular, vibrant primary accent, the UI minimizes cognitive load and visual fatigue while highlighting critical paths. The emotional response should be one of sophisticated control and professional-grade power.

## Colors

The color palette is strictly optimized for dark mode accessibility. The foundation is built on **#121212** for the base background to ensure true depth, while **#1E1E1E** serves as the primary surface color for cards, modals, and navigation elements to provide subtle separation.

The brand's primary orange (**#FF5700**) is the hero of the interface, used exclusively for primary calls-to-action, active states, and critical status indicators. To ensure high legibility, all text on the dark background uses an off-white scale to prevent "halation" (the glowing effect of white text on black), ensuring comfortable long-form reading and clear information hierarchy.

## Typography

The typography strategy pairs the technical, geometric character of **Space Grotesk** for headlines with the utilitarian clarity of **Inter** for body text. 

For dark mode, font-weight is slightly increased for body text to maintain visual weight against the dark background. Headlines use a tighter letter-spacing to feel more impactful and "architectural." On mobile devices, headline sizes scale down significantly to prevent awkward word-wrapping, while body text remains large enough to ensure readability under varying lighting conditions.

## Layout & Spacing

The layout follows a **Fluid Grid** system based on an 8px rhythm. For desktop, a 12-column grid is used with a maximum content width of 1440px. On mobile, the system collapses to a single-column layout with 16px side margins.

Spacing is used to create "visual air" in an otherwise dense dark interface. Larger gaps (48px+) are encouraged between major sections to prevent the UI from feeling claustrophobic. Gutters between columns are fixed at 24px to ensure a consistent vertical rhythm across all screen sizes.

## Elevation & Depth

In this dark-mode system, depth is communicated through **Tonal Layers** rather than traditional drop shadows. As elements "rise" in elevation, their surface color becomes slightly lighter.

- **Level 0 (Background):** #121212.
- **Level 1 (Surface/Cards):** #1E1E1E.
- **Level 2 (Modals/Popovers):** #2C2C2C.

Shadows are used sparingly and should be highly diffused with a very low opacity (15-20%) to avoid "muddy" edges. For primary buttons, a subtle orange glow (inner-shadow or low-spread outer-glow) can be used to emphasize the active state and reinforce the brand's primary accent.

## Shapes

The shape language is defined as **Rounded**, striking a balance between the hard-edged precision of a technical tool and the approachability of a modern consumer product. 

Standard components like buttons and input fields use a 0.5rem (8px) radius. Larger containers, such as dashboard cards, utilize a 1rem (16px) radius to create a distinct containerized feel. This consistency in rounding helps soften the high-contrast color palette, making the overall experience feel more refined.

## Components

### Buttons
Primary buttons use the brand orange (#FF5700) with white text. Secondary buttons should use a ghost style with a 1px border in a muted gray (#404040) and white text. Tertiary buttons are text-only with the primary orange color.

### Input Fields
Inputs utilize the #1E1E1E surface color with a subtle 1px border (#333333). On focus, the border transitions to the primary orange to provide clear user feedback.

### Cards
Cards are defined by the #1E1E1E surface. They should not have borders unless they are interactive; instead, use tonal elevation to separate them from the #121212 background.

### Chips & Tags
Chips use a dark gray background (#2D2D2D) with muted text. Active or "Selected" chips utilize the primary orange as either the background or a high-contrast outline.

### Checkboxes & Radios
These should be oversized (20px or 24px) to emphasize the "tactile" nature of the UI. When checked, the inner fill must be the primary orange to ensure they stand out against the dark canvas.