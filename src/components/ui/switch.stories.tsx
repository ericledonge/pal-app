import type { Meta, StoryObj } from "@storybook/react-native";

import { Switch } from "./switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Off: Story = { args: { value: false } };
export const On: Story = { args: { value: true } };
export const Disabled: Story = { args: { value: true, disabled: true } };
