import { Redirect } from "expo-router";

export default function IndexRoute() {
  // Route d'entrée / futur gate d'onboarding (issue #15). Pour l'instant, redirige vers les sessions.
  return <Redirect href="/sessions" />;
}
