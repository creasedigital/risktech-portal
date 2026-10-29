'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Shield, User, FileText, ClipboardList } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { BrandLogo } from '@/components/shared/BrandLogo'
import type { Role } from '@/types/roles'

interface UserSession {
  id: string
  name: string
  email: string
  role: Role
}

export function PortalHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user)
      })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch {
      router.push('/login')
    }
  }

  const role = currentUser?.role

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center hover:opacity-95 transition-opacity">
            <BrandLogo size="md" subtitle="Governance & Vetting" />
          </Link>

          {/* Nav Links based on Role */}
          <nav className="hidden md:flex items-center gap-1">
            {role === 'EXECUTIVE' && (
              <>
                <Link
                  href="/onboarding"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/onboarding') || pathname.startsWith('/executive/onboarding')
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Onboarding Wizard
                </Link>
                <Link
                  href="/privacy"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/privacy') || pathname.startsWith('/executive/privacy-center')
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Privacy & DSAR Center
                </Link>
              </>
            )}

            {role === 'CONSULTANT' && (
              <Link
                href="/vetting"
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  pathname.startsWith('/vetting') || pathname.startsWith('/consultant/queue')
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5" />
                Reviewer Queue
              </Link>
            )}

            {role === 'ADMINISTRATOR' && (
              <>
                <Link
                  href="/admin/audit"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/admin/audit') || pathname.startsWith('/admin/audit-log')
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Audit Ledger
                </Link>
                <Link
                  href="/vetting"
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/vetting') || pathname.startsWith('/consultant/queue')
                      ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
                  }`}
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Consultant Queue
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 text-xs">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {currentUser.name}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold uppercase">
                {currentUser.role}
              </span>
            </div>
          )}

          <ThemeToggle showLabel={false} />

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
