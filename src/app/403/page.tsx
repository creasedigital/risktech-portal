import Link from 'next/link'
import { ShieldX, ArrowLeft } from 'lucide-react'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
          <ShieldX className="h-9 w-9" />
        </div>

        <span className="inline-block rounded-full bg-rose-50 dark:bg-rose-900/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-3">
          Error 403 · Governance Access Boundary
        </span>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Access Forbidden
        </h1>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Your current session role does not have authorization to view or execute operations within this governance portal.
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 text-xs text-slate-500">
          <strong>Tip for Evaluators:</strong> Use the floating <em>Demo Persona Switcher</em> in the bottom right corner to switch to an authorized role.
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Portal Home
          </Link>
        </div>
      </div>
    </div>
  )
}
