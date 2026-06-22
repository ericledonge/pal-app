import type { Meta, StoryObj } from "@storybook/react-native";

import { Chip } from "./chip";

const meta = {
  title: "UI/Chip",
  component: Chip,
  args: { label: "3.5T" },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
