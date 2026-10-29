import type { Meta, StoryObj } from '@storybook/react'
import { ThemeToggle } from './ThemeToggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Design System/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showLabel: {
      control: 'boolean',
      description: 'Whether to display the text label alongside the sun/moon icon',
    },
  },
}

export default meta
type Story = StoryObj<typeof ThemeToggle>

export const LightMode: Story = {
  args: {
    showLabel: true,
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
}

export const DarkMode: Story = {
  args: {
    showLabel: true,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const IconOnlyLight: Story = {
  args: {
    showLabel: false,
  },
  parameters: {
    backgrounds: { default: 'light' },
  },
}

export const IconOnlyDark: Story = {
  args: {
    showLabel: false,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}
