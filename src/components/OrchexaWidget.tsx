'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    VoiceAgent?: {
      init: (opts: { sessionToken: string; apiUrl: string }) => void
      destroy?: () => void
      on?: (event: string, cb: (payload?: unknown) => void) => void
    }
  }
}

export function OrchexaWidget() {
  useEffect(() => {
    const SDK_URL = process.env.NEXT_PUBLIC_ORCHEXA_SDK_URL || 'https://api.orchexa.io/sdk/voice-agent.js'
    const API_URL = process.env.NEXT_PUBLIC_ORCHEXA_API_BASE || 'https://api.orchexa.io'
    if (!SDK_URL || !API_URL) return

    let sessionToken: string | null = null

    fetch('/api/ai/bootstrap', { method: 'POST', credentials: 'include' })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Bootstrap failed with status ${r.status}`)
        }
        return r.json()
      })
      .then((data) => {
        if (!data || !data.session_token) {
          throw new Error('No session_token returned from /api/ai/bootstrap')
        }
        sessionToken = data.session_token
        return loadSdk(SDK_URL)
      })
      .then(() => {
        if (!sessionToken) return
        window.VoiceAgent?.init({ sessionToken, apiUrl: API_URL })
        window.VoiceAgent?.on?.('error', (err) =>
          console.error('[OrchexaWidget]', err)
        )
      })
      .catch((e) => console.error('[OrchexaWidget] init failed', e))

    return () => {
      try {
        window.VoiceAgent?.destroy?.()
      } catch {
        /* noop */
      }
    }
  }, [])

  return null
}

function loadSdk(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const id = 'voice-agent-sdk'
    const existing = document.getElementById(id) as HTMLScriptElement | null
    if (existing) {
      if (window.VoiceAgent) return resolve()
      existing.addEventListener('load', () => resolve(), { once: true })
      return
    }
    const s = document.createElement('script')
    s.id = id
    s.src = src
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error(`SDK failed: ${src}`))
    document.body.appendChild(s)
  })
}
