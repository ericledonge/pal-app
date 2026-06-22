# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## État du projet

Ce dépôt est en **phase de conception** : il ne contient encore **aucun code applicatif** (pas de `package.json`, pas de scaffolding Expo, pas de tests). Il contient la spécification, les maquettes, et les conventions ci-dessous. La prochaine étape est l'initialisation du projet Expo qui devra suivre **exactement** ces patterns, repris du projet de référence **PickleSync** (`picklesync-app`) et adaptés aux contraintes de pal-app.

Tant que le scaffolding n'existe pas, les commandes ci-dessous sont la **cible** et ne sont pas encore exécutables.

## Documents de référence

- [`design/project_prd_pickleball_action_l_vis.md`](design/project_prd_pickleball_action_l_vis.md) — **PRD source de vérité** (français). Modèle du domaine, deux fonctionnalités, architecture. À lire en premier pour toute décision produit ou technique.
- [`docs/BRIEF.md`](docs/BRIEF.md) — Résumé produit (anglais) : audience, parcours, identité visuelle.

En cas de divergence, le PRD fait foi.

## Le produit en bref

Application mobile (iOS + Android) pour le club **Pickleball Action Lévis**. Deux fonctionnalités :

1. **Consultation des sessions** — Remplace le site web actuel pour consulter les présences d'aujourd'hui et de demain (l'app **ne gère pas** les inscriptions, qui restent par courriel). Vue agenda filtrable par niveau.
2. **Générateur de matrices de jeu** — Sur place, génère des appariements de doubles en faisant tourner partenaires/adversaires, gère les benchs équitablement, avec un minuteur de match (13 min par défaut).

## Modèle du domaine (à respecter dans tout le code métier)

- **Groupes de niveau** : neuf codes — `2.0C 2.0T 2.5C 2.5T 3.0C 3.0T 3.5C 3.5T 4.0C`. C = Consolidation, T = Transition, mais **le code est traité comme une simple étiquette** — la distinction C/T n'a aucune incidence logique. Un joueur appartient à un seul groupe.
- **Plateaux et terrains** : le **parc** (courts 01–06) et la **patinoire** (courts 07–11). Numérotation continue sur les deux plateaux.
- **Filtre « mon niveau »** : un créneau est pertinent s'il porte exactement mon niveau, OU s'il est multi-groupes incluant mon niveau. **Exception unique à sens unique** : un joueur `4.0C` voit aussi les créneaux `3.5T`, mais **pas l'inverse**. À implémenter explicitement (et tester).

## Commandes

```bash
npx expo start            # Démarre le serveur de dev (i = iOS, a = Android)
npm run validate          # Point fixe : format → fix lint → vérifie que tout passe
```

## Règle de validation

**Après chaque modification de code, exécuter `npm run validate`.** S'il signale des erreurs, les corriger avant de considérer la tâche terminée. Le script applique le formatage et les correctifs de lint, puis vérifie que tout est propre. Itérer jusqu'à zéro erreur.

## Architecture

### Stack cible

React Native + Expo (SDK récent, **typed routes** + **React Compiler** activés), React 19, TypeScript en mode **strict**. Navigation : **Expo Router** (fichiers). État serveur : **TanStack Query**. État local minimal : `useState`/`useReducer` ; la préférence de niveau est persistée (AsyncStorage ou MMKV). Style : **NativeWind**. Build/OTA : **EAS** + **EAS Update**. Pas de version web.

> **Différence majeure avec PickleSync** : pal-app **n'a ni authentification, ni backend, ni multi-environnement**. Les données proviennent du scraping direct de `pickleballenligne.com` (HTML rendu côté serveur). On ne reprend donc pas BetterAuth, `api-client` vers le .NET, ni `env.ts`/switch d'environnement. La couche Adapter est adaptée au HTML (voir plus bas).

### Structure des dossiers

```
src/
├── app/                              # Expo Router (écrans = wrappers minces)
│   ├── _layout.tsx
│   └── (app)/
├── features/
│   └── <feature>/                    # sessions, matrix, onboarding…
│       ├── domain/
│       │   ├── <resource>.adapter.ts     # IO : fetch HTML / endpoints → DTO typés
│       │   ├── <resource>.parser.ts      # HTML → DTO (pur) — spécifique à pal-app
│       │   ├── <resource>.repository.ts  # hooks React Query enveloppant les adapters
│       │   └── <resource>.service.ts     # logique pure + createXViewModel()
│       └── use-cases/
│           ├── use-<action>.ts           # hooks orchestrateurs (glue uniquement)
│           └── <name>-view.tsx           # composants présentationnels
├── components/
│   └── ui/                           # primitives partagées (Button, Text, Card, Chip…) + *.stories.tsx
└── lib/                              # transverse (http, parsing, config, date.utils, format.utils, logger)
assets/
├── images/
└── icons/
```

### Alias de chemins

- `@/*` → `./src/*`
- `@/assets/*` → `./assets/*`

### Architecture en couches

Les dépendances vont **vers le bas uniquement** : View → Use Case → Repository/Service → Adapter/Parser.

**1. Adapters (`domain/<resource>.adapter.ts`)** — Frontière IO. Pour pal-app, ils encapsulent les appels HTTP vers `pickleballenligne.com` et **renvoient du HTML brut** (pas du JSON). Aucune logique de parsing ici. C'est ici que vit la mécanique GET (« aujourd'hui ») et GET-puis-POST avec transmission explicite des cookies (« demain », voir section dédiée). Les helpers HTTP de bas niveau vivent dans `@/lib`.

