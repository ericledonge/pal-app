import { AgendaView } from "@/features/sessions/use-cases/agenda-view";

// Écran wrapper mince : rend la view (aucun appel de hook de use-case ici).
export default function SessionsScreen() {
  return <AgendaView />;
}
