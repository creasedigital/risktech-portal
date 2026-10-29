import Link from 'next/link'
import { UserCheck, Users, FileLock2, Lock, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { BrandLogo } from '@/components/shared/BrandLogo'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top GRC Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
            <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Executive Vetting Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle showLabel={false} />
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 px-3 py-1 text-xs font-medium text-amber-900 dark:text-amber-300 mb-6">
                <Lock className="h-3.5 w-3.5" />
                <span>NDPA 2023 Compliant · Cryptographic Proof-of-Vetting</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                Senior Executive Onboarding & Controlled Vetting
              </h1>
              <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                The institutional onboarding portal for RiskTech & Advisory. Enables senior executives to self-onboard with multi-step NDPA consent, while providing governance consultants with auditable, tamper-evident vetting workflows.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow transition-all"
                >
                  Start Executive Onboarding
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/vetting"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Consultant Review Queue
                </Link>
                <Link
                  href="/admin/audit"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                >
                  Verify Audit Ledger
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Core Architectural Pillars */}
        <section className="py-16 sm:py-20 bg-slate-100/60 dark:bg-slate-950/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Governance, Risk & Compliance Invariants
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Architectural security guarantees built into every layer of this platform.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 mb-4">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  6-Step Executive Wizard
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Captures granular NDPA consent, profile, board experience, sector expertise, and verified referees. Backed by IndexedDB for offline drafts.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Virtualized Consultant Queue
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  High-speed <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">react-window</code> queue rendering 1,000+ candidates smoothly. Strict finite-state transitions with mandatory reviewer notes.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 mb-4">
                  <FileLock2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Tamper-Evident Audit Ledger
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Cryptographic SHA-256 hash chaining (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">prevHash + payload</code>) guaranteeing verifiable immutability for GRC compliance reviews.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 RiskTech & Advisory. Proof of Concept · Synthetic Governance Data Only.</p>
          <div className="flex items-center gap-4">
            <span>NDPA 2023 Aligned</span>
            <span>•</span>
            <span>AES-256-GCM Encrypted</span>
            <span>•</span>
            <span>SHA-256 Hash Chained</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
