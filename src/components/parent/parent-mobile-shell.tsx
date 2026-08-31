'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useParent } from './parent-provider'
import {
  Sparkles,
  ClipboardCheck,
  CalendarDays,
  Receipt,
  User,
  LogOut,
  ChevronDown,
  GraduationCap,
  Download,
  X,
  Check,
  ArrowRightLeft
} from 'lucide-react'

export function ParentMobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { parent, students, selectedStudent, setSelectedStudentId, logout, isLoading } = useParent()
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  const isLoginPage = pathname?.includes('/parent/login')

  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  // Capture PWA install prompt & iOS detection
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isIosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent)
    const isInStandaloneMode = ('standalone' in window.navigator && (window.navigator as any).standalone) || window.matchMedia('(display-mode: standalone)').matches

    setIsIos(isIosDevice)
    setIsStandalone(isInStandaloneMode)

    if (isIosDevice && !isInStandaloneMode) {
      // Check if user dismissed it in this session
      const dismissed = sessionStorage.getItem('ios_pwa_banner_dismissed')
      if (!dismissed) {
        setShowInstallBanner(true)
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (isIos) {
      alert('📱 Hướng dẫn cài trên iPhone:\n1. Nhấn nút Chia sẻ (biểu tượng hình vuông có mũi tên trỏ lên ⎋ ở thanh dưới Safari).\n2. Cuộn xuống chọn "Thêm vào Màn hình chính" (Add to Home Screen ⊞).\n3. Nhấn "Thêm" ở góc trên bên phải.')
      return
    }
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallBanner(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismissBanner = () => {
    setShowInstallBanner(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ios_pwa_banner_dismissed', '1')
    }
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#1E1915] text-foreground flex flex-col justify-center items-center p-4 selection:bg-primary/20 selection:text-primary">
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </div>
    )
  }

  const navTabs = [
    {
      name: 'AI Trợ lý',
      href: '/parent',
      icon: Sparkles,
      isAi: true
    },
    {
      name: 'Sổ liên lạc',
      href: '/parent/academics',
      icon: ClipboardCheck
    },
    {
      name: 'Lịch học',
      href: '/parent/schedule',
      icon: CalendarDays
    },
    {
      name: 'Học phí & Góp ý',
      href: '/parent/tuition-requests',
      icon: Receipt
    }
  ]

  return (
    <div className="min-h-screen bg-[#F4EDE4] dark:bg-[#15110E] flex flex-col justify-between items-center selection:bg-primary/20 selection:text-primary">
      {/* Mobile Shell Wrapper (Constrained to max-w-md on desktop for realistic mobile app preview) */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#FAF6F0] dark:bg-[#201A16] shadow-2xl relative border-x border-border/40 pb-20">
        
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#FAF6F0]/95 dark:bg-[#201A16]/95 backdrop-blur-md border-b border-border/60 px-4 py-2.5 flex items-center justify-between gap-2 shadow-xs">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-[#F2994A] to-[#EA580C] text-white flex items-center justify-center shadow-md shadow-[#F2994A]/30 border border-white/30 shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-sm text-foreground tracking-tight leading-none">EduCenter</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#D97736] border border-[#FCDCC8] dark:bg-[#352114] dark:text-[#FBAA78]">PARENT</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold mt-0.5 truncate">
                {parent ? `PH. ${parent.name}` : 'Sổ liên lạc & AI'}
              </span>
            </div>
          </div>

          {/* Child Switcher & Profile Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Child Switcher Pill */}
            {selectedStudent && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsChildSelectorOpen(!isChildSelectorOpen)
                    setIsProfileMenuOpen(false)
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card border-1.5 border-border/80 hover:border-primary text-xs font-bold text-foreground shadow-2xs hover:bg-[#FFF0E6]/50 transition-all cursor-pointer"
                  title="Chuyển đổi hồ sơ học sinh"
                >
                  <div className="h-4.5 w-4.5 rounded-full bg-gradient-to-tr from-[#F2994A] to-[#E08E58] text-white text-[10px] font-bold flex items-center justify-center">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <span className="max-w-[70px] truncate">{selectedStudent.name.split(' ').pop()}</span>
                  {students.length > 1 && (
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${isChildSelectorOpen ? 'rotate-180 text-primary' : ''}`} />
                  )}
                </button>

                {/* Child Switcher Dropdown */}
                {isChildSelectorOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border-2 border-border/80 bg-popover p-2 text-popover-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80 font-heading">
                      Chọn hồ sơ của con ({students.length})
                    </div>
                    {students.map((student) => {
                      const isSelected = selectedStudent?.id === student.id
                      return (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudentId(student.id)
                            setIsChildSelectorOpen(false)
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                            isSelected
                              ? 'bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78]'
                              : 'hover:bg-muted/60 text-foreground'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-7 w-7 rounded-xl bg-muted text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {student.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-heading">{student.name}</div>
                              <div className="text-[10px] text-muted-foreground font-normal truncate">
                                {student.code} • {student.classes?.[0]?.course?.name || 'Đang học'}
                              </div>
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-[#D97736] shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Profile / Logout Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen)
                  setIsChildSelectorOpen(false)
                }}
                className="h-8 w-8 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center border border-border/60 transition-colors"
                title="Tài khoản & Đăng xuất"
              >
                <User className="h-4 w-4" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border-2 border-border/80 bg-popover p-2 text-popover-foreground shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-2 border-b border-border/50">
                    <div className="text-xs font-bold text-foreground truncate">{parent?.name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{parent?.phone}</div>
                  </div>

                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-primary" />
                    <span>Sang Cổng Quản Trị</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      logout()
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="mx-3 mt-2 p-2.5 rounded-2xl bg-gradient-to-r from-[#FFF0E6] to-[#E6F8FB] dark:from-[#2A1E16] dark:to-[#10242E] border border-[#FCDCC8] dark:border-[#38261A] flex items-center justify-between gap-2 shadow-xs animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2 min-w-0">
              <Download className="h-4 w-4 text-primary shrink-0" />
              <div className="text-[11px] font-semibold text-foreground truncate leading-tight">
                Cài ứng dụng EduCenter vào màn hình chính
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-2.5 py-1 rounded-xl bg-primary text-white text-[10px] font-extrabold shadow-2xs hover:opacity-90"
              >
                Cài đặt
              </button>
              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col p-3 sm:p-4 overflow-y-auto">
          {children}
        </main>

        {/* Fixed Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF6F0]/95 dark:bg-[#201A16]/95 backdrop-blur-lg border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-md mx-auto flex items-center justify-around px-2 py-1.5">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href
              const Icon = tab.icon

              if (tab.isAi) {
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className="flex flex-col items-center justify-center -mt-4 group relative"
                  >
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-tr from-[#F2994A] via-[#E08E58] to-[#EA580C] text-white scale-110 shadow-[#F2994A]/40 ring-4 ring-[#FAF6F0] dark:ring-[#201A16]'
                        : 'bg-white dark:bg-[#2B231D] text-[#E08E58] hover:scale-105 border-2 border-[#FCDCC8] dark:border-[#423124]'
                    }`}>
                      <Icon className="h-6 w-6 animate-pulse" />
                    </div>
                    <span className={`text-[10px] font-extrabold mt-1 tracking-tight ${
                      isActive ? 'text-primary font-black' : 'text-muted-foreground'
                    }`}>
                      {tab.name}
                    </span>
                  </Link>
                )
              }

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-150 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-0.5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'font-extrabold text-primary' : 'text-muted-foreground'}`}>
                    {tab.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>

      </div>
    </div>
  )
}
