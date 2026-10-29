import React from 'react'
import { Clock, AlertTriangle, CheckCircle2, XCircle, FileText } from 'lucide-react'

export type GrcStatusType = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'MORE_INFO_REQUIRED' | 'VERIFIED' | 'REJECTED'

export interface GrcBadgeProps {
  status: GrcStatusType
  className?: string
  size?: 'sm' | 'md'
}

const statusConfig: Record<
  GrcStatusType,
  { label: string; icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  DRAFT: {
    label: 'Draft Application',
    icon: FileText,
    classes: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  SUBMITTED: {
    label: 'Submitted for Review',
    icon: Clock,
    classes: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  },
  UNDER_REVIEW: {
    label: 'Under Governance Review',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  },
  MORE_INFO_REQUIRED: {
    label: 'Action Required',
    icon: AlertTriangle,
    classes: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  },
  VERIFIED: {
    label: 'Verified & Vetted',
    icon: CheckCircle2,
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  },
  REJECTED: {
    label: 'Application Rejected',
    icon: XCircle,
    classes: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
  },
}

export function GrcBadge({ status, className = '', size = 'md' }: GrcBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.DRAFT
  const Icon = config.icon

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5'
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-xs transition-colors ${config.classes} ${sizeClasses} ${className}`}
    >
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </span>
  )
}
