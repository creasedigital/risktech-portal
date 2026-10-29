import type { Meta, StoryObj } from '@storybook/react'
import { BrandLogo } from './BrandLogo'

const meta: Meta<typeof BrandLogo> = {
  title: 'Shared/BrandLogo',
  component: BrandLogo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showText: {
      control: 'boolean',
    },
    subtitle: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof BrandLogo>

export const Default: Story = {
  args: {
    size: 'md',
    showText: true,
    subtitle: 'Governance & Vetting',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    showText: true,
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    showText: true,
    subtitle: 'Executive Vetting Portal',
  },
}

export const IconOnly: Story = {
  args: {
    size: 'md',
    showText: false,
  },
}
