'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.info('[SW] Service Worker registered with scope:', registration.scope)
        })
        .catch((error) => {
          console.warn('[SW] Service Worker registration failed:', error)
        })
    }
  }, [])

  return null
}
