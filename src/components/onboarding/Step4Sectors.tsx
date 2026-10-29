'use client'

import React from 'react'
import { SECTORS } from '@/lib/validation/executive.schema'
import { Plus, Trash2, GraduationCap } from 'lucide-react'

export interface Qualification {
  institution: string
  credential: string
  year: number
}

export interface Step4SectorsProps {
  data: {
    sectors?: string[]
    qualifications?: Qualification[]
  }
  onChange: (updated: { sectors: string[]; qualifications: Qualification[] }) => void
  error?: string
}

export function Step4Sectors({ data, onChange, error }: Step4SectorsProps) {
  const selectedSectors = data.sectors ?? []
  const qualifications = data.qualifications && data.qualifications.length > 0
    ? data.qualifications
    : [
        {
          institution: '',
          credential: '',
          year: new Date().getFullYear() - 8,
        },
      ]

  const toggleSector = (sector: string) => {
    const updatedSectors = selectedSectors.includes(sector)
      ? selectedSectors.filter((s) => s !== sector)
      : [...selectedSectors, sector]
    onChange({ sectors: updatedSectors, qualifications })
  }

  const updateQual = (index: number, updatedField: Partial<Qualification>) => {
    const updated = [...qualifications]
    const current = updated[index]
    if (current) {
      updated[index] = { ...current, ...updatedField }
      onChange({ sectors: selectedSectors, qualifications: updated })
    }
  }

  const addQual = () => {
    onChange({
      sectors: selectedSectors,
      qualifications: [
        ...qualifications,
        { institution: '', credential: '', year: new Date().getFullYear() - 5 },
      ],
    })
  }

  const removeQual = (index: number) => {
    if (qualifications.length <= 1) return
    const updated = qualifications.filter((_, i) => i !== index)
    onChange({ sectors: selectedSectors, qualifications: updated })
  }

  return (
    <div className="space-y-6">
      {/* Sector Multi-Select */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Primary Sectors of Governance Expertise
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select the industries where you possess deep domain oversight or regulatory experience.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {SECTORS.map((sector) => {
            const isSelected = selectedSectors.includes(sector)
            return (
              <button
                key={sector}
                type="button"
                onClick={() => toggleSector(sector)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {sector}
              </button>
            )
          })}
        </div>
      </div>

      {/* Qualifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Academic & Professional Qualifications
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Degrees, directorship diplomas, or certified risk credentials.
            </p>
          </div>
          <button
            type="button"
            onClick={addQual}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Credential</span>
          </button>
        </div>

        {qualifications.map((q, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 relative space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span>Credential #{idx + 1}</span>
              </span>
              {qualifications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQual(idx)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  required
                  value={q.institution}
                  onChange={(e) => updateQual(idx, { institution: e.target.value })}
                  placeholder="Lagos Business School"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Credential Title
                </label>
                <input
                  type="text"
                  required
                  value={q.credential}
                  onChange={(e) => updateQual(idx, { credential: e.target.value })}
                  placeholder="Executive MBA / FCIB"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Year
                </label>
                <input
                  type="number"
                  min="1960"
                  max={new Date().getFullYear()}
                  value={q.year}
                  onChange={(e) => updateQual(idx, { year: parseInt(e.target.value) || 2015 })}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <span className="text-xs text-rose-500 block">{error}</span>}
    </div>
  )
}
