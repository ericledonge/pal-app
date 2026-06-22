// Squelette d'exemple — couche View (composant présentationnel).
// Appelle le hook de use-case en interne, gère loading/error.
// Ne reçoit que des callbacks de navigation et des params de route en props.

import { ActivityIndicator, Text, View } from "react-native";

import { useExampleDetail } from "./use-example";

interface ExampleViewProps {
  id: string;
}

export const ExampleView = ({ id }: ExampleViewProps) => {
  const { viewModel, isLoading } = useExampleDetail(id);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>{viewModel?.label ?? "—"}</Text>
    </View>
  );
};
