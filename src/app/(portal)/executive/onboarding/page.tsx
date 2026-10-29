'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { PortalHeader } from '@/components/shared/PortalHeader'
import { useOnboardingDraftStore } from '@/stores/useOnboardingDraftStore'
import { GrcBadge } from '@/components/ui/GrcBadge'
import { PushNotificationPrompt } from '@/components/shared/PushNotificationPrompt'
import { Step1Consent } from '@/components/onboarding/Step1Consent'
import { Step2Profile } from '@/components/onboarding/Step2Profile'
import { Step3BoardExperience } from '@/components/onboarding/Step3BoardExperience'
import { Step4Sectors } from '@/components/onboarding/Step4Sectors'
import { Step5Referees } from '@/components/onboarding/Step5Referees'
import { Step6Documents } from '@/components/onboarding/Step6Documents'
import {
  step1ConsentSchema,
  step2ProfileSchema,
  step3BoardExperienceSchema,
  step4SectorSchema,
  step5RefereesSchema,
} from '@/lib/validation/executive.schema'
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
  Shield,
  AlertCircle,
} from 'lucide-react'

const STEPS = [
  { id: 1, name: 'Consent', label: 'NDPA Consent' },
  { id: 2, name: 'Profile', label: 'Professional Profile' },
  { id: 3, name: 'Board', label: 'Board Experience' },
  { id: 4, name: 'Sectors', label: 'Sectors & Qualifications' },
  { id: 5, name: 'Referees', label: 'Governance Referees' },
  { id: 6, name: 'Documents', label: 'Vault & Submission' },
]

