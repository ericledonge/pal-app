import type { Meta, StoryObj } from "@storybook/react-native";

import { Chip } from "./chip";
import { ScreenHeader } from "./screen-header";

const meta = {
  title: "UI/ScreenHeader",
  component: ScreenHeader,
  args: { title: "Profil" },
} satisfies Meta<typeof ScreenHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {};
export const WithAction: Story = { args: { action: <Chip label="3.5T" selected /> } };
