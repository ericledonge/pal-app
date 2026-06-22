import type { Meta, StoryObj } from "@storybook/react-native";

import { Text } from "./text";

const meta = {
  title: "UI/Text",
  component: Text,
  args: { children: "Pickleball Action Lévis" },
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Display: Story = { args: { variant: "display" } };
export const Title: Story = { args: { variant: "title" } };
export const Body: Story = { args: { variant: "body" } };
export const Label: Story = { args: { variant: "label" } };
export const Caption: Story = { args: { variant: "caption" } };
