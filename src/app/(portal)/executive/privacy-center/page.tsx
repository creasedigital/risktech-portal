'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/shared/PortalHeader'
import {
  Shield,
  Eye,
  EyeOff,
  Download,
  AlertTriangle,
  Lock,
  Clock,
  CheckCircle2,
  FileText,
  X,
} from 'lucide-react'

interface RevealedPii {
  fullName: string
  phone: string
  nationality: string
  referees: Array<{
    name: string
    email: string
    phone: string
    relationship: string
    organisation: string
  }>
}

export default function ExecutivePrivacyCenterPage() {
  const [revealedPii, setRevealedPii] = useState<RevealedPii | null>(null)
  const [countdown, setCountdown] = useState<number>(0)
  const [isRevealing, setIsRevealing] = useState(false)
  const [revealError, setRevealError] = useState<string | null>(null)

  const [profileData, setProfileData] = useState<{
    id: string
    currentTitle: string
    currentOrg: string
    vettingStatus: string
    dataProcessConsent: boolean
    consentVersion: string
    consentGrantedAt: string
    consentWithdrawnAt: string | null
  } | null>(null)

  const [, setIsLoadingProfile] = useState(true)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const fetchProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const res = await fetch('/api/executive/onboarding')
      if (res.ok) {
        const data = await res.json()
        setProfileData(data.executive)
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // 30-second Auto-mask Countdown Timer
  useEffect(() => {
    if (countdown <= 0) {
      if (revealedPii) {
        setRevealedPii(null)
      }
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, revealedPii])

  const handleRevealPii = async () => {
    setIsRevealing(true)
    setRevealError(null)

    try {
      const res = await fetch('/api/executive/reveal-pii', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reveal PII')
      }

      setRevealedPii(data.pii)
      setCountdown(30)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to unmask sensitive data'
      setRevealError(msg)
    } finally {
      setIsRevealing(false)
    }
  }

  const handleMaskNow = () => {
    setRevealedPii(null)
    setCountdown(0)
  }

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const res = await fetch('/api/executive/export')
      if (!res.ok) throw new Error('Data export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `risktech-dsar-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      alert('Failed to generate export file. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleWithdrawConsent = async () => {
    setIsWithdrawing(true)
    try {
      const res = await fetch('/api/executive/withdraw-consent', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to revoke consent')

      setIsWithdrawModalOpen(false)
      setWithdrawSuccess(true)
      await fetchProfile()
    } catch {
      alert('Consent revocation encountered an error.')
    } finally {
      setIsWithdrawing(false)
    }
  }

  const isConsentActive = profileData?.dataProcessConsent ?? true

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <PortalHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <Shield className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Executive Privacy & Statutory Rights Center
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Nigeria Data Protection Act (NDPA) 2023 & GDPR Statutory Governance Portal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              AES-256-GCM Encrypted at Rest
            </span>
          </div>
        </div>

        {/* Consent Status Banner */}
        {!isConsentActive && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-5 shadow-xs flex items-start gap-4 text-xs text-rose-900 dark:text-rose-200"
          >
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">
                NDPA 2023 Consent Revoked · Vetting Workflow Frozen
              </span>
              <p className="leading-relaxed">
                You have exercised your statutory right to withdraw personal data processing consent. In accordance with Section 34 of the Nigeria Data Protection Act 2023, your profile is frozen in <strong>DRAFT</strong> status and cannot be presented to client boards.
              </p>
              <div className="pt-2">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center gap-1.5 font-bold underline hover:opacity-80"
                >
                  Re-affirm Consent in Onboarding Wizard →
                </Link>
              </div>
            </div>
          </div>
        )}

        {withdrawSuccess && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Consent has been formally withdrawn and committed to the immutable audit ledger.</span>
          </div>
        )}

        {/* Card 1: PII Masking & Controlled Reveal */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                Sensitive Personal Identifiers (PII)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Masked by default to prevent shoulder-surfing and shared workstation leakage.
              </p>
            </div>

            {/* Reveal Controls */}
            <div>
              {revealedPii ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 animate-pulse">
                    <Clock className="h-3.5 w-3.5" />
                    Auto-mask in {countdown}s
                  </span>
                  <button
                    onClick={handleMaskNow}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                    Mask Now
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRevealPii}
                  disabled={isRevealing}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {isRevealing ? 'Authorizing & Logging...' : 'Reveal PII (Audited 30s)'}
                </button>
              )}
            </div>
          </div>

          {revealError && (
            <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300">
              {revealError}
            </div>
          )}

          {/* Masked vs Revealed Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
                Executive Full Name:
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {revealedPii ? revealedPii.fullName : 'A••••• O•••••'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
                Primary Phone Number:
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {revealedPii ? revealedPii.phone : '+234 ••• ••• 4192'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
                Nationality:
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {revealedPii ? revealedPii.nationality : 'N••••••••'}
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block">
                Primary Governance Referee:
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate block">
                {revealedPii && revealedPii.referees[0]
                  ? `${revealedPii.referees[0].name} (${revealedPii.referees[0].organisation})`
                  : 'Dr. A••••• O••••• (•••••••• Bank)'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: DSAR Data Export (NDPA Sec 34) */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-600" />
                Data Subject Access Request (DSAR)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Export all stored personal records under NDPA Section 34 & GDPR Article 15.
              </p>
            </div>

            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Generating JSON Package...' : 'Export My Personal Data (JSON)'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">1. Consent Records</span>
              <span className="text-slate-500 text-[11px]">Audit timestamps, policy version, and opt-in status.</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">2. Encrypted PII</span>
              <span className="text-slate-500 text-[11px]">Decrypted profile identifiers and referees.</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">3. Document Checksums</span>
              <span className="text-slate-500 text-[11px]">SHA-256 hashes and storage vault metadata.</span>
            </div>
          </div>
        </div>

        {/* Card 3: Consent Revocation */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-950 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-rose-900 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Statutory Consent Revocation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Withdraw affirmative consent to personal data processing under NDPA 2023 Section 34.
              </p>
            </div>

            {isConsentActive && (
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-4 py-2 text-xs font-semibold text-rose-800 dark:text-rose-200 transition-colors"
              >
                Withdraw Consent
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                Confirm Statutory Consent Withdrawal
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Withdrawing your data processing consent will immediately freeze your candidate profile back to <strong>DRAFT</strong> status. RiskTech recruitment consultants will no longer be permitted to process your credentials or present your profile to client organisations until consent is re-granted.
            </p>

            <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
              An immutable revocation record will be written to the append-only SHA-256 audit ledger for compliance verification.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Keep Consent Active
              </button>
              <button
                type="button"
                onClick={handleWithdrawConsent}
                disabled={isWithdrawing}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isWithdrawing ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
