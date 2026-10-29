'use client'

import React, { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Lock } from 'lucide-react'
import type { DocumentTypeKey } from '@/lib/validation/document.schema'

export interface SecureFileUploadProps {
  type: DocumentTypeKey
  label: string
  description?: string
  accept?: string
  onUploadSuccess?: (doc: { id: string; originalName: string; sha256: string; type: string }) => void
}

export function SecureFileUpload({
  type,
  label,
  description = 'PDF, PNG, or JPEG up to 10MB',
  accept = '.pdf,.png,.jpg,.jpeg',
  onUploadSuccess,
}: SecureFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedDoc, setUploadedDoc] = useState<{ id: string; originalName: string; sha256: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setError(null)
    setIsUploading(true)

    if (file.size > 10 * 1024 * 1024) {
      setError('File exceeds maximum size of 10MB.')
      setIsUploading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)

      const res = await fetch('/api/executive/documents/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Upload failed. File signature could not be verified.')
        return
      }

      setUploadedDoc(data.document)
      if (onUploadSuccess) {
        onUploadSuccess(data.document)
      }
    } catch {
      setError('Network communication failed during file upload.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleUpload(file)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={`file-input-${type}`}
          className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] flex items-center gap-1 text-slate-400">
          <Lock className="h-3 w-3" />
          <span>Magic-byte verified</span>
        </span>
      </div>

      {uploadedDoc ? (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 truncate max-w-xs">
                {uploadedDoc.originalName}
              </div>
              <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400/80 truncate max-w-xs">
                SHA-256: {uploadedDoc.sha256.substring(0, 16)}…
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadedDoc(null)}
            className="text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:underline"
          >
            Replace
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <input
            id={`file-input-${type}`}
            data-testid={`file-input-${type}`}
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUpload(file)
            }}
            className="hidden"
          />

          <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {isUploading ? 'Verifying Magic Bytes & Uploading…' : 'Drop document here or click to browse'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{description}</span>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
