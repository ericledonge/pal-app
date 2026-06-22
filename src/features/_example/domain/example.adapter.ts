// Squelette d'exemple — couche Adapter (frontière IO).
// À copier pour une nouvelle feature, puis supprimer le dossier `_example`.
//
// Un adapter encapsule l'IO (fetch HTTP / HTML) et renvoie des DTO typés.
// Interdits ici : logique métier, import de `react` ou `@tanstack/react-query`.

export interface ExampleDto {
  id: string;
  rawLabel: string;
}

export const fetchExample = async (id: string): Promise<ExampleDto> => {
  // En vrai : appel via le client HTTP de `@/lib`. Ici, valeur factice.
  return { id, rawLabel: "exemple-brut" };
};
