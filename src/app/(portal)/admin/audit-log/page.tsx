'use client'

import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PortalHeader } from '@/components/shared/PortalHeader'
import { List } from 'react-window'
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  CheckCircle2,
  Lock,
  X,
  Copy,
  Check,
} from 'lucide-react'

interface AuditRecord {
  sequence: number
  id: string
  timestamp: string
  actorId: string
  actorEmail: string
  actorRole: string
  action: string
  targetType: string
  targetId: string
  sha256Hash: string
  previousHash: string
  canonicalPayload: string
  metadataDiff: Record<string, unknown> | null
}

interface ExtraRowProps {
  items: AuditRecord[]
  onSelect: (record: AuditRecord) => void
}

function AuditRow({
  index,
  style,
  items,
  onSelect,
}: {
  index: number
  style: React.CSSProperties
  ariaAttributes: {
    'aria-posinset': number
    'aria-setsize': number
    role: 'listitem'
  }
} & ExtraRowProps) {
  const item = items[index]
  if (!item) return null

  return (
    <div
      style={style}
      onClick={() => onSelect(item)}
      className="flex items-center px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs font-mono"
    >
      <div className="w-16 shrink-0 font-bold text-blue-600 dark:text-blue-400">
        #{item.sequence}
      </div>

      <div className="w-44 shrink-0 text-slate-500 dark:text-slate-400 truncate pr-3">
        {new Date(item.timestamp).toLocaleString()}
      </div>

      <div className="w-32 shrink-0 pr-3">
        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
          {item.actorEmail.split('@')[0]}
        </span>
        <span className="text-[10px] text-slate-400 uppercase">{item.actorRole}</span>
      </div>

      <div className="w-40 shrink-0 pr-3">
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {item.action}
        </span>
      </div>

      <div className="w-36 shrink-0 pr-3 text-slate-600 dark:text-slate-300 truncate">
        {item.targetType}
      </div>

      <div className="flex-1 min-w-[140px] text-right font-mono text-[11px] text-slate-400 dark:text-slate-500 truncate">
        {item.sha256Hash.substring(0, 20)}...
      </div>
    </div>
  )
}

