/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  // Seuls les fichiers *.test.* sont des suites (les builders/fixtures dans __tests__/ ne le sont pas).
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  // Conventions de placement :
  //  - unitaires (logique pure) : features/<feature>/domain/__tests__/ et shared/domain/__tests__/
  //  - intégration (use-cases via renderHook + adapters mockés) : features/<feature>/use-cases/__tests__/
  //  - pas de test de composant (Storybook tient ce rôle)
  collectCoverageFrom: ["src/**/*.service.ts", "src/**/*.parser.ts", "src/shared/domain/**/*.ts"],
  coverageThreshold: {
    global: { statements: 60, branches: 50, functions: 60, lines: 60 },
  },
};
