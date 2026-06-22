const expoPreset = require("jest-expo/jest-preset");

/** @type {import('jest').Config} */
module.exports = {
  ...expoPreset,
  // Seuls les fichiers *.test.* sont des suites (les builders/fixtures dans __tests__/ ne le sont pas).
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  // Étend l'allowlist de jest-expo pour transformer node-html-parser et sa dépendance ESM `entities`.
  transformIgnorePatterns: expoPreset.transformIgnorePatterns.map((pattern) =>
    pattern.replace("node_modules/(?!", "node_modules/(?!node-html-parser|entities|"),
  ),
  // Conventions de placement :
  //  - unitaires (logique pure) : features/<feature>/domain/__tests__/ et shared/domain/__tests__/
  //  - intégration (use-cases via renderHook + adapters mockés) : features/<feature>/use-cases/__tests__/
  //  - pas de test de composant (Storybook tient ce rôle)
  collectCoverageFrom: ["src/**/*.service.ts", "src/**/*.parser.ts", "src/shared/domain/**/*.ts"],
  coverageThreshold: {
    global: { statements: 60, branches: 50, functions: 60, lines: 60 },
  },
};
