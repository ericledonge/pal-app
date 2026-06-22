import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useLevelPreference } from "@/features/level/use-cases/use-level-preference";

// Gate d'entrée : tant qu'aucun niveau n'est choisi → onboarding ; sinon → app.
// Pendant la lecture du stockage, écran neutre (aucun flash de l'app principale).
export default function IndexRoute() {
  const { level, isLoading } = useLevelPreference();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={level ? "/sessions" : "/onboarding"} />;
}
