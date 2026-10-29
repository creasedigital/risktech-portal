'use client'

import React from 'react'
import { Lock, User, Phone, Globe, Briefcase, Building } from 'lucide-react'

export interface Step2ProfileProps {
  data: {
    fullName?: string
    phone?: string
    nationality?: string
    currentTitle?: string
    currentOrg?: string
  }
  onChange: (updated: {
    fullName: string
    phone: string
    nationality: string
    currentTitle: string
    currentOrg: string
  }) => void
  errors?: Record<string, string>
}

export function Step2Profile({ data, onChange, errors }: Step2ProfileProps) {
  const handleChange = (field: string, value: string) => {
    onChange({
      fullName: data.fullName ?? '',
      phone: data.phone ?? '',
      nationality: data.nationality ?? '',
      currentTitle: data.currentTitle ?? '',
      currentOrg: data.currentOrg ?? '',
      [field]: value,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Executive Professional Identity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Primary leadership contact and current institutional affiliation.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950 px-3 py-1 text-xs font-semibold text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Lock className="h-3 w-3" />
          <span>AES-256-GCM Encrypted at Rest</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Full Legal Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={data.fullName ?? ''}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="e.g. Alice Folashade Okafor"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors?.fullName && <span className="text-xs text-rose-500 mt-1 block">{errors.fullName}</span>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Direct Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="tel"
              required
              value={data.phone ?? ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+234 803 555 0192"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors?.phone && <span className="text-xs text-rose-500 mt-1 block">{errors.phone}</span>}
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Nationality / Citizenship <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={data.nationality ?? ''}
              onChange={(e) => handleChange('nationality', e.target.value)}
              placeholder="e.g. Nigerian, Ghanaian, Kenyan"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors?.nationality && <span className="text-xs text-rose-500 mt-1 block">{errors.nationality}</span>}
        </div>

        {/* Current Job Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Current Executive Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={data.currentTitle ?? ''}
              onChange={(e) => handleChange('currentTitle', e.target.value)}
              placeholder="Chief Risk Officer (CRO)"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors?.currentTitle && <span className="text-xs text-rose-500 mt-1 block">{errors.currentTitle}</span>}
        </div>

        {/* Current Organisation */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Current Institution / Company <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={data.currentOrg ?? ''}
              onChange={(e) => handleChange('currentOrg', e.target.value)}
              placeholder="Pan-African InfraTech Holdings"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {errors?.currentOrg && <span className="text-xs text-rose-500 mt-1 block">{errors.currentOrg}</span>}
        </div>
      </div>
    </div>
  )
}