export default function ExecutiveOnboardingPage() {
  const {
    currentStep,
    completedSteps,
    stepData,
    setCurrentStep,
    setStepData,
    markStepComplete,
  } = useOnboardingDraftStore()

  const [validationError, setValidationError] = useState<string | null>(null)
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [refereeErrors, setRefereeErrors] = useState<Record<string, string>>({})
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false)
  const [serverStatus, setServerStatus] = useState<string | null>(null)

  // Load existing profile if already on server
  useEffect(() => {
    fetch('/api/executive/onboarding')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.executive) {
          setServerStatus(data.executive.vettingStatus)
          if (data.executive.vettingStatus === 'SUBMITTED' || data.executive.vettingStatus === 'UNDER_REVIEW' || data.executive.vettingStatus === 'VERIFIED') {
            setSubmittedSuccess(true)
          }
        }
      })
      .catch(() => {})
  }, [])

  const saveCurrentStepToServer = async (step: number) => {
    setIsSavingDraft(true)
    try {
      let payloadData: unknown = null
      if (step === 1) payloadData = stepData.consent
      else if (step === 2) payloadData = stepData.profile
      else if (step === 3) payloadData = stepData.boardExperience
      else if (step === 4) payloadData = stepData.sectorAndQualifications
      else if (step === 5) payloadData = stepData.referees

      if (payloadData) {
        await fetch('/api/executive/onboarding/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step, data: payloadData }),
        })
      }
    } catch {
      // offline fallback: draft is already saved in Zustand / IndexedDB
    } finally {
      setIsSavingDraft(false)
    }
  }

  const validateAndProceed = async () => {
    setValidationError(null)
    setProfileErrors({})
    setRefereeErrors({})

    try {
      if (currentStep === 1) {
        const consent = stepData.consent || { dataProcessConsent: false, marketingConsent: false, consentVersion: '2024-01-v1' }
        step1ConsentSchema.parse(consent)
        markStepComplete(1)
        await saveCurrentStepToServer(1)
        setCurrentStep(2)
      } else if (currentStep === 2) {
        const profile = stepData.profile || { fullName: '', phone: '', nationality: '', currentTitle: '', currentOrg: '' }
        step2ProfileSchema.parse(profile)
        markStepComplete(2)
        await saveCurrentStepToServer(2)
        setCurrentStep(3)
      } else if (currentStep === 3) {
        const positions = stepData.boardExperience || { boardPositions: [] }
        step3BoardExperienceSchema.parse(positions)
        markStepComplete(3)
        await saveCurrentStepToServer(3)
        setCurrentStep(4)
      } else if (currentStep === 4) {
        const sq = stepData.sectorAndQualifications || { sectors: [], qualifications: [] }
        step4SectorSchema.parse(sq)
        markStepComplete(4)
        await saveCurrentStepToServer(4)
        setCurrentStep(5)
      } else if (currentStep === 5) {
        const ref = stepData.referees || { referees: [] }
        step5RefereesSchema.parse(ref)
        markStepComplete(5)
        await saveCurrentStepToServer(5)
        setCurrentStep(6)
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'issues' in err) {
        const issues = (err as { issues: Array<{ path: (string | number)[]; message: string }> }).issues
        const first = issues[0]?.message
        setValidationError(first || 'Please fill in all mandatory fields before advancing.')

        if (currentStep === 2) {
          const mapped: Record<string, string> = {}
          issues.forEach((i) => {
            const p = i.path[0]
            if (p) mapped[String(p)] = i.message
          })
          setProfileErrors(mapped)
        } else if (currentStep === 5) {
          const mapped: Record<string, string> = {}
          issues.forEach((i) => {
            const idx = i.path[1]
            const field = i.path[2]
            if (idx !== undefined && field) {
              mapped[`${idx}_${String(field)}`] = i.message
            }
          })
          setRefereeErrors(mapped)
        }
      } else {
        setValidationError('Validation check failed. Please check required fields.')
      }
    }
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await fetch('/api/executive/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed.')
      }

      setSubmittedSuccess(true)
      setServerStatus('SUBMITTED')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Application submission encountered an error.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16]">
      <PortalHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* If already submitted */}
        {submittedSuccess ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm text-center max-w-2xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-6">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="inline-block mb-3">
              <GrcBadge status={serverStatus === 'VERIFIED' ? 'VERIFIED' : 'SUBMITTED'} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Onboarding Submission Received
            </h1>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your senior executive governance profile and verified credentials have been received and cryptographically committed to the append-only audit ledger. A RiskTech recruitment consultant has been assigned to conduct primary source credential verification.
            </p>

            <div className="mt-8 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>NDPA Consent Record:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">Active (2024-01-v1)</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Encryption Standard:</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 font-medium">AES-256-GCM (At Rest)</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Ledger Integrity:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">SHA-256 Hash Chained</span>
              </div>
            </div>

            <div className="mt-6 mb-2">
              <PushNotificationPrompt />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/privacy"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
              >
                <Shield className="h-4 w-4" />
                Executive Privacy Center
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Executive Onboarding Portal
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Step {currentStep} of {STEPS.length}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Institutional vetting for board, committee, and advisory appointments.
                </p>
              </div>

              {/* Save Draft Action */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => saveCurrentStepToServer(currentStep)}
                  disabled={isSavingDraft}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {isSavingDraft ? 'Saving Draft...' : 'Save Draft'}
                </button>
              </div>
            </div>

            <PushNotificationPrompt />

            {/* Stepper Navigation */}
            <nav aria-label="Progress" className="hidden sm:block">
              <ol className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-3 shadow-xs">
                {STEPS.map((step, idx) => {
                  const isCurrent = step.id === currentStep
                  const isDone = completedSteps.includes(step.id)

                  return (
                    <li key={step.id} className="flex-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (isDone || step.id <= currentStep) {
                            setCurrentStep(step.id)
                          }
                        }}
                        disabled={!isDone && step.id > currentStep}
                        className={`group flex items-center gap-2 text-left w-full transition-opacity ${
                          !isDone && step.id > currentStep ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-blue-700 text-white ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isDone ? <Check className="h-4 w-4" /> : step.id}
                        </div>
                        <span
                          className={`text-xs font-semibold truncate ${
                            isCurrent
                              ? 'text-blue-700 dark:text-blue-400 font-bold'
                              : isDone
                              ? 'text-slate-900 dark:text-white'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {step.name}
                        </span>
                      </button>

                      {idx < STEPS.length - 1 && (
                        <div className="w-8 mx-2 border-t border-slate-200 dark:border-slate-800 hidden md:block" />
                      )}
                    </li>
                  )
                })}
              </ol>
            </nav>

            {/* Validation Banner */}
            {validationError && (
              <div
                role="alert"
                className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs font-medium text-rose-800 dark:text-rose-300 flex items-center gap-2.5 shadow-xs"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Step Card Body */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
              {currentStep === 1 && (
                <Step1Consent
                  data={stepData.consent || {}}
                  onChange={(updated) => setStepData('consent', updated)}
                  error={validationError || undefined}
                />
              )}

              {currentStep === 2 && (
                <Step2Profile
                  data={stepData.profile || {}}
                  onChange={(updated) => setStepData('profile', updated)}
                  errors={profileErrors}
                />
              )}

              {currentStep === 3 && (
                <Step3BoardExperience
                  data={stepData.boardExperience || { boardPositions: [] }}
                  onChange={(updated) => setStepData('boardExperience', updated)}
                  error={validationError || undefined}
                />
              )}

              {currentStep === 4 && (
                <Step4Sectors
                  data={stepData.sectorAndQualifications || { sectors: [], qualifications: [] }}
                  onChange={(updated) => setStepData('sectorAndQualifications', updated)}
                  error={validationError || undefined}
                />
              )}

              {currentStep === 5 && (
                <Step5Referees
                  data={stepData.referees || { referees: [] }}
                  onChange={(updated) => setStepData('referees', updated)}
                  errors={refereeErrors}
                />
              )}

              {currentStep === 6 && (
                <Step6Documents
                  summary={{
                    consent: stepData.consent,
                    profile: stepData.profile,
                    boardPositions: stepData.boardExperience?.boardPositions,
                    sectors: stepData.sectorAndQualifications?.sectors,
                    referees: stepData.referees?.referees,
                  }}
                  onSubmit={handleFinalSubmit}
                  isSubmitting={isSubmitting}
                  error={submitError || undefined}
                />
              )}

              {/* Wizard Footer Controls (Steps 1 through 5) */}
              {currentStep < 6 && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep > 1) {
                        setValidationError(null)
                        setCurrentStep(currentStep - 1)
                      }
                    }}
                    disabled={currentStep === 1}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Step
                  </button>

                  <button
                    type="button"
                    onClick={validateAndProceed}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    Continue to Step {currentStep + 1}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
