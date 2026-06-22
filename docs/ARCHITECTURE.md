# Architecture en couches

Les features de pal-app suivent une architecture en couches, reprise du projet PickleSync et adaptée (ajout d'une couche **Parser** pour le scraping HTML). Les dépendances vont **vers le bas uniquement** :

```
View → Use Case → Repository / Service → Adapter / Parser
```

## Arborescence d'une feature

```
src/features/<feature>/
├── domain/
│   ├── <resource>.adapter.ts      # IO : fetch HTTP / HTML → renvoie du brut ou des DTO typés
│   ├── <resource>.parser.ts       # HTML brut → DTO typés (pur) — spécifique pal-app
│   ├── <resource>.repository.ts   # hooks React Query enveloppant adapter + parser
│   └── <resource>.service.ts      # logique pure + createXViewModel()
└── use-cases/
    ├── use-<action>.ts            # hook orchestrateur (glue uniquement)
    └── <name>-view.tsx            # composant présentationnel
```

Transverse : `src/components/ui/` (primitives partagées + Storybook), `src/lib/` (client HTTP, utilitaires, logger), `src/app/` (écrans Expo Router = wrappers minces).

Un squelette copiable est fourni dans `src/features/_example/` (à supprimer une fois les vraies features en place).

## Rôle de chaque couche

| Couche | Rôle | Interdits |
|---|---|---|
| **Adapter** | Frontière IO : appels HTTP, renvoie le brut (HTML) ou des DTO | logique métier, `react`, `@tanstack/react-query` |
| **Parser** | HTML brut → DTO typés, tolérant aux formats | IO, `react`, `react-native` |
| **Service** | Logique pure + `createXViewModel()` | `react`, `react-native`, `@tanstack/react-query` |
| **Repository** | Cache / dédoublonnage via React Query | logique métier |
| **Use Case** | Orchestration (glue) | logique métier (filtrage, mapping, dates, formatage) |
| **View** | UI présentationnelle, états loading/error | appel direct au client HTTP ou aux repositories |

## Les 8 règles d'enforcement

1. `*.service.ts` n'importe pas `react`, `react-native`, ni `@tanstack/react-query`.
2. `*.adapter.ts` / `*.parser.ts` n'importent pas `react` ni `@tanstack/react-query` — seulement les helpers de `@/lib`.
3. Les hooks `use-*.ts` ne contiennent aucune logique métier (pas de filtrage, mapping, calcul de date, formatage) — tout est délégué aux services.
4. `*-view.tsx` n'appelle jamais le client HTTP ni les hooks de repository directement — uniquement les hooks de use-case.
5. Les écrans de `src/app/` sont des wrappers minces : render de la view + passage des callbacks de navigation et params de route (aucun appel de hook de use-case).
6. Les primitives UI partagées vivent dans `src/components/ui/` avec une story Storybook.
7. **Pas de Zod** : sûreté de type via interfaces TypeScript ; la sortie du parser est validée par des type guards purs dans le service.
8. Pas de DI / pattern Provider — imports directs.

## Tests

Harnais **jest-expo** (`npm test`). Conventions :

- **Unitaires** (logique pure) : `features/<feature>/domain/__tests__/` et `shared/domain/__tests__/` — services, parser, view models, filtre. Fixtures via **builder pattern** (`anExampleDto(overrides?)`).
- **Intégration** (use-cases) : `features/<feature>/use-cases/__tests__/` via `renderHook` + adapter **mocké**, en enveloppant dans un `QueryClientProvider` :

```tsx
jest.mock("../../domain/<resource>.adapter", () => ({
  fetch<Resource>: jest.fn(async () => /* DTO factice */),
}));

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const { result } = renderHook(() => use<Action>(...), { wrapper });
await waitFor(() => expect(result.current.viewModel).not.toBeNull());
```

- **Pas de test de composant** — Storybook tient ce rôle.
- Seuil de couverture (`jest.config.js`) sur la logique pure (`*.service.ts`, `*.parser.ts`, `shared/domain`).

> Note : le réglage exact de `renderHook` (RNTL 14 + React 19) reste à valider lors des premières intégrations de use-cases (M1).

Voir aussi `CLAUDE.md` (section Architecture) pour le contexte produit.
