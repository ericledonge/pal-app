import type { Meta, StoryObj } from "@storybook/react-native";

import { Card } from "./card";
import { Text } from "./text";

const meta = {
  title: "UI/Card",
  component: Card,
  render: () => (
    <Card>
      <Text variant="cardTitle">Parc — court 03</Text>
      <Text variant="label">18 h 00 · 8 inscrits</Text>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