export default function AdminAuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean
    totalChecked: number
    message?: string
  } | null>(null)
  const [copiedHash, setCopiedHash] = useState(false)

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['admin-audit-log'],
    queryFn: async () => {
      const res = await fetch('/api/admin/audit')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to load audit records')
      }
      return res.json() as Promise<{ logs: AuditRecord[]; total: number }>
    },
  })

  const rawLogs = useMemo(() => data?.logs || [], [data?.logs])

  // Filter
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) {
        return false
      }
      if (searchTerm.trim()) {
        const lower = searchTerm.toLowerCase()
        return (
          log.actorEmail.toLowerCase().includes(lower) ||
          log.action.toLowerCase().includes(lower) ||
          log.targetType.toLowerCase().includes(lower) ||
          log.sha256Hash.toLowerCase().includes(lower)
        )
      }
      return true
    })
  }, [rawLogs, actionFilter, searchTerm])

  const handleVerifyChain = async () => {
    setIsVerifying(true)
    try {
      const res = await fetch('/api/admin/audit/verify')
      const json = await res.json()
      setVerificationResult(json)
      // Refetch audit list to show the new AUDIT_VERIFY record
      refetch()
    } catch {
      setVerificationResult({ valid: false, totalChecked: 0, message: 'Chain verification request failed' })
    } finally {
      setIsVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <PortalHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Verification Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900 text-purple-200 dark:bg-purple-950 dark:text-purple-300 shadow-sm border border-purple-800">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Cryptographic Audit Ledger
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Append-only SHA-256 chained immutable ledger ensuring zero-tampering governance defensibility.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleVerifyChain}
              disabled={isVerifying}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              {isVerifying ? 'Verifying Cryptographic Chain...' : 'Verify Chain Integrity'}
            </button>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Refresh ledger"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Verification Status Banner */}
        {verificationResult && (
          <div
            role="status"
            className={`rounded-xl border p-4 flex items-center justify-between shadow-xs transition-all animate-in fade-in duration-300 ${
              verificationResult.valid
                ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                : 'border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {verificationResult.valid ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {verificationResult.valid
                    ? 'Cryptographic Chain Integrity Verified'
                    : 'Cryptographic Chain Violation Detected!'}
                </span>
                <span className="text-xs opacity-90 block mt-0.5">
                  {verificationResult.valid
                    ? `All ${verificationResult.totalChecked} sequenced ledger blocks match their expected SHA-256 cryptographic hashes. Zero tampering detected across database history.`
                    : verificationResult.message || 'Hash chain mismatch detected. A database record has been altered out-of-band.'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setVerificationResult(null)}
              className="text-xs font-semibold underline opacity-75 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters Bar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 min-w-[260px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by actor, action, target, or hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="ALL">All Actions</option>
              <option value="FSM_TRANSITION">FSM_TRANSITION</option>
              <option value="DOCUMENT_UPLOAD">DOCUMENT_UPLOAD</option>
              <option value="CONSENT_RECORD">CONSENT_RECORD</option>
              <option value="PII_REVEAL">PII_REVEAL</option>
              <option value="AUDIT_VERIFY">AUDIT_VERIFY</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500">
            Showing {filteredLogs.length} of {rawLogs.length} Records
          </span>
        </div>

        {/* Virtualized Table Container */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <div className="w-16 shrink-0">Seq #</div>
            <div className="w-44 shrink-0 pr-3">Timestamp</div>
            <div className="w-32 shrink-0 pr-3">Actor</div>
            <div className="w-40 shrink-0 pr-3">Action</div>
            <div className="w-36 shrink-0 pr-3">Target</div>
            <div className="flex-1 min-w-[140px] text-right">SHA-256 Hash</div>
          </div>

          {/* Virtualized List */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-500 dark:text-slate-400">
              Loading cryptographic ledger records...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-rose-600">
              {(error as Error).message}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500 dark:text-slate-400">
              No audit records match the current filter.
            </div>
          ) : (
            <div className="h-[600px] w-full">
              <List<ExtraRowProps>
                rowCount={filteredLogs.length}
                rowHeight={56}
                rowComponent={AuditRow}
                rowProps={{
                  items: filteredLogs,
                  onSelect: (record) => setSelectedRecord(record),
                }}
                style={{ height: '600px', width: '100%' }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Audit Block Inspection Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  Ledger Block #{selectedRecord.sequence}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {selectedRecord.action}
                </span>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cryptographic Hash Verification Box */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-xs font-mono space-y-3">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  SHA-256 Current Block Hash:
                </span>
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-emerald-600 dark:text-emerald-400 break-all select-all">
                    {selectedRecord.sha256Hash}
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedRecord.sha256Hash)}
                    className="ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Copy full hash"
                  >
                    {copiedHash ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  SHA-256 Previous Block Hash (Parent):
                </span>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 break-all">
                  {selectedRecord.previousHash || 'GENESIS_BLOCK_0000000000000000000000000000000000000000000000000000000000000000'}
                </div>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Actor:</span>
                <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                  {selectedRecord.actorEmail}
                </span>
                <span className="text-slate-500 font-mono text-[11px] block">{selectedRecord.actorRole} · {selectedRecord.actorId}</span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Resource:</span>
                <span className="font-semibold text-slate-900 dark:text-white block mt-0.5">
                  {selectedRecord.targetType}
                </span>
                <span className="text-slate-500 font-mono text-[11px] block truncate">{selectedRecord.targetId}</span>
              </div>
            </div>

            {/* Metadata Diff */}
            {selectedRecord.metadataDiff && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Metadata Diff:
                </span>
                <pre className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedRecord.metadataDiff, null, 2)}
                </pre>
              </div>
            )}

            {/* Canonical Payload */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Canonical JSON Hashing Input:
              </span>
              <pre className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                {selectedRecord.canonicalPayload}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
