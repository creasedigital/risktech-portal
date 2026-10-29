'use client'

import React, { useSyncExternalStore } from 'react'
import { WifiOff } from 'lucide-react'

function subscribe(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function getServerSnapshot() {
  return true
}

export function OfflineBanner() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (isOnline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-amber-500 dark:bg-amber-600 text-slate-950 font-medium text-xs px-4 py-2 flex items-center justify-center gap-2 shadow-sm transition-all animate-in slide-in-from-top duration-300"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>
        <strong>Offline Mode Active:</strong> Drafts are safely preserved in local IndexedDB. Server mutations will synchronize automatically once reconnected.
      </span>
    </div>
  )
}
