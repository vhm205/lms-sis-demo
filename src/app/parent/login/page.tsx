'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  GraduationCap,
  Phone,
  KeyRound,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react'

interface SampleParent {
  id: string
  name: string
  phone: string
  childrenCount: number
  childrenNames: string
  childrenSummary: Array<{
    id: string
    code: string
    name: string
    facility?: string
    courses: string[]
  }>
}

export default function ParentLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [sampleParents, setSampleParents] = useState<SampleParent[]>([])
  const [isFetchingSamples, setIsFetchingSamples] = useState(true)

  // Fetch sample parents for 1-click test
  useEffect(() => {
    fetch('/api/parent/auth/sample-parents')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSampleParents(data.data)
        }
      })
      .catch(() => {})
      .finally(() => setIsFetchingSamples(false))
  }, [])

  const handleSendOtp = async (targetPhone?: string) => {
    const phoneToUse = (targetPhone || phone).trim()
    if (!phoneToUse) {
      setErrorMessage('Vui lòng nhập số điện thoại')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await fetch('/api/parent/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToUse })
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Gửi mã OTP thất bại')
      }

      setPhone(phoneToUse)
      setStep('OTP')
      setOtp('123456') // Pre-fill test OTP for seamless demo
      setSuccessMessage(`Đã gửi mã OTP đến số ${phoneToUse}. (Mã test: 123456)`)
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi gửi mã OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (customOtp?: string) => {
    const otpToUse = (customOtp || otp).trim()
    if (!phone || !otpToUse) {
      setErrorMessage('Vui lòng nhập đầy đủ Số điện thoại và Mã OTP')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/parent/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpToUse }),
        credentials: 'include'
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Xác thực OTP thất bại')
      }

      // Save student preference
      if (json.data?.students?.[0]?.id) {
        localStorage.setItem('parent_active_student_id', json.data.students[0].id)
      }

      router.push('/parent')
    } catch (err: any) {
      setErrorMessage(err.message || 'Mã OTP không hợp lệ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickLogin = async (sample: SampleParent) => {
    setPhone(sample.phone)
    setStep('OTP')
    setOtp('123456')
    setSuccessMessage(`Đang đăng nhập bằng tài khoản: ${sample.name}...`)
    setIsLoading(true)

    try {
      const res = await fetch('/api/parent/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: sample.phone, otp: '123456' }),
        credentials: 'include'
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Đăng nhập nhanh thất bại')
      }

      if (json.data?.students?.[0]?.id) {
        localStorage.setItem('parent_active_student_id', json.data.students[0].id)
      }

      router.push('/parent')
    } catch (err: any) {
      setErrorMessage(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full space-y-5 py-4">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto h-16 w-16 rounded-3xl bg-gradient-to-tr from-[#F2994A] via-[#E08E58] to-[#EA580C] text-white flex items-center justify-center shadow-xl shadow-[#F2994A]/30 border-2 border-white/40 mb-3">
          <GraduationCap className="h-9 w-9" />
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <h1 className="font-heading font-black text-2xl text-foreground tracking-tight">EduCenter Parent</h1>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#D97736] border border-[#FCDCC8] dark:bg-[#352114] dark:text-[#FBAA78]">PWA</span>
        </div>
        <p className="text-xs text-muted-foreground font-medium px-4">
          Sổ liên lạc điện tử & Trợ lý AI Orchexa giải đáp mọi thông tin học tập của con
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-card border-2 border-border/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-tight">{successMessage}</span>
          </div>
        )}

        {step === 'PHONE' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendOtp()
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground font-heading flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-primary" />
                Số điện thoại phụ huynh
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ví dụ: 0901234567"
                  className="w-full h-12 px-4 rounded-2xl bg-background border-2 border-border/80 focus:border-primary focus:outline-hidden text-sm font-bold text-foreground transition-all shadow-2xs"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-normal">
                Nhập số điện thoại đã đăng ký với trung tâm để nhận mã xác thực OTP
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#F2994A] to-[#E08E58] hover:from-[#EA580C] hover:to-[#D97736] text-white font-extrabold text-sm shadow-md shadow-[#F2994A]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Tiếp tục</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleVerifyOtp()
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground font-heading flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  Mã xác thực OTP
                </label>
                <button
                  type="button"
                  onClick={() => setStep('PHONE')}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Đổi số điện thoại
                </button>
              </div>

              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã 123456"
                maxLength={6}
                className="w-full h-12 px-4 text-center tracking-[6px] text-lg font-black font-mono rounded-2xl bg-background border-2 border-primary/70 focus:border-primary focus:outline-hidden text-foreground shadow-2xs"
                autoFocus
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Mã OTP test: <strong className="text-foreground">123456</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setOtp('123456')}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Tự điền 123456
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#F2994A] to-[#E08E58] hover:from-[#EA580C] hover:to-[#D97736] text-white font-extrabold text-sm shadow-md shadow-[#F2994A]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Xác nhận & Vào ứng dụng</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Quick Demo Selector */}
      <div className="bg-[#FAF6F0] dark:bg-[#201A16] border-2 border-border/70 rounded-3xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-black font-heading text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[#F2994A]" />
            <span>Tài khoản Phụ huynh mẫu (1-Click Demo)</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-semibold">Chọn để thử ngay</span>
        </div>

        {isFetchingSamples ? (
          <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Đang tải danh sách phụ huynh...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {sampleParents.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleQuickLogin(sample)}
                disabled={isLoading}
                className="w-full p-2.5 rounded-2xl bg-card hover:bg-[#FFF0E6] dark:hover:bg-[#352114] border-1.5 border-border/80 hover:border-[#F2994A]/80 transition-all text-left flex items-center justify-between group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#F2994A]/20 to-[#EA580C]/20 text-[#D97736] dark:text-[#FBAA78] flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                    {sample.name.replace('PH. ', '').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {sample.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Con: <strong className="text-foreground/80">{sample.childrenNames}</strong> • {sample.phone}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-bold px-2 py-1 rounded-xl bg-muted group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                  Đăng nhập
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Switch to Teacher/Admin SIS */}
      <div className="text-center pt-2">
        <Link
          href="/"
          className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <Users className="h-3.5 w-3.5" />
          <span>Chuyển sang Cổng Quản Trị SIS/LMS dành cho Giáo viên</span>
        </Link>
      </div>
    </div>
  )
}
