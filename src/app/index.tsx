import { Redirect } from "expo-router";

import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";

// Gate d'entrée : tant qu'aucun niveau n'est choisi → onboarding ; sinon → app.
// Pendant la lecture du stockage, le splash reste affiché (cf. SplashGate) ; on ne rend
// rien pour éviter tout flash avant la redirection.
export default function IndexRoute() {
  const { level, isLoading } = useLevelPreference();

  if (isLoading) {
    return null;
  }

  return <Redirect href={level ? "/sessions" : "/onboarding"} />;
}
