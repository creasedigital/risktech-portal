'use client'

import React, { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PortalHeader } from '@/components/shared/PortalHeader'
import { useReviewerFilterStore, SortColumn } from '@/stores/useReviewerFilterStore'
import { GrcBadge } from '@/components/ui/GrcBadge'
import { CandidateDetailDrawer } from '@/components/consultant/CandidateDetailDrawer'
import { List } from 'react-window'
import {
  Search,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react'
import type { VettingStatus } from '@/types/fsm'

interface ExecutiveRow {
  id: string
  name: string
  currentTitle: string
  currentOrg: string
  vettingStatus: VettingStatus
  submittedAt: string
  documentsCount: number
  notesCount: number
}

interface ExtraRowProps {
  items: ExecutiveRow[]
  onSelect: (id: string) => void
}

function CandidateRow({
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
      onClick={() => onSelect(item.id)}
      className="flex items-center px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
    >
      <div className="w-1/3 min-w-[200px] pr-4">
        <span className="font-semibold text-xs text-slate-900 dark:text-white block truncate">
          {item.name}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
          {item.currentTitle}
        </span>
      </div>

      <div className="w-1/4 hidden md:block pr-4">
        <span className="text-xs text-slate-700 dark:text-slate-300 block truncate">
          {item.currentOrg}
        </span>
      </div>

      <div className="w-1/6 min-w-[130px] pr-4">
        <GrcBadge status={item.vettingStatus} />
      </div>

      <div className="w-1/6 hidden sm:block pr-4 text-left">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
          {new Date(item.submittedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="w-1/12 text-right">
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          {item.documentsCount} docs
        </span>
      </div>
    </div>
  )
}

export default function ConsultantQueuePage() {
  const {
    searchTerm,
    statusFilter,
    sortColumn,
    sortDirection,
    setSearchTerm,
    setStatusFilter,
    setSortColumn,
    setSortDirection,
    resetFilters,
  } = useReviewerFilterStore()

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['consultant-queue'],
    queryFn: async () => {
      const res = await fetch('/api/consultant/queue')
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to load queue')
      }
      return res.json() as Promise<{ executives: ExecutiveRow[]; total: number }>
    },
  })

  const rawList = useMemo(() => data?.executives || [], [data?.executives])

  // Filter & Sort
  const filteredList = useMemo(() => {
    return rawList
      .filter((item) => {
        if (statusFilter !== 'ALL' && item.vettingStatus !== statusFilter) {
          return false
        }
        if (searchTerm.trim()) {
          const lower = searchTerm.toLowerCase()
          return (
            item.name.toLowerCase().includes(lower) ||
            item.currentTitle.toLowerCase().includes(lower) ||
            item.currentOrg.toLowerCase().includes(lower)
          )
        }
        return true
      })
      .sort((a, b) => {
        let cmp = 0
        if (sortColumn === 'name') {
          cmp = a.name.localeCompare(b.name)
        } else if (sortColumn === 'status') {
          cmp = a.vettingStatus.localeCompare(b.vettingStatus)
        } else {
          // submittedAt
          cmp = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
        }
        return sortDirection === 'asc' ? cmp : -cmp
      })
  }, [rawList, statusFilter, searchTerm, sortColumn, sortDirection])

  const handleSortToggle = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(col)
      setSortDirection('asc')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <PortalHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Consultant Reviewer Queue
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {filteredList.length} of {rawList.length} Candidates
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Institutional primary source credential review and vetting state machine transitions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3 min-w-[260px]">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidates by name, title, or organisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as VettingStatus | 'ALL')}
              className="text-xs py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Vetting Statuses</option>
              <option value="SUBMITTED">SUBMITTED (Awaiting Review)</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW (Active)</option>
              <option value="MORE_INFO_REQUIRED">MORE_INFO_REQUIRED (Pending Candidate)</option>
              <option value="VERIFIED">VERIFIED (Approved)</option>
              <option value="REJECTED">REJECTED (Declined)</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== 'ALL') && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Table Container */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="flex items-center px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <div
              className="w-1/3 min-w-[200px] pr-4 flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              onClick={() => handleSortToggle('name')}
            >
              <span>Candidate & Title</span>
              <ArrowUpDown className="h-3 w-3" />
            </div>

            <div className="w-1/4 hidden md:block pr-4">
              <span>Current Organisation</span>
            </div>

            <div
              className="w-1/6 min-w-[130px] pr-4 flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              onClick={() => handleSortToggle('status')}
            >
              <span>Status</span>
              <ArrowUpDown className="h-3 w-3" />
            </div>

            <div
              className="w-1/6 hidden sm:block pr-4 flex items-center gap-1.5 cursor-pointer hover:text-slate-900 dark:hover:text-white"
              onClick={() => handleSortToggle('submittedAt')}
            >
              <span>Submitted</span>
              <ArrowUpDown className="h-3 w-3" />
            </div>

            <div className="w-1/12 text-right">
              <span>Vault</span>
            </div>
          </div>

          {/* Virtualized Body */}
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-500 dark:text-slate-400">
              Loading candidates from secure database...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-xs text-rose-600">
              {(error as Error).message}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-500 dark:text-slate-400">
              No candidates match current search and status filter.
            </div>
          ) : (
            <div className="h-[600px] w-full">
              <List<ExtraRowProps>
                rowCount={filteredList.length}
                rowHeight={64}
                rowComponent={CandidateRow}
                rowProps={{
                  items: filteredList,
                  onSelect: (id: string) => setSelectedCandidateId(id),
                }}
                style={{ height: '600px', width: '100%' }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Slide-over Detail Drawer */}
      <CandidateDetailDrawer
        candidateId={selectedCandidateId}
        onClose={() => setSelectedCandidateId(null)}
        onStatusUpdated={() => refetch()}
      />
    </div>
  )
}
