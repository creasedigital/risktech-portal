'use client'

import React, { useEffect, useState } from 'react'
import { UserCheck, ShieldAlert, Briefcase, ChevronUp, ChevronDown, Check } from 'lucide-react'
import type { Role } from '@/types/roles'

interface UserSession {
  id: string
  name: string
  email: string
  role: Role
}

export function PersonaSwitcher() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
      }
    } catch {
      // In SSR or disconnected state
    }
  }

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const switchPersona = async (role: Role) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (res.ok) {
        const data = await res.json()
        setCurrentUser(data.user)
        setIsOpen(false)
        // Refresh page to update server component permissions
        window.location.reload()
      }
    } catch (e) {
      console.error('Failed to switch persona:', e)
    } finally {
      setIsLoading(false)
    }
  }

  const personas: Array<{ role: Role; name: string; title: string; icon: React.ComponentType<{ className?: string }> }> = [
    {
      role: 'EXECUTIVE',
      name: 'Alice Okafor',
      title: 'Senior Executive Candidate',
      icon: UserCheck,
    },
    {
      role: 'CONSULTANT',
      name: 'Ben Adeyemi',
      title: 'Recruitment Reviewer',
      icon: Briefcase,
    },
    {
      role: 'ADMINISTRATOR',
      name: 'Carol Mensah',
      title: 'GRC Compliance Lead',
      icon: ShieldAlert,
    },
  ]

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        {isOpen && (
          <div className="absolute bottom-12 right-0 mb-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl backdrop-blur-md">
            <div className="mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Synthetic Persona Switcher
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Demonstration gate (Zero real PII)
              </p>
            </div>

            <div className="space-y-1.5">
              {personas.map((p) => {
                const Icon = p.icon
                const isActive = currentUser?.role === p.role

                return (
                  <button
                    key={p.role}
                    type="button"
                    disabled={isLoading}
                    onClick={() => switchPersona(p.role)}
                    className={`w-full flex items-center justify-between rounded-lg p-2 text-left transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isActive
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{p.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.title}</div>
                      </div>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Persona Switcher"
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Demo Persona: {currentUser ? currentUser.name.split(' ')[0] : 'Guest'}</span>
          {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}
