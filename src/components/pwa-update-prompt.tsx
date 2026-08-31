'use client'

import React from 'react'
import { usePwaUpdate } from '@/hooks/use-pwa-update'
import { RefreshCw, Sparkles, X, ArrowUpCircle } from 'lucide-react'

export function PwaUpdatePrompt() {
  const {
    isUpdateAvailable,
    isUpdating,
    showPrompt,
    setShowPrompt,
    updateNow,
    updateLater
  } = usePwaUpdate()

  return (
    <>
      {/* Floating update badge when user clicked "Update later" but update is still pending */}
      {isUpdateAvailable && !showPrompt && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={() => setShowPrompt(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/25 border border-white/20 hover:opacity-95 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Nhấn để cập nhật phiên bản mới"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Có bản cập nhật mới</span>
          </button>
        </div>
      )}

      {/* Main Update Modal Dialog */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-sm rounded-3xl bg-card border-2 border-border/80 p-5 sm:p-6 shadow-2xl text-card-foreground animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pwa-update-title"
          >
            {/* Close Button */}
            {!isUpdating && (
              <button
                type="button"
                onClick={updateLater}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Đóng</span>
              </button>
            )}

            {/* Icon & Header */}
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#F2994A] to-[#EA580C] text-white flex items-center justify-center shadow-lg shadow-[#F2994A]/30 shrink-0 border border-white/30">
                {isUpdating ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <ArrowUpCircle className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78] text-[10px] font-extrabold uppercase tracking-wider font-heading">
                  <Sparkles className="h-3 w-3" />
                  Bản cập nhật mới
                </div>
                <h3 id="pwa-update-title" className="font-heading font-extrabold text-base sm:text-lg leading-tight text-foreground">
                  Cập nhật ứng dụng
                </h3>
              </div>
            </div>

            {/* Description */}
            <div className="mt-3.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Phiên bản mới đã sẵn sàng với các cải tiến hiệu năng và tính năng mới. Bạn muốn áp dụng bản cập nhật ngay bây giờ không?
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={updateLater}
                disabled={isUpdating}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors cursor-pointer text-center"
              >
                Để sau
              </button>

              <button
                type="button"
                onClick={updateNow}
                disabled={isUpdating}
                className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-tr from-[#F2994A] to-[#EA580C] hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-[#F2994A]/25 disabled:opacity-75 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Cập nhật ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
