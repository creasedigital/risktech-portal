'use client'

import React from 'react'
import { Lock, UserCheck, Mail, Phone, Building, Users } from 'lucide-react'

export interface Referee {
  name: string
  email: string
  phone: string
  relationship: string
  organisation: string
}

export interface Step5RefereesProps {
  data: {
    referees?: Referee[]
  }
  onChange: (updated: { referees: Referee[] }) => void
  errors?: Record<string, string>
}

export function Step5Referees({ data, onChange, errors }: Step5RefereesProps) {
  const referees = data.referees && data.referees.length === 2
    ? data.referees
    : [
        {
          name: '',
          email: '',
          phone: '',
          relationship: 'Former Board Chairman / Committee Chair',
          organisation: '',
        },
        {
          name: '',
          email: '',
          phone: '',
          relationship: 'Senior Independent Director Colleague',
          organisation: '',
        },
      ]

  const updateReferee = (index: number, updatedField: Partial<Referee>) => {
    const updated = [...referees]
    const current = updated[index]
    if (current) {
      updated[index] = { ...current, ...updatedField }
      onChange({ referees: updated })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Governance & Institutional Referees
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provide contact details for two senior governance peers or committee colleagues.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Lock className="h-3 w-3" />
          <span>AES-256-GCM Encrypted JSON</span>
        </div>
      </div>

      <div className="space-y-4">
        {referees.map((ref, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Institutional Referee #{idx + 1}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Referee Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={ref.name}
                    onChange={(e) => updateReferee(idx, { name: e.target.value })}
                    placeholder="e.g. Dr. Kwame Mensah"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={ref.email}
                    onChange={(e) => updateReferee(idx, { email: e.target.value })}
                    placeholder="k.mensah@institution.org"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={ref.phone}
                    onChange={(e) => updateReferee(idx, { phone: e.target.value })}
                    placeholder="+233 24 555 0184"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Organisation / Board <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={ref.organisation}
                    onChange={(e) => updateReferee(idx, { organisation: e.target.value })}
                    placeholder="Atlas Inter-Continental Bank"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {errors?.referees && <span className="text-xs text-rose-500 block">{errors.referees}</span>}
    </div>
  )
}
