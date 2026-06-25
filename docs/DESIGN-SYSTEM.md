# Système de design — pal-app

Référence unique des tokens (couleurs, typographie, espacement) et de leur usage. Objectif :
**zéro valeur en dur** dans l'app. Si une valeur n'est pas dans une de ces tables, elle ne
devrait pas exister dans le code.

Deux thèmes : **clair** (référence des maquettes, primaire) et **sombre** (variante Midnight
Pro). Bascule via `userInterfaceStyle: "automatic"` + la préférence dans Profil.

## Les deux sources de vérité

| Source | Pour quoi | Forme |
|---|---|---|
| [`src/global.css`](../src/global.css) | Classes Tailwind (`bg-*`, `text-*`, `border-*`) | Variables CSS, triplets RGB |
| [`src/lib/theme.ts`](../src/lib/theme.ts) | Couleurs passées en **string** aux API natives | `palette` (hex) + hook `useThemeColors()` |

Ce sont des **jumeaux** : mêmes couleurs, deux formats. **Toute modification d'une couleur doit
être reportée dans les deux fichiers.** Les tokens de spacing et les familles de police vivent
dans [`tailwind.config.js`](../tailwind.config.js).

## Couleurs

Toujours via le **token sémantique**, jamais l'hex. En JSX déclaratif → classe Tailwind. En prop
native (icône, `placeholderTextColor`, spinner, piste de Switch) → `useThemeColors()`.

| Token (classe) | Clé JS (`useThemeColors()`) | Clair | Sombre | Usage |
|---|---|---|---|---|
| `bg-background` | `background` | `#f4f5f7` | `#0b1326` | Fond d'écran |
| `bg-surface` | `surface` | `#ffffff` | `#171f33` | Cartes, champs, feuilles |
| `bg-surface-muted` | `surfaceMuted` | `#edeef0` | `#131b2e` | Fond atténué / désactivé |
| `text-on-surface` | `onSurface` | `#1a1c1e` | `#dae2fd` | Texte principal, icônes |
| `text-on-surface-muted` | `onSurfaceMuted` | `#60646c` | `#9aa6c4` | Texte secondaire, icônes atténuées |
| `border-outline` | `outline` | `#e1e4e8` | `#2d3449` | Bordures, séparateurs |
| `bg-primary` / `text-primary` | `primary` | `#ff5700` | `#ff5700` | Accent de marque (invariant) |
| `text-on-primary` | `onPrimary` | `#ffffff` | `#ffffff` | Sur fond primary (invariant) |
| `bg-secondary` | `secondary` | `#ffb800` | `#ffb800` | Accent secondaire / or (invariant) |
| `text-on-secondary` | `onSecondary` | `#1a1c1e` | `#1a1c1e` | Sur fond secondary (invariant) |
| `text-error` | `error` | `#ba1a1a` | `#ffb4ab` | États d'erreur |

`primary`, `on-primary`, `secondary`, `on-secondary` sont **identiques** dans les deux thèmes.

```tsx
// Classe (style déclaratif)
<View className="bg-surface border border-outline">
  <Text className="text-on-surface-muted">…</Text>
</View>

// Prop native (hook)
const colors = useThemeColors();
<Ionicons name="time-outline" color={colors.onSurfaceMuted} />;
```

## Typographie

Composant unique : [`Text`](../src/components/ui/text.tsx). On choisit un **variant** (taille +
famille + couleur de base) et, au besoin, une **graisse**. On n'écrit jamais `text-[NNpx]` ni
`font-*` à la main dans les écrans.

| Variant | Taille | Famille | Couleur | Usage |
|---|---|---|---|---|
| `display` | 48 | Lexend | on-surface | Hero / titre de marque |
| `title` | 32 | Lexend | on-surface | Titre d'écran |
| `subtitle` | 28 | Lexend | on-surface | Sous-titre / titre mobile |
| `cardTitle` | 24 | Lexend | on-surface | Titre de carte / section |
| `stat` | 20 | Lexend | on-surface | Chiffres & compteurs (minuteur) |
| `bodyLg` | 20 | Inter | on-surface | Corps large |
| `body` | 18 | Inter | on-surface | Corps (défaut) |
| `label` | 16 | Inter | on-surface-muted | Label / petit corps |
| `caption` | 14 | Inter | on-surface-muted | Légende |

**Graisse** (`weight`, optionnelle) surcharge la famille sans toucher taille ni couleur :
`regular | medium | semibold | bold`. Lexend n'a que SemiBold (défaut) et Bold ; pour les
variants Lexend, `regular`/`medium`/`semibold` rendent identiques.

```tsx
<Text variant="cardTitle">{slot.horaire}</Text>
<Text variant="caption" weight="semibold" className="text-primary">{label}</Text>
```

> La couleur peut être surchargée via `className` (`text-primary`, `text-error`…). La graisse,
> elle, passe **toujours** par la prop `weight` — pas par `className="font-inter-semibold"`.

## Espacement

Grille 8px. Tokens définis dans [`tailwind.config.js`](../tailwind.config.js), utilisés en
`gap-*`, `px-*`, `py-*`, `p-*`, `m-*`, etc. **Préférer les tokens aux valeurs numériques brutes**
(`gap-4`, `px-5`… sont à proscrire).

| Token | Valeur | Usage |
|---|---|---|
| `2xs` | 6px | Inline (icône + texte) |
| `xs` | 8px | Serré (champs de formulaire) |
| `sm` | 12px | Gap interne par défaut |
| `md` | 16px | Entre groupes, padding de carte |
| `lg` | 20px | Padding horizontal d'écran |
| `xl` | 24px | Padding interne de carte |
| `2xl` | 28px | Gap entre sections de haut niveau |

Styles inline (`style={{ … }}`) **uniquement** pour les valeurs dynamiques (safe-area insets,
nudge de quelques px sur l'alignement d'une icône). Jamais pour un espacement qui a un token.

## Règles

1. Aucun hex (`#…`), `rgb()` ni `rgba()` dans `src/` (hors `theme.ts`/`global.css`). Couleur =
   token Tailwind ou clé de `useThemeColors()`.
2. Aucun `text-[NNpx]` ni `font-*` dans les écrans/features : utiliser `<Text variant weight>`.
3. Espacement = token nommé. Inline réservé au dynamique.
4. Changer une couleur = éditer `global.css` **et** `theme.ts` (jumeaux).
