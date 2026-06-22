// Squelette d'exemple — couche Repository (hooks React Query enveloppant les adapters).
// Tout le CRUD d'une ressource dans un seul fichier ; clés de cache centralisées.

import { useQuery } from "@tanstack/react-query";

import { fetchExample } from "./example.adapter";

const EXAMPLE_KEY = ["example"] as const;

export const useExample = (id: string) => {
  return useQuery({
    queryKey: [...EXAMPLE_KEY, id],
    queryFn: () => fetchExample(id),
  });
};
