import { addEventListener as subscribeNetInfo } from "@react-native-community/netinfo";
import { onlineManager, QueryClient } from "@tanstack/react-query";

// Online manager via NetInfo : TanStack Query met les requêtes en pause hors-ligne
// et les rejoue à la reconnexion. (Frontière IO ; le focus manager est câblé dans le layout.)
onlineManager.setEventListener((setOnline) => {
  return subscribeNetInfo((state) => {
    setOnline(Boolean(state.isConnected));
  });
});

// Defaults adaptés aux présences mouvantes (bougent jusqu'à la dernière minute) :
// cache court, on rafraîchit volontiers au focus et à la reconnexion.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30 s — données considérées fraîches brièvement
      gcTime: 5 * 60_000, // 5 min en cache après inactivité
      retry: 2,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
  },
});
