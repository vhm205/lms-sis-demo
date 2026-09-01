'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    VoiceAgent?: {
      init: (opts: { sessionToken?: string; widgetId?: string; workspaceId?: string; apiUrl?: string; context?: Record<string, unknown> }) => Promise<void> | void
      destroy?: () => void
      open?: () => void
      close?: () => void
      toggle?: () => void
      sendMessage?: (text: string, opts?: { displayText?: string }) => Promise<void> | void
      setContext?: (context: Record<string, unknown> | null) => void
      switchMode?: (mode: 'chat' | 'voice') => void
      startVoiceCall?: () => Promise<void> | void
      stopVoiceCall?: () => void
      on?: (event: string, cb: (payload?: any) => void) => void
      emit?: (event: string, payload?: any) => void
      isOpen?: boolean
      mode?: 'chat' | 'voice'
      shadowRoot?: ShadowRoot | null
    }
  }
}

export function OrchexaWidget() {
  const pathname = usePathname()
  const isParentRoute = pathname?.startsWith('/parent')

  useEffect(() => {
    if (isParentRoute) {
      return
    }

    const SDK_URL = process.env.NEXT_PUBLIC_ORCHEXA_SDK_URL || 'https://app.orchexa.io/sdk/voice-agent.js?v=v2.7.4-bug076-vvh'
    const API_URL = process.env.NEXT_PUBLIC_ORCHEXA_API_BASE || 'https://api.orchexa.io'
    if (!SDK_URL || !API_URL) return

    let isMounted = true

    fetch('/api/ai/bootstrap?portal=admin&channel=crm_web', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-portal': 'admin',
        'x-channel': 'crm_web',
      },
      body: JSON.stringify({ portal: 'admin', channel: 'crm_web' }),
      credentials: 'include',
    })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Bootstrap failed with status ${r.status}`)
        }
        return r.json()
      })
      .then(async (data) => {
        if (!isMounted) return
        if (!data || !data.session_token) {
          throw new Error('No session_token returned from /api/ai/bootstrap')
        }
        const token = data.session_token
        await loadSdk(SDK_URL)
        if (!isMounted) return

        try {
          window.VoiceAgent?.destroy?.()
        } catch {
          // noop
        }
        window.VoiceAgent?.init({ sessionToken: token, apiUrl: API_URL })
        window.VoiceAgent?.on?.('error', (err) =>
          console.error('[OrchexaWidget] SDK error:', err)
        )
      })
      .catch((e) => {
        if (isMounted) console.error('[OrchexaWidget] init failed', e)
      })

    return () => {
      isMounted = false
      try {
        window.VoiceAgent?.destroy?.()
      } catch {
        /* noop */
      }
    }
  }, [isParentRoute])

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
