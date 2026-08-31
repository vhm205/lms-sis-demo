'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface PwaUpdateState {
  isUpdateAvailable: boolean
  isUpdating: boolean
  showPrompt: boolean
  setShowPrompt: (show: boolean) => void
  updateNow: () => void
  updateLater: () => void
  checkForUpdate: () => Promise<void>
}

const UPDATE_DISMISSED_KEY = 'educenter_pwa_update_dismissed_time'
// Cooldown before reminding again in the same session if dismissed (e.g. 30 minutes)
const DISMISS_COOLDOWN_MS = 30 * 60 * 1000

export function usePwaUpdate(): PwaUpdateState {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const waitingWorkerRef = useRef<ServiceWorker | null>(null)
  const refreshingRef = useRef(false)

  // Handle waiting worker found
  const handleWaitingWorker = useCallback((worker: ServiceWorker) => {
    waitingWorkerRef.current = worker
    setIsUpdateAvailable(true)

    // Check if user recently dismissed the prompt in this session
    const lastDismissed = sessionStorage.getItem(UPDATE_DISMISSED_KEY)
    if (lastDismissed) {
      const timeSinceDismiss = Date.now() - parseInt(lastDismissed, 10)
      if (timeSinceDismiss < DISMISS_COOLDOWN_MS) {
        return // Keep isUpdateAvailable true, but don't force popup immediately
      }
    }

    setShowPrompt(true)
  }, [])

  // Manual or periodic check for SW updates
  const checkForUpdate = useCallback(async () => {
    if (!registrationRef.current) return
    try {
      await registrationRef.current.update()
    } catch (err) {
      console.warn('[PWA] Error checking for service worker update:', err)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // When new SW takes control, reload page to load new assets
    const handleControllerChange = () => {
      if (refreshingRef.current) return
      refreshingRef.current = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    // Register Service Worker and attach lifecycle update listeners
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        registrationRef.current = reg

        // 1. Check if a new SW is already waiting
        if (reg.waiting) {
          handleWaitingWorker(reg.waiting)
        }

        // 2. Listen for newly detected workers
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            // When the installing worker moves to installed and there is an existing controller
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              handleWaitingWorker(newWorker)
            }
          })
        })
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err)
      })

    // Check for updates when user comes back to the tab / app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate()
      }
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', checkForUpdate)

    // Periodic check every 15 minutes
    const intervalId = setInterval(checkForUpdate, 15 * 60 * 1000)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', checkForUpdate)
      clearInterval(intervalId)
    }
  }, [checkForUpdate, handleWaitingWorker])

  // Update immediately
  const updateNow = useCallback(() => {
    setIsUpdating(true)
    const worker = waitingWorkerRef.current || registrationRef.current?.waiting

    if (worker) {
      // Send message to SW to activate immediately
      worker.postMessage({ type: 'SKIP_WAITING' })
    } else {
      // Fallback reload if worker instance reference was lost
      window.location.reload()
    }

    // Safety fallback: if controllerchange doesn't trigger reload within 3s
    setTimeout(() => {
      if (!refreshingRef.current) {
        refreshingRef.current = true
        window.location.reload()
      }
    }, 3000)
  }, [])

  // Dismiss update for later
  const updateLater = useCallback(() => {
    setShowPrompt(false)
    try {
      sessionStorage.setItem(UPDATE_DISMISSED_KEY, Date.now().toString())
    } catch {
      // noop
    }
  }, [])

  return {
    isUpdateAvailable,
    isUpdating,
    showPrompt,
    setShowPrompt,
    updateNow,
    updateLater,
    checkForUpdate
  }
}
