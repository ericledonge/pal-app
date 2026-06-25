import type { Meta, StoryObj } from "@storybook/react-native";

import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { label: "Valider" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost", label: "Annuler" } };
export const Loading: Story = { args: { loading: true } };
// Le spinner reprend la couleur du libellé du variant — visible sur fond clair (secondary/ghost).
export const LoadingSecondary: Story = { args: { variant: "secondary", loading: true } };
export const LoadingGhost: Story = { args: { variant: "ghost", loading: true } };
export const Disabled: Story = { args: { disabled: true } };
