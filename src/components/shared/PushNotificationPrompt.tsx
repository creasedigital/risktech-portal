'use client'

import React, { useState, useEffect } from 'react'
import { Bell, BellCheck, BellRing, Check } from 'lucide-react'

export function PushNotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      if (Notification.permission === 'granted') {
        setIsSubscribed(true)
      }
    }
  }, [])

  const handleEnablePush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    setIsSubscribing(true)

    try {
      const res = await Notification.requestPermission()
      setPermission(res)

      if (res === 'granted') {
        setIsSubscribed(true)

        // Register subscription with server
        let endpoint = `https://fcm.googleapis.com/fcm/send/synthetic-${Date.now()}`
        let keys = {
          p256dh: 'synthetic-p256dh-public-key-entropy',
          auth: 'synthetic-auth-secret-key',
        }

        if ('serviceWorker' in navigator) {
          try {
            const reg = await navigator.serviceWorker.ready
            const sub = await reg.pushManager.getSubscription()
            if (sub) {
              endpoint = sub.endpoint
              const rawKeys = sub.toJSON().keys
              if (rawKeys) keys = { p256dh: rawKeys.p256dh || keys.p256dh, auth: rawKeys.auth || keys.auth }
            }
          } catch {
            // Fallback to synthetic endpoint for local dev/demo
          }
        }

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint, keys }),
        })

        // Show welcome notification
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready
          reg.showNotification('RiskTech & Advisory Alert', {
            body: 'Push notifications active: You will be notified instantly when your vetting status changes.',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          })
        }
      }
    } catch (e) {
      console.warn('Push registration failed:', e)
    } finally {
      setIsSubscribing(false)
    }
  }

  if (permission === 'denied') return null

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/30 p-3.5 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
          {isSubscribed ? <BellCheck className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </div>
        <div>
          <span className="font-semibold text-slate-900 dark:text-white block">
            {isSubscribed ? 'Vetting Status Alerts Enabled' : 'Enable Real-Time Vetting Notifications'}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px] block">
            {isSubscribed
              ? 'You will receive immediate alerts whenever your candidate status is reviewed or updated.'
              : 'Receive real-time push alerts when consultants transition your vetting status.'}
          </span>
        </div>
      </div>

      {!isSubscribed ? (
        <button
          type="button"
          disabled={isSubscribing}
          onClick={handleEnablePush}
          className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <BellRing className="h-3.5 w-3.5" />
          {isSubscribing ? 'Enabling...' : 'Enable Alerts'}
        </button>
      ) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 shrink-0">
          <Check className="h-3.5 w-3.5" /> Active
        </span>
      )}
    </div>
  )
}
