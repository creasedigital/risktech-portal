import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ThemeToggle } from './ThemeToggle'
import { useThemeStore } from '@/stores/useThemeStore'

describe('ThemeToggle component', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' })
    document.documentElement.className = ''
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders with accessible aria labels', () => {
    render(<ThemeToggle showLabel={true} />)
    const button = screen.getByRole('button', { name: /switch to dark mode/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText('Light Mode')).toBeInTheDocument()
  })

  it('toggles theme on click and updates aria-pressed and document class', () => {
    render(<ThemeToggle showLabel={true} />)
    const button = screen.getByRole('button')

    // Click to switch to dark
    fireEvent.click(button)

    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
    expect(screen.getByText('Dark Mode')).toBeInTheDocument()

    // Click again to switch back to light
    fireEvent.click(button)
    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('renders without text label when showLabel is false', () => {
    render(<ThemeToggle showLabel={false} />)
    expect(screen.queryByText('Light Mode')).not.toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders disabled SSR fallback button before client mount', () => {
    render(<ThemeToggle showLabel={true} isClientOverride={false} />)
    const fallbackButton = screen.getByRole('button', { name: /loading theme toggle/i })
    expect(fallbackButton).toBeInTheDocument()
    expect(fallbackButton).toBeDisabled()
    expect(screen.getByText('Theme')).toBeInTheDocument()
  })
})
