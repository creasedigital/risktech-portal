'use client'

import React, { useEffect, useState } from 'react'
import {
  X,
  ShieldCheck,
  Building,
  Award,
  Users,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { GrcBadge } from '@/components/ui/GrcBadge'
import type { VettingStatus } from '@/types/fsm'
import type { VettingAction } from '@/lib/validation/vetting.schema'

interface CandidateDetail {
  id: string
  fullName: string
  phone: string
  nationality: string
  currentTitle: string
  currentOrg: string
  vettingStatus: VettingStatus
  dataProcessConsent: boolean
  consentVersion: string
  consentGrantedAt: string | null
  boardExperience: Array<{
    organisation: string
    role: string
    startYear: number
    endYear?: number
    isCurrentRole: boolean
  }>
  sectors: string[]
  qualifications: Array<{
    institution: string
    credential: string
    year: number
  }>
  referees: Array<{
    name: string
    email: string
    phone: string
    relationship: string
    organisation: string
  }>
  documents: Array<{
    id: string
    type: string
    filename: string
    mimeType: string
    sizeBytes: number
    sha256Checksum: string
    createdAt: string
  }>
  vettingNotes: Array<{
    id: string
    note: string
    statusChange: string | null
    createdAt: string
    authorName: string
  }>
  submittedAt: string | null
}

interface CandidateDetailDrawerProps {
  candidateId: string | null
  onClose: () => void
  onStatusUpdated: () => void
}

export function CandidateDetailDrawer({
  candidateId,
  onClose,
  onStatusUpdated,
}: CandidateDetailDrawerProps) {
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Action / Note Modal State
  const [activeAction, setActiveAction] = useState<VettingAction | null>(null)
  const [noteText, setNoteText] = useState('')
  const [isSubmittingAction, setIsSubmittingAction] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!candidateId) {
      setCandidate(null)
      return
    }

    setIsLoading(true)
    setError(null)

    fetch(`/api/consultant/queue/${candidateId}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to load candidate details')
        }
        return res.json()
      })
      .then((data) => {
        setCandidate(data.executive)
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [candidateId])

  if (!candidateId) return null

  const handleExecuteTransition = async (action: VettingAction) => {
    setIsSubmittingAction(true)
    setActionError(null)

    try {
      const res = await fetch(`/api/consultant/vetting/${candidateId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          note: noteText.trim() ? noteText.trim() : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process vetting transition')
      }

      // Close modal, reset note, reload candidate data and notify parent
      setActiveAction(null)
      setNoteText('')
      onStatusUpdated()

      // Refetch current drawer candidate
      const refresh = await fetch(`/api/consultant/queue/${candidateId}`)
      if (refresh.ok) {
        const refData = await refresh.json()
        setCandidate(refData.executive)
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Transition failed'
      setActionError(message)
    } finally {
      setIsSubmittingAction(false)
    }
  }

  const isNoteRequired = activeAction === 'REQUEST_MORE_INFO' || activeAction === 'REJECT'
  const isNoteValid = !isNoteRequired || noteText.trim().length >= 10

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {candidate?.fullName || 'Candidate Review'}
              </h2>
              {candidate && <GrcBadge status={candidate.vettingStatus} />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {candidate?.currentTitle} · {candidate?.currentOrg}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close review drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading && (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              Decrypting candidate profile and loading governance records...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300">
              {error}
            </div>
          )}

          {candidate && !isLoading && (
            <>
              {/* Identity & NDPA Consent Box */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    NDPA 2023 Consent Verification
                  </span>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {candidate.dataProcessConsent ? 'Explicitly Granted' : 'Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Phone (Decrypted):</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200">{candidate.phone}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Nationality:</span>
                    <span className="text-slate-900 dark:text-slate-200">{candidate.nationality}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Policy Version:</span>
                    <span className="font-mono text-slate-900 dark:text-slate-200">{candidate.consentVersion}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Application Submitted:</span>
                    <span className="text-slate-900 dark:text-slate-200">
                      {candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleDateString() : 'Draft'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Board Positions */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5" />
                  Board Appointments ({candidate.boardExperience?.length || 0})
                </h3>
                <div className="space-y-2">
                  {candidate.boardExperience && candidate.boardExperience.length > 0 ? (
                    candidate.boardExperience.map((bp, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs bg-white dark:bg-slate-900"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {bp.role}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">
                              {bp.organisation}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-500">
                            {bp.startYear} – {bp.isCurrentRole ? 'Present' : bp.endYear || ''}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No board positions recorded.</div>
                  )}
                </div>
              </div>

              {/* Sectors & Qualifications */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" />
                  Sectors & Qualifications
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.sectors && candidate.sectors.map((sec) => (
                    <span
                      key={sec}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      {sec}
                    </span>
                  ))}
                </div>
                <div className="space-y-1.5 pt-1">
                  {candidate.qualifications && candidate.qualifications.map((q, idx) => (
                    <div key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex justify-between">
                      <span><strong>{q.credential}</strong> — {q.institution}</span>
                      <span className="font-mono text-slate-400">{q.year}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referees */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Primary Governance Referees ({candidate.referees?.length || 0})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {candidate.referees && candidate.referees.map((ref, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs bg-white dark:bg-slate-900 space-y-1"
                    >
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {ref.name}
                      </span>
                      <span className="text-slate-500 block text-[11px]">
                        {ref.relationship} · {ref.organisation}
                      </span>
                      <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 block pt-1">
                        {ref.email}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents Vault */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Verified Document Vault ({candidate.documents?.length || 0})
                </h3>
                <div className="space-y-2">
                  {candidate.documents && candidate.documents.length > 0 ? (
                    candidate.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs bg-white dark:bg-slate-900 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {doc.filename}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {doc.type}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                            SHA-256: {doc.sha256Checksum.substring(0, 16)}...
                          </span>
                        </div>

                        <a
                          href={`/api/executive/documents/${doc.id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 italic">No attachments found in vault.</div>
                  )}
                </div>
              </div>

              {/* Previous Vetting Notes */}
              {candidate.vettingNotes && candidate.vettingNotes.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Consultant Vetting History ({candidate.vettingNotes.length})
                  </h3>
                  <div className="space-y-2">
                    {candidate.vettingNotes.map((n) => (
                      <div
                        key={n.id}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-xs bg-slate-50 dark:bg-slate-800/30"
                      >
                        <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {n.authorName} ({n.statusChange || 'Note'})
                          </span>
                          <span className="font-mono">{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer / FSM Action Bar */}
        {candidate && !isLoading && (
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Current Vetting Phase: <strong className="text-slate-900 dark:text-white">{candidate.vettingStatus}</strong>
            </span>

            <div className="flex items-center gap-2">
              {candidate.vettingStatus === 'SUBMITTED' && (
                <button
                  type="button"
                  onClick={() => handleExecuteTransition('START_REVIEW')}
                  disabled={isSubmittingAction}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Start Review
                </button>
              )}

              {candidate.vettingStatus === 'UNDER_REVIEW' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAction('REQUEST_MORE_INFO')
                      setNoteText('')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200 transition-colors"
                  >
                    Request Info
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAction('REJECT')
                      setNoteText('')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3.5 py-2 text-xs font-semibold text-rose-800 dark:text-rose-200 transition-colors"
                  >
                    Reject
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAction('VERIFY')
                      setNoteText('')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verify Candidate
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Transition Confirmation & Reviewer Note Modal */}
        {activeAction && (
          <div className="absolute inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeAction === 'VERIFY' && 'Confirm Candidate Verification'}
                  {activeAction === 'REQUEST_MORE_INFO' && 'Request Additional Information'}
                  {activeAction === 'REJECT' && 'Reject Executive Application'}
                </h4>
                <button
                  onClick={() => setActiveAction(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {activeAction === 'VERIFY' &&
                  'Marking this candidate as VERIFIED will complete primary credential checks and make the executive presentable to client board appointments.'}
                {activeAction === 'REQUEST_MORE_INFO' &&
                  'Please specify precisely which credentials or documents require revision. This note will be recorded in the immutable audit ledger.'}
                {activeAction === 'REJECT' &&
                  'Rejection requires a defensible governance rationale recorded in the audit trail.'}
              </p>

              {actionError && (
                <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300">
                  {actionError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>
                    Consultant Vetting Note {isNoteRequired ? '(Mandatory, min 10 chars)' : '(Optional)'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {noteText.length} characters
                  </span>
                </label>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={
                    isNoteRequired
                      ? 'Enter detailed justification for audit defensibility...'
                      : 'Optional comments for internal records...'
                  }
                  rows={4}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveAction(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteTransition(activeAction)}
                  disabled={!isNoteValid || isSubmittingAction}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg text-white shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    activeAction === 'REJECT'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : activeAction === 'VERIFY'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmittingAction ? 'Processing...' : 'Confirm Transition'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
