import type { Meta, StoryObj } from "@storybook/react-native";

import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  args: { placeholder: "Nom du joueur" },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: "Alice Tremblay" } };
