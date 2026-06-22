// Squelette d'exemple — couche Use Case (hook orchestrateur, glue uniquement).
// Zéro logique métier : compose repository + service + état React.

import { useMemo } from "react";

import { useExample } from "../domain/example.repository";
import { createExampleViewModel } from "../domain/example.service";

export const useExampleDetail = (id: string) => {
  const { data, isLoading, isError, refetch } = useExample(id);

  const viewModel = useMemo(() => (data ? createExampleViewModel(data) : null), [data]);

  return { viewModel, isLoading, isError, refetch };
};
