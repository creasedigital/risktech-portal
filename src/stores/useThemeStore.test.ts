import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './useThemeStore'

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' })
    document.documentElement.className = ''
    window.localStorage.clear()
  })

  it('initializes with light theme by default', () => {
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('updates theme to dark and applies dark class to document root', () => {
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    // Test setting to light again
    useThemeStore.getState().setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles theme between light and dark', () => {
    expect(useThemeStore.getState().theme).toBe('light')

    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    useThemeStore.getState().toggleTheme()
    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists theme preference to storage and triggers rehydration listener', () => {
    useThemeStore.getState().setTheme('dark')
    const stored = window.localStorage.getItem('risktech-theme-storage')
    expect(stored).not.toBeNull()
    expect(JSON.parse(stored!).state.theme).toBe('dark')

    // Test rehydration callback directly
    const persistOptions = (useThemeStore as unknown as { persist: { getOptions: () => { onRehydrateStorage?: () => (state: { theme: 'light' | 'dark' }) => void } } }).persist.getOptions()
    if (persistOptions.onRehydrateStorage) {
      const listener = persistOptions.onRehydrateStorage()
      if (listener) {
        listener({ theme: 'dark' })
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        listener({ theme: 'light' })
        expect(document.documentElement.classList.contains('dark')).toBe(false)
      }
    }
  })
})
