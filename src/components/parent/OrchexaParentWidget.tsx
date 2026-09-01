'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParent } from './parent-provider'
import {
  Mic,
  Sparkles,
  Bot,
  Send,
  CalendarDays,
  ClipboardCheck,
  RotateCcw,
  BookOpen,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export function OrchexaParentWidget() {
  const { parent, selectedStudent } = useParent()
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState<boolean>(true)
  const [isSdkLoaded, setIsSdkLoaded] = useState<boolean>(false)
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null)

  const studentName = selectedStudent?.name || 'bé'
  const studentLastName = selectedStudent?.name?.split(' ').pop() || 'bé'

  const quickSuggestions = [
    {
      title: `Kiểm tra lịch học của ${studentLastName}`,
      icon: CalendarDays,
      prompt: `Em hãy kiểm tra giúp tôi lịch học tuần này của bé ${studentName} với.`
    },
    {
      title: `Xem điểm số và tiến độ học`,
      icon: ClipboardCheck,
      prompt: `Cho tôi xem kết quả điểm số và các bài kiểm tra gần nhất của bé ${studentName}.`
    },
    {
      title: `Đăng ký học bù buổi vắng`,
      icon: RotateCcw,
      prompt: `Bé ${studentName} có buổi học nào bị vắng không? Tôi muốn xin đăng ký học bù cho con.`
    },
    {
      title: `Tư vấn khóa học tiếp theo`,
      icon: BookOpen,
      prompt: `Tư vấn cho tôi lộ trình hoặc khóa học tiếp theo phù hợp với trình độ của bé ${studentName}.`
    }
  ]

  // Initialize Orchexa session whenever parent or selected student changes
  useEffect(() => {
    if (!parent?.id) return

    let isMounted = true
    setIsInitializing(true)
    setInitError(null)

    const SDK_URL = process.env.NEXT_PUBLIC_ORCHEXA_SDK_URL || 'https://app.orchexa.io/sdk/voice-agent.js?v=v2.7.4-bug076-vvh'
    const API_URL = process.env.NEXT_PUBLIC_ORCHEXA_API_BASE || 'https://api.orchexa.io'

    fetch(`/api/ai/bootstrap?studentId=${selectedStudent?.id || ''}&portal=pwa&channel=mobile_app`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-portal': 'pwa',
        'x-channel': 'mobile_app',
        'x-parent-id': parent.id,
        'x-parent-phone': parent.phone
      },
      body: JSON.stringify({
        portal: 'pwa',
        channel: 'mobile_app',
        studentId: selectedStudent?.id
      }),
      credentials: 'include'
    })
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text()
          throw new Error(`Bootstrap failed: ${r.status} ${text}`)
        }
        return r.json()
      })
      .then(async (data) => {
        if (!isMounted) return
        if (!data || !data.session_token) {
          throw new Error('Không nhận được session_token từ Orchexa')
        }
        const token = data.session_token
        setSessionToken(token)
        await loadSdk(SDK_URL)
        if (!isMounted) return

        setIsSdkLoaded(true)
        setIsInitializing(false)

        if (window.VoiceAgent) {
          try {
            window.VoiceAgent.destroy?.()
          } catch {
            // noop
          }
          window.VoiceAgent.init({ sessionToken: token, apiUrl: API_URL })
          window.VoiceAgent.on?.('error', (err: any) => {
            console.error('[OrchexaParentWidget] VoiceAgent error:', err)
            if (err?.code === 'SESSION_EXPIRED') {
              setInitError('Phiên AI đã hết hạn, vui lòng tải lại trang.')
            }
          })
        }
      })
      .catch((err: any) => {
        if (!isMounted) return
        console.error('[OrchexaParentWidget] Init failed:', err)
        setInitError(err.message || 'Lỗi khởi tạo Orchexa AI Agent')
        setIsInitializing(false)
      })

    return () => {
      isMounted = false
      try {
        window.VoiceAgent?.destroy?.()
      } catch {
        // noop
      }
    }
  }, [parent?.id, parent?.phone, selectedStudent?.id])

  const handleSuggestionClick = (suggestion: typeof quickSuggestions[0]) => {
    setActiveSuggestion(suggestion.title)
    if (typeof window !== 'undefined' && window.VoiceAgent) {
      window.VoiceAgent.open?.()
      window.VoiceAgent.switchMode?.('chat')
      window.VoiceAgent.sendMessage?.(suggestion.prompt)
    }
  }

  const handleOpenVoice = () => {
    if (typeof window !== 'undefined' && window.VoiceAgent) {
      window.VoiceAgent.open?.()
      window.VoiceAgent.switchMode?.('voice')
      window.VoiceAgent.startVoiceCall?.()
    }
  }

  const handleOpenChat = () => {
    if (typeof window !== 'undefined' && window.VoiceAgent) {
      window.VoiceAgent.open?.()
      window.VoiceAgent.switchMode?.('chat')
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Context Banner */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-br from-[#FFF0E6] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2C1E14] dark:via-[#201A16] dark:to-[#0F2832] border-2 border-[#FCDCC8] dark:border-[#3D2C20] shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black font-heading text-foreground truncate">
              Orchexa Student Success Agent
            </span>
          </div>

          <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800 shrink-0">
            Live Voice & Chat
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
          Đang phục vụ: <strong className="text-foreground">{parent?.name}</strong> • Hồ sơ con: <strong className="text-primary">{selectedStudent?.name || 'Tất cả con'}</strong> ({selectedStudent?.code})
        </p>
      </div>

      {/* Error Notice */}
      {initError && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Thông báo kết nối AI Agent</span>
          </div>
          <p className="text-[11px] font-medium leading-normal">
            {initError}. Vui lòng kiểm tra cấu hình <code className="font-mono bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded text-[10px]">ORCHEXA_CLIENT_SECRET</code> trong file .env.
          </p>
        </div>
      )}

      {/* Greeting Box & Quick Action Chips */}
      <div className="bg-card border-2 border-border/80 rounded-3xl p-4 sm:p-5 shadow-md space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-bold text-foreground font-heading">
              Trợ lý học vụ EduCenter
            </div>
            <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#251F1A] border border-border/70 text-xs text-foreground/90 leading-relaxed">
              Dạ em chào anh/chị <strong>{parent?.name}</strong>! Em là trợ lý ảo chăm sóc học viên của EduCenter. Em có thể hỗ trợ anh/chị tra cứu điểm số, thời khóa biểu, đăng ký học bù hoặc thông tin các khóa học của bé <strong>{studentName}</strong> hôm nay ạ.
            </div>
          </div>
        </div>

        {/* Quick Action Suggestion Chips */}
        <div className="space-y-2 pt-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground font-heading flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Gợi ý câu hỏi nhanh</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickSuggestions.map((sug, idx) => {
              const Icon = sug.icon
              const isChosen = activeSuggestion === sug.title
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(sug)}
                  className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold transition-all border-1.5 flex items-center gap-2.5 cursor-pointer shadow-2xs group ${
                    isChosen
                      ? 'bg-[#FFF0E6] text-[#D97736] border-[#F2994A] dark:bg-[#352114] dark:text-[#FBAA78]'
                      : 'bg-[#FAF6F0] dark:bg-[#241E1A] hover:bg-[#FFF0E6] dark:hover:bg-[#352114] text-foreground border-border/70 hover:border-[#F2994A]/60'
                  }`}
                >
                  <div className="h-7 w-7 rounded-xl bg-card text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate leading-tight">{sug.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* SDK Mount / Instructions Container */}
      <div className="bg-[#FAF6F0] dark:bg-[#201A16] border border-border/70 rounded-3xl p-4 text-center space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleOpenVoice}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Mic className="h-4 w-4 animate-pulse" />
            <span>Bắt đầu gọi Voice AI</span>
          </button>

          <button
            type="button"
            onClick={handleOpenChat}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-card border-1.5 border-border hover:border-primary text-foreground text-xs font-bold shadow-2xs hover:bg-[#FFF0E6]/50 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Bot className="h-4 w-4 text-primary" />
            <span>Mở cửa sổ Chat</span>
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Agent tự động nhận diện thông tin học sinh và kết nối trực tiếp với hệ thống LMS của trung tâm.
        </p>
      </div>
    </div>
  )
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
