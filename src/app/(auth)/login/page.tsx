'use client'

import React, { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, UserCheck, Briefcase, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { BrandLogo } from '@/components/shared/BrandLogo'
import type { Role } from '@/types/roles'

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInstantLoading, setIsInstantLoading] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Authentication failed')
        return
      }

      const role = data.user.role as Role
      const defaultDest = role === 'EXECUTIVE' ? '/onboarding' : role === 'CONSULTANT' ? '/vetting' : '/admin/audit'
      window.location.href = callbackUrl || defaultDest
    } catch {
      setError('Connection error. Please retry.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('Passcode123!')
    setError('')
  }

  const handleInstantSwitch = async (role: Role, defaultUrl: string) => {
    setIsInstantLoading(role)
    setError('')
    try {
      const res = await fetch('/api/auth/switch-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to switch persona')
      }

      window.location.href = callbackUrl || defaultUrl
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Instant sign in failed')
      setIsInstantLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center mb-4 hover:opacity-95 transition-opacity">
            <BrandLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Portal Sign In
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your executive onboarding, reviewer queue, or audit ledger.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          {error && (
            <div
              role="alert"
              className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@synthetic-risktech.internal"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !!isInstantLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 py-2.5 text-xs font-semibold text-white shadow transition-all disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Synthetic Demo Account Quick-Fill & Instant Portal Entry */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Evaluator Instant 1-Click Access
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Zero Real PII</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Alice — Executive */}
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      Alice Okafor
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      EXECUTIVE · Senior Candidate
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fillDemo('alice.okafor@synthetic-risktech.internal')}
                    className="px-2 py-1 text-[11px] font-medium rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    disabled={!!isInstantLoading}
                    onClick={() => handleInstantSwitch('EXECUTIVE', '/onboarding')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-blue-700 hover:bg-blue-800 text-white shadow-xs"
                  >
                    {isInstantLoading === 'EXECUTIVE' ? 'Entering...' : 'Enter Portal'}
                  </button>
                </div>
              </div>

              {/* Ben — Consultant */}
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      Ben Adeyemi
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      CONSULTANT · Vetting Reviewer
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fillDemo('ben.adeyemi@synthetic-risktech.internal')}
                    className="px-2 py-1 text-[11px] font-medium rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    disabled={!!isInstantLoading}
                    onClick={() => handleInstantSwitch('CONSULTANT', '/vetting')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    {isInstantLoading === 'CONSULTANT' ? 'Entering...' : 'Enter Portal'}
                  </button>
                </div>
              </div>

              {/* Carol — Administrator */}
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      Carol Mensah
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      ADMINISTRATOR · GRC Lead
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fillDemo('carol.mensah@synthetic-risktech.internal')}
                    className="px-2 py-1 text-[11px] font-medium rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Fill
                  </button>
                  <button
                    type="button"
                    disabled={!!isInstantLoading}
                    onClick={() => handleInstantSwitch('ADMINISTRATOR', '/admin/audit')}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded bg-purple-700 hover:bg-purple-800 text-white shadow-xs"
                  >
                    {isInstantLoading === 'ADMINISTRATOR' ? 'Entering...' : 'Enter Portal'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-xs text-slate-500">Loading sign in portal...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
