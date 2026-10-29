import type { Meta, StoryObj } from '@storybook/react'
import { GrcBadge } from './GrcBadge'

const meta: Meta<typeof GrcBadge> = {
  title: 'Design System/GrcBadge',
  component: GrcBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'MORE_INFO_REQUIRED', 'VERIFIED', 'REJECTED'],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md'],
    },
  },
}

export default meta
type Story = StoryObj<typeof GrcBadge>

export const VerifiedLight: Story = {
  args: { status: 'VERIFIED', size: 'md' },
  parameters: { backgrounds: { default: 'light' } },
}

export const VerifiedDark: Story = {
  args: { status: 'VERIFIED', size: 'md' },
  parameters: { backgrounds: { default: 'dark' } },
}

export const UnderReviewLight: Story = {
  args: { status: 'UNDER_REVIEW', size: 'md' },
  parameters: { backgrounds: { default: 'light' } },
}

export const UnderReviewDark: Story = {
  args: { status: 'UNDER_REVIEW', size: 'md' },
  parameters: { backgrounds: { default: 'dark' } },
}

export const ActionRequired: Story = {
  args: { status: 'MORE_INFO_REQUIRED', size: 'md' },
  parameters: { backgrounds: { default: 'light' } },
}

export const Rejected: Story = {
  args: { status: 'REJECTED', size: 'md' },
  parameters: { backgrounds: { default: 'light' } },
}
