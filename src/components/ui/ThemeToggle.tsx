'use client'

import React, { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'

export interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  isClientOverride?: boolean
}

const emptySubscribe = () => () => {}
function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false)
}

export function ThemeToggle({ className = '', showLabel = false, isClientOverride }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore()
  const clientDetected = useIsClient()
  const isClient = isClientOverride !== undefined ? isClientOverride : clientDetected

  if (!isClient) {
    return (
      <button
        type="button"
        disabled
        aria-label="Loading theme toggle"
        className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-slate-500 opacity-60 cursor-wait ${className}`}
      >
        <span className="h-5 w-5" />
        {showLabel && <span className="text-sm font-medium">Theme</span>}
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode (currently ${theme} mode)`}
      aria-pressed={isDark}
      className={`relative inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 ${className}`}
    >
      <div className="relative h-5 w-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Sun className="h-4 w-4 text-amber-600 transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-semibold tracking-wide uppercase text-slate-700 dark:text-slate-300">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  )
}
