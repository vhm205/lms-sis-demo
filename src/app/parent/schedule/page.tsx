'use client'

import React, { useEffect, useState } from 'react'
import { useParent } from '@/components/parent/parent-provider'
import Link from 'next/link'
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Sparkles,
  Loader2,
  CalendarCheck,
  AlertCircle,
  ChevronRight,
  Send
} from 'lucide-react'

export default function ParentSchedulePage() {
  const { parent, selectedStudent, isLoading } = useParent()
  const [data, setData] = useState<any>(null)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [activeFilter, setActiveFilter] = useState<'UPCOMING' | 'ALL'>('UPCOMING')

  useEffect(() => {
    if (!selectedStudent?.id) return

    setIsFetchingData(true)
    fetch(`/api/parent/data?studentId=${selectedStudent.id}`, {
      credentials: 'include'
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setData(res.data)
        }
      })
      .catch((e) => console.error('Failed to fetch schedule data:', e))
      .finally(() => setIsFetchingData(false))
  }, [selectedStudent?.id])

  if (isLoading || isFetchingData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-bold font-heading">Đang tải lịch học của con...</span>
      </div>
    )
  }

  const studentName = selectedStudent?.name || 'Học viên'
  const allSchedules = data?.schedules || []
  const now = new Date()

  const schedules = allSchedules.filter((sch: any) => {
    if (activeFilter === 'UPCOMING') {
      return new Date(sch.date) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FFF0E6] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2C1E14] dark:via-[#201A16] dark:to-[#0F2832] border-2 border-[#FCDCC8] dark:border-[#3D2C20] shadow-xs flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-extrabold font-heading text-foreground">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>Thời khóa biểu của {studentName.split(' ').pop()}</span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium truncate">
            {selectedStudent?.classes?.[0]?.name || 'Lớp đang học'} • {selectedStudent?.facility?.name}
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center bg-card border border-border/80 rounded-2xl p-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter('UPCOMING')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
              activeFilter === 'UPCOMING'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sắp tới
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-primary text-white shadow-2xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        {schedules.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-3xl border border-border/70 text-muted-foreground space-y-2">
            <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-xs font-medium">Hiện không có lịch học nào trong danh sách.</p>
          </div>
        ) : (
          schedules.map((sch: any) => {
            const schDate = new Date(sch.date)
            const isToday = schDate.toDateString() === now.toDateString()
            const isFuture = schDate > now

            return (
              <div
                key={sch.id}
                className={`p-4 rounded-3xl bg-card border-1.5 shadow-xs space-y-3 transition-all ${
                  isToday
                    ? 'border-primary ring-2 ring-primary/20 bg-gradient-to-br from-card to-[#FFF0E6]/30'
                    : 'border-border/80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isToday && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                          Hôm nay
                        </span>
                      )}
                      <span className="text-xs font-black font-heading text-foreground truncate">
                        {sch.class?.course?.name || 'Khóa học'}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground font-semibold">
                      Lớp: <strong className="text-foreground">{sch.class?.name}</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-black font-mono text-foreground">
                      {schDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium">
                      ({sch.duration || 90} phút)
                    </div>
                  </div>
                </div>

                {/* Details Pills */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <CalendarCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="font-bold text-foreground/90">
                      {schDate.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                    <span className="truncate">{sch.room?.name ? `Phòng ${sch.room.name}` : 'Cơ sở'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 truncate col-span-2">
                    <User className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">GV: {sch.class?.teacher?.name || 'Giảng viên chuyên môn'}</span>
                  </div>
                </div>

                {/* Bottom Action for Schedule */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    Trạng thái: <strong className="text-emerald-600 dark:text-emerald-400">Đã xếp lịch</strong>
                  </span>

                  <Link
                    href={`/parent/tuition-requests?type=LEAVE&date=${encodeURIComponent(schDate.toISOString())}`}
                    className="px-2.5 py-1 rounded-xl bg-muted hover:bg-[#FFF0E6] text-muted-foreground hover:text-[#D97736] text-[10px] font-bold transition-colors"
                  >
                    Xin nghỉ buổi này
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Voice Agent CTA */}
      <div className="p-3 rounded-2xl bg-[#FFF0E6] dark:bg-[#2C1E14] border border-[#FCDCC8] dark:border-[#3E2D20] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="text-[11px] text-[#D97736] dark:text-[#FBAA78] font-bold truncate">
            Muốn đổi ca hoặc chuyển lịch nhanh?
          </span>
        </div>
        <Link
          href="/parent"
          className="px-2.5 py-1 rounded-xl bg-[#F2994A] text-white text-[10px] font-extrabold shrink-0 hover:opacity-90 transition-opacity"
        >
          Nhờ AI hỗ trợ
        </Link>
      </div>
    </div>
  )
}
