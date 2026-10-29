'use client'

import React from 'react'
import { Plus, Trash2, Award } from 'lucide-react'

export interface BoardPosition {
  organisation: string
  role: string
  startYear: number
  endYear?: number
  isCurrentRole: boolean
}

export interface Step3BoardExperienceProps {
  data: {
    boardPositions?: BoardPosition[]
  }
  onChange: (updated: { boardPositions: BoardPosition[] }) => void
  error?: string
}

export function Step3BoardExperience({ data, onChange, error }: Step3BoardExperienceProps) {
  const positions = data.boardPositions && data.boardPositions.length > 0
    ? data.boardPositions
    : [
        {
          organisation: '',
          role: '',
          startYear: new Date().getFullYear() - 3,
          isCurrentRole: true,
        },
      ]

  const updatePosition = (index: number, updatedField: Partial<BoardPosition>) => {
    const updated = [...positions]
    const current = updated[index]
    if (current) {
      updated[index] = { ...current, ...updatedField }
      onChange({ boardPositions: updated })
    }
  }

  const addPosition = () => {
    onChange({
      boardPositions: [
        ...positions,
        {
          organisation: '',
          role: '',
          startYear: new Date().getFullYear() - 1,
          isCurrentRole: true,
        },
      ],
    })
  }

  const removePosition = (index: number) => {
    if (positions.length <= 1) return
    const updated = positions.filter((_, i) => i !== index)
    onChange({ boardPositions: updated })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Governance & Board Experience
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current and previous Non-Executive Director (NED), Committee Chair, or Advisory positions.
          </p>
        </div>
        <button
          type="button"
          onClick={addPosition}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Position</span>
        </button>
      </div>

      <div className="space-y-4">
        {positions.map((pos, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 relative space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Award className="h-4 w-4 text-blue-600" />
                <span>Position #{idx + 1}</span>
              </span>
              {positions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePosition(idx)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                  aria-label={`Remove position ${idx + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Board / Entity Name
                </label>
                <input
                  type="text"
                  required
                  value={pos.organisation}
                  onChange={(e) => updatePosition(idx, { organisation: e.target.value })}
                  placeholder="e.g. Sahara Sovereign Capital"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Role / Committee Assignment
                </label>
                <input
                  type="text"
                  required
                  value={pos.role}
                  onChange={(e) => updatePosition(idx, { role: e.target.value })}
                  placeholder="Chair of Audit & Risk Committee"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Start Year
                </label>
                <input
                  type="number"
                  min="1960"
                  max={new Date().getFullYear()}
                  value={pos.startYear}
                  onChange={(e) => updatePosition(idx, { startYear: parseInt(e.target.value) || 2020 })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  End Year
                </label>
                <input
                  type="number"
                  disabled={pos.isCurrentRole}
                  min="1960"
                  max={new Date().getFullYear()}
                  value={pos.endYear ?? ''}
                  onChange={(e) => updatePosition(idx, { endYear: parseInt(e.target.value) || undefined })}
                  placeholder={pos.isCurrentRole ? 'Current Position' : 'e.g. 2024'}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id={`currentRole_${idx}`}
                type="checkbox"
                checked={pos.isCurrentRole}
                onChange={(e) => updatePosition(idx, { isCurrentRole: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor={`currentRole_${idx}`} className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                I currently hold this board appointment
              </label>
            </div>
          </div>
        ))}
      </div>

      {error && <span className="text-xs text-rose-500 block">{error}</span>}
    </div>
  )
}
