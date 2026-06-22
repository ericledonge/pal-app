import { MatrixConfigView } from "@/features/matrix/use-cases/matrix-config-view";

// Écran wrapper mince : rend la view (aucun appel de hook de use-case ici).
export default function MatriceScreen() {
  return <MatrixConfigView />;
}