**2. Parser (`domain/<resource>.parser.ts`)** — Spécifique à pal-app (PickleSync n'en a pas, car son backend renvoie du JSON typé). Fonction **pure** transformant le HTML en DTO typés (`Slot[]`), tolérante aux formats variables. Testée intensément sur fixtures.

**3. Repositories (`domain/<resource>.repository.ts`)** — Enveloppent adapter + parser avec React Query (cache, dédoublonnage). Tout le CRUD d'une ressource dans **un fichier**. Clés de cache par `(jour, plateau)`, `staleTime` court (présences mouvantes).

**4. Services (`domain/<resource>.service.ts`)** — Logique métier **pure**. **Aucun import de `react`, `react-native`, `@tanstack/react-query`.** Exportent des factories `createXViewModel(dto): XViewModel` (objets plats, champs prêts à afficher). La **règle de filtre « mon niveau »** et la **validation de la sortie du parser** (via type guards purs — voir « Pas de Zod ») vivent ici.

**5. Use Cases (`use-cases/use-<action>.ts`)** — Hooks orchestrateurs. **Glue uniquement, zéro logique métier.** Composent repositories + services + état React.

**6. Views (`use-cases/<name>-view.tsx`)** — Appellent le hook de use-case en interne, gèrent loading/error. Reçoivent uniquement des **callbacks de navigation** et des **params de route** en props.

**Câblage des écrans Expo Router** — Les écrans de `src/app/` sont des wrappers **ultra-minces** : ils rendent la view et passent callbacks de navigation + params de route. **Aucun appel de hook de use-case dans l'écran.**

```typescript
// app/(app)/sessions/index.tsx
import { AgendaView } from "@/features/sessions/use-cases/agenda-view";

export default function SessionsScreen() {
  return <AgendaView />;
}
```

### Pattern ViewModel

| Règle | Raison |
|------|--------|
| Aucun import React dans `*.service.ts` | Services testables sans rendu |
| ViewModel = objet plat | Pas de hooks, pas d'état, pas d'effets |
| Boucles, transformations, conditions vivent dans les services | Use cases et views restent simples |
| Signature : `createXViewModel(dto): XViewModel` | Prévisible, composable |
| Un ViewModel par use case quand les formes divergent | Même DTO → ViewModels distincts pour liste vs détail |

### Règles d'enforcement

1. `*.service.ts` n'importe pas de `react`, `react-native`, `@tanstack/react-query`
2. `*.adapter.ts` / `*.parser.ts` n'importent pas de `react` ni `@tanstack/react-query` — uniquement les helpers de `@/lib`
3. Les hooks `use-*.ts` ne contiennent aucune logique métier (pas de filtrage, mapping, calcul de date, formatage) — tout est délégué aux services
4. `*-view.tsx` n'appelle jamais le client HTTP ni les hooks de repository directement — uniquement les hooks de use-case
5. Les écrans de `src/app/` sont des wrappers minces (render + callbacks/params)
6. Les primitives UI partagées vivent dans `src/components/ui/` avec une story Storybook
7. **Pas de Zod** dans l'app — sûreté de type via interfaces TypeScript. La sortie du parser (frontière non fiable) est validée par des **type guards purs** dans le service (ex. `isValidSlot`, `assertParsedGrid`), jamais par une lib de schéma runtime
8. Pas de DI / pattern Provider — imports directs

### Récupération des présences (couche Adapter)

Données issues du site ASP.NET `pickleballenligne.com` (HTML rendu serveur, pas de JS). La grille publique ne donne accès qu'à **aujourd'hui et demain** — ce qui correspond pile au besoin. **Pas de backend.**

- **Aujourd'hui** : simple `GET` sur l'URL du plateau.
- **Demain** : postback Telerik RadScheduler en deux temps — `GET` pour récolter les `<input type="hidden">` + cookies de session, puis re-`POST` en renvoyant **tous** les champs cachés tels quels, en n'écrasant que `__EVENTTARGET` (= `BookingScheduler`) et `__EVENTARGUMENT={"Command":"NavigateToNextPeriod"}`. Le `__VIEWSTATEENCRYPTED` ne peut pas être fabriqué — d'où l'approche GET-puis-POST. En RN, **transmettre explicitement les cookies** entre le GET et le POST.

Le parser doit être tolérant : codes simples (`3.0C`) vs multi-groupes (`2.5C & 2.5T`, `2.0C&T`), libellés « Open Play », types de plage « Bloquée »/« Réservée »/« Libre »/« n/d ». **Compter les noms listés** plutôt que `max − libres`. Un changement de HTML cassant le parser se corrige rapidement via EAS Update (OTA).

## Stratégie de tests

| Quoi | Comment | Où |
|---|---|---|
| **Services / ViewModels / Parser / filtre** | Tests unitaires sur fonctions pures | `features/<feature>/domain/__tests__/` |
| **Use Cases (intégration)** | `renderHook` avec adapters mockés | `features/<feature>/use-cases/__tests__/` |
| **Composants** | Pas de tests de composant — Storybook pour le visuel | `src/components/ui/*.stories.tsx` |

Fixtures via **builder pattern** :

```typescript
const aSlot = (overrides?: Partial<SlotDto>): SlotDto => ({
  heure: "18:00",
  plateau: "parc",
  terrains: ["01"],
  codes: ["3.0C"],
  inscrits: ["Alice", "Bob"],
  ...overrides,
});
```

Priorités de couverture pal-app : **parser HTML** (point de défaillance le plus probable en prod), **filtre + règle d'asymétrie 4.0C → 3.5T**, **algorithme de matrice** (variété + équité des benchs).

## Système de design — clair & sombre

**Deux thèmes : clair (référence des maquettes) et sombre.** Les maquettes (`design/<écran>/code.html`) sont en **clair** — c'est la base visuelle primaire. Le sombre est la variante (le thème **Midnight Pro**, navy `#0b1326`, en est le candidat naturel). Constantes de marque dans les deux modes : accent orange **`#ff5700`**, titres **Lexend**, corps **Inter**, grille 8px. Bascule via `userInterfaceStyle: "automatic"`. **App entièrement en français** (tous les libellés UI).

> Les valeurs exactes des deux palettes (claire + sombre) sont fixées lors de la mise en place NativeWind, dérivées des maquettes claires et de [`design/midnight_pro/DESIGN.md`](design/midnight_pro/DESIGN.md).

### Échelle typographique

NativeWind ne gère pas `theme.extend.fontSize` de façon fiable (les tokens thémés rendent différemment des valeurs arbitraires). Utiliser `text-[NNpx]` avec la **table canonique** ci-dessous (calée sur `design/midnight_pro/DESIGN.md`) ; ne pas inventer de nouvelles tailles. Les tailles Tailwind standards (`text-sm`, `text-base`…) restent disponibles pour le reste.

| Classe | Taille | Usage |
|---|---|---|
| `text-[48px]` | 48 | Display / hero (titre de marque) |
| `text-[32px]` | 32 | Titre d'écran principal |
| `text-[28px]` | 28 | Titre d'écran (mobile) |
| `text-[24px]` | 24 | Titre de carte / section |
| `text-[20px]` | 20 | Chiffres & stats (compteurs, minuteur) |
| `text-[18px]` | 18 | Corps large |
| `text-[16px]` | 16 | Corps |
| `text-[14px]` | 14 | Label / petit corps |
| `text-[12px]` | 12 | Légende |

Polices : `font-lexend` (titres) et `font-inter` (corps), chargées via expo-font. Couleurs sémantiques (deux thèmes) : `bg-background`, `bg-surface`, `text-on-surface`, `text-on-surface-muted`, `border-outline`, `bg-primary`/`text-on-primary`, `text-error` — définies en variables CSS dans `src/global.css` et basculées par `prefers-color-scheme`.

### Tokens d'espacement

Définis dans `tailwind.config.js` > `theme.extend.spacing`. **Préférer les tokens aux valeurs numériques brutes.**

| Token | Valeur | Usage |
|---|---|---|
| `2xs` | 6px | Inline (icône + texte) |
| `xs` | 8px | Serré (champs de formulaire) |
| `sm` | 12px | Gap interne par défaut |
| `md` | 16px | Entre groupes, padding contenu de carte |
| `lg` | 20px | Padding horizontal d'écran |
| `xl` | 24px | Padding interne de carte |
| `2xl` | 28px | Gap entre sections de haut niveau |

Éviter les gaps fractionnaires. Exemples : `gap-sm`, `px-lg`, `gap-2xl`, `p-md`. Préférer `contentContainerClassName` à `contentContainerStyle` ; styles inline uniquement pour les valeurs dynamiques (safe area insets).

> **Primitives UI** : suivre le pattern PickleSync — construire `src/components/ui/` (Button, Text, Card, Chip, Input…) en NativeWind + Storybook. `@expo/ui` (évoqué au PRD) reste envisageable ponctuellement pour des surfaces réellement natives (sheets/sélecteurs) ; à trancher au cas par cas, sans en faire le système de design par défaut.

## Style de code

Voir un éventuel `docs/CODE-STYLE-REACT.md` à porter depuis PickleSync.

- **Fonctions fléchées partout** (`const fn = () => {}`), jamais de `function fn() {}`. Seule exception : `export default function` pour les layouts/écrans Expo Router.
- **Icônes Lucide** : `lucide-react-native` n'accepte pas `className` pour la couleur — toujours la prop `color` avec un hex (`<Clock size={12} color="#71717A" />`).
- **Fonctions utilitaires** dans `src/lib/`, pas dans les services de feature : date/heure → `date.utils.ts`, texte/formatage → `format.utils.ts`, logger → `logger.ts`.

## Linter / formatter — OXC

Outils basés **OXC** (Rust), pas ESLint/Prettier.

- **oxlint** (`oxlint.config.ts`) : `correctness: error`, `suspicious/perf: warn`, `no-explicit-any: warn`, `consistent-type-imports: warn`, `no-console: warn`, `eqeqeq: error`, `prefer-const: error`, `import/no-cycle: error`, règles React hooks.
- **oxfmt** (`.oxfmtrc.json`) : `printWidth: 100`, guillemets doubles, virgules finales, points-virgules. **Tri des imports** : builtin → external → interne (`@/*`) → relatif → style, alphabétique ascendant dans chaque groupe.

## Configuration Expo

- **Typed routes** + **React Compiler** activés (`experiments`).
- **Portrait only**.
- **Clair + sombre** (`userInterfaceStyle: "automatic"`) — maquettes en clair, sombre en variante.
- **Scheme de deep link** : à fixer (proposition `palevis://`).
- **Splash** : aux couleurs de la marque, logo centré (variante claire/sombre).

## Dépendances clés (cible)

| Package | Usage |
|---|---|
| `expo-router` | Routing par fichiers, typed routes |
| `@tanstack/react-query` | État serveur (cache, dédoublonnage) |
| `nativewind` | Tailwind pour RN |
| `react-native-reanimated` / `react-native-gesture-handler` | Animations / gestes (minuteur, rotations) |
| `expo-image` | Images optimisées |
| `react-native-screens` / `react-native-safe-area-context` | Conteneurs natifs / safe area |
| _(parser HTML)_ | Lib JS de parsing tolérante (ex. `node-html-parser`) — à valider en RN/Hermes |
| _(stockage)_ | `@react-native-async-storage/async-storage` ou MMKV pour la préférence de niveau |
| `@sentry/react-native` | Suivi d'erreurs + détection à distance d'une casse du parser ; `logger.ts` intégré |
| `@amplitude/analytics-react-native` | Analytics produit |

> **Non repris de PickleSync** : `better-auth`/`@better-auth/expo` (pas d'auth), `api-client`/`env.ts` (pas de backend ni multi-env), `expo-symbols`/`expo-glass-effect` (optionnels).

## Choix arrêtés et décisions en attente

**Arrêtés** :
- **Thèmes** : clair (maquettes) **+** sombre, via `userInterfaceStyle: automatic`.
- **Observabilité** : **Sentry + Amplitude**.
- **Matrice — appariement** : **interchangeable** (tous les joueurs à égalité).
- **Matrice — rondes** : générées **à la volée** (jusqu'à arrêt manuel).
- **Matrice — effectif** : pré-chargé depuis les **réponses aux sondages** (présences F1) ; pas de répertoire de membres ; invités saisis manuellement.
- **Portée** : **mono-appareil**, un seul coordonnateur sur place (pas de sync multi-appareils → pas de backend/store partagé).
- **Feedback** : envoi par courriel vers **eric.ledonge@pm.me** via **Web3Forms** (POST + clé d'accès publique, sans backend ; alternatives : EmailJS, ou Resend via une API Route Expo).

**En attente** (détails d'implémentation, non bloquants) :
- **Scheme de deep link** (`palevis://` ?) et **lib de parsing HTML** (`node-html-parser` ?).

## Outillage de cette session

Les outils **Argent** MCP (simulateur iOS / émulateur Android / Chromium) sont disponibles pour exécuter, tester et profiler l'app une fois scaffoldée. Toujours passer par les outils de découverte (`describe` / `debugger-component-tree`) avant tout tap — voir la règle Argent globale.
