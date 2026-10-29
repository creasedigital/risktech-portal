import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VettingStatus } from '@/types/fsm'

export type SortColumn = 'name' | 'submittedAt' | 'status'
export type SortDirection = 'asc' | 'desc'

export interface ReviewerFilterState {
  searchTerm: string
  statusFilter: VettingStatus | 'ALL'
  sortColumn: SortColumn
  sortDirection: SortDirection

  setSearchTerm: (term: string) => void
  setStatusFilter: (status: VettingStatus | 'ALL') => void
  setSortColumn: (col: SortColumn) => void
  setSortDirection: (dir: SortDirection) => void
  resetFilters: () => void
}

const initialFilters = {
  searchTerm: '',
  statusFilter: 'ALL' as const,
  sortColumn: 'submittedAt' as const,
  sortDirection: 'desc' as const,
}

export const useReviewerFilterStore = create<ReviewerFilterState>()(
  persist(
    (set) => ({
      ...initialFilters,
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setSortColumn: (sortColumn) => set({ sortColumn }),
      setSortDirection: (sortDirection) => set({ sortDirection }),
      resetFilters: () => set(initialFilters),
    }),
    {
      name: 'risktech-reviewer-filters',
    }
  )
)
