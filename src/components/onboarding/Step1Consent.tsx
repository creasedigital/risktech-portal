'use client'

import React from 'react'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { CONSENT_VERSION } from '@/lib/validation/executive.schema'

export interface Step1ConsentProps {
  data: {
    dataProcessConsent?: boolean
    marketingConsent?: boolean
    consentVersion?: string
  }
  onChange: (updated: { dataProcessConsent: boolean; marketingConsent: boolean; consentVersion: string }) => void
  error?: string
}

export function Step1Consent({ data, onChange, error }: Step1ConsentProps) {
  const isDataProcess = data.dataProcessConsent ?? false
  const isMarketing = data.marketingConsent ?? false

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Nigeria Data Protection Act (NDPA) 2023 Explicit Consent Notice
            </h2>
            <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300">
              Policy Version: {CONSENT_VERSION} · Active Governance Framework
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
          <p>
            In compliance with Section 26 of the Nigeria Data Protection Act (NDPA) 2023 and international privacy standards, RiskTech & Advisory captures and processes senior executive profile data strictly for candidate qualification, professional vetting, and institutional presentation to client boards.
          </p>
          <p>
            All sensitive personal identifiers (including phone numbers, national identification, and referee contacts) are protected by application-layer AES-256-GCM encryption at rest. You retain statutory rights under NDPA Section 34 to inspect, export, or withdraw your consent at any time via your Executive Privacy Center.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Mandatory Data Processing Consent */}
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <input
            id="dataProcessConsent"
            type="checkbox"
            checked={isDataProcess}
            onChange={(e) =>
              onChange({
                dataProcessConsent: e.target.checked,
                marketingConsent: isMarketing,
                consentVersion: CONSENT_VERSION,
              })
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="dataProcessConsent" className="cursor-pointer">
            <span className="block text-xs font-bold text-slate-900 dark:text-white">
              I grant explicit consent for executive vetting and institutional data processing (Mandatory)
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Authorizes RiskTech & Advisory to review, verify board credentials, and present my governance profile to client audit and nomination committees.
            </span>
          </label>
        </div>

        {/* Optional Marketing Consent */}
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <input
            id="marketingConsent"
            type="checkbox"
            checked={isMarketing}
            onChange={(e) =>
              onChange({
                dataProcessConsent: isDataProcess,
                marketingConsent: e.target.checked,
                consentVersion: CONSENT_VERSION,
              })
            }
            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="marketingConsent" className="cursor-pointer">
            <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Receive RiskTech Governance Thought Leadership & Market Briefings (Optional)
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Periodic quarterly governance risk reports, board compensation surveys, and regulatory updates.
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
