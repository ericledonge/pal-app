// Squelette d'exemple — couche Service (logique pure + view models).
// Interdits ici : import de `react`, `react-native` ou `@tanstack/react-query`.
// Toutes les transformations, conditions et calculs vivent ici via des factories
// `createXViewModel(dto): XViewModel` renvoyant des objets plats prêts à afficher.

import type { ExampleDto } from "./example.adapter";

export interface ExampleViewModel {
  id: string;
  label: string;
}

export const createExampleViewModel = (dto: ExampleDto): ExampleViewModel => {
  return { id: dto.id, label: dto.rawLabel.toUpperCase() };
};
