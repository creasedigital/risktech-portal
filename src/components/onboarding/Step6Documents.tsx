'use client'

import React, { useState } from 'react'
import { SecureFileUpload } from '@/components/ui/SecureFileUpload'
import { ArrowRight, AlertCircle, FileCheck } from 'lucide-react'

export interface Step6DocumentsProps {
  summary: {
    consent?: { dataProcessConsent?: boolean; consentVersion?: string }
    profile?: { fullName?: string; currentTitle?: string; currentOrg?: string; phone?: string }
    boardPositions?: Array<{ organisation: string; role: string }>
    sectors?: string[]
    referees?: Array<{ name: string; organisation: string }>
  }
  onSubmit: () => Promise<void>
  isSubmitting?: boolean
  error?: string
}

export function Step6Documents({ summary, onSubmit, isSubmitting = false, error }: Step6DocumentsProps) {
  const [hasCv, setHasCv] = useState(false)
  const [hasId, setHasId] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Document Vault & Final Application Review
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Upload verified documentation for consultant vetting and review your submission summary.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="space-y-4">
        <SecureFileUpload
          type="CV"
          label="Executive Curriculum Vitae (CV) *"
          description="Comprehensive governance leadership resume (.pdf required)"
          accept=".pdf"
          onUploadSuccess={() => setHasCv(true)}
        />

        <SecureFileUpload
          type="IDENTIFICATION"
          label="Government-Issued Identification / Passport *"
          description="National Passport or National Identity Card (.pdf, .png, .jpg)"
          onUploadSuccess={() => setHasId(true)}
        />

        <SecureFileUpload
          type="CERTIFICATION"
          label="Governance & Professional Certifications (Optional)"
          description="Institute of Directors / Risk Management Credentials"
        />
      </div>

      {/* Profile Review Summary Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <FileCheck className="h-5 w-5 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Submission Profile Summary
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block text-slate-400 font-medium">Candidate Name:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {summary.profile?.fullName || 'Not provided'}
            </span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium">Current Role & Institution:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {summary.profile?.currentTitle} at {summary.profile?.currentOrg}
            </span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium">Board Positions Recorded:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {summary.boardPositions?.length || 0} position(s)
            </span>
          </div>

          <div>
            <span className="block text-slate-400 font-medium">Sectors of Expertise:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {summary.sectors?.join(', ') || 'None selected'}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 p-3 text-xs text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Final Submit Button */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting || !hasCv}
          onClick={onSubmit}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 py-3.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Securing & Submitting Application…'
            : !hasCv
            ? 'Please Upload CV to Submit'
            : hasId
            ? 'Submit Final Application for Vetting'
            : 'Submit Application for Vetting'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <span className="block text-center text-[11px] text-slate-400 mt-2">
          Upon submission, profile is locked and submitted to the Consultant Review Queue under NDPA 2023.
        </span>
      </div>
    </div>
  )
}
