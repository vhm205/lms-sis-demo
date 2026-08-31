'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParent } from '@/components/parent/parent-provider'
import { OrchexaParentWidget } from '@/components/parent/OrchexaParentWidget'
import {
  Sparkles,
  ClipboardCheck,
  CalendarDays,
  Receipt,
  BookOpen,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  UserCheck,
  Loader2
} from 'lucide-react'

export default function ParentHomePage() {
  const { parent, selectedStudent, isLoading } = useParent()
  const [data, setData] = useState<any>(null)
  const [isFetchingData, setIsFetchingData] = useState(false)

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
      .catch((e) => console.error('Failed to load parent data:', e))
      .finally(() => setIsFetchingData(false))
  }, [selectedStudent?.id])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-bold font-heading">Đang tải hồ sơ phụ huynh...</span>
      </div>
    )
  }

  const studentName = selectedStudent?.name || 'Học viên'
  const currentClass = selectedStudent?.classes?.[0]

  return (
    <div className="space-y-4">
      {/* Tab 1 Main: Orchexa Live Agent */}
      <OrchexaParentWidget />

      {/* Quick Summary Cards of Active Child */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-extrabold text-foreground uppercase tracking-wider font-heading flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Tình hình học tập của {studentName.split(' ').pop()}</span>
          </div>
          <Link
            href="/parent/academics"
            className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
          >
            <span>Chi tiết</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* 3 Metric Mini Cards */}
        <div className="grid grid-cols-3 gap-2">
          {/* Attendance Rate */}
          <div className="p-3 rounded-2xl bg-card border-1.5 border-border/80 shadow-2xs space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
              <UserCheck className="h-3 w-3 text-emerald-500" />
              <span>Chuyên cần</span>
            </div>
            <div className="text-base font-black font-mono text-foreground">
              {data?.stats?.attendanceRate ?? 100}%
            </div>
            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
              {data?.stats?.completedLessons ?? 0} buổi học
            </div>
          </div>

          {/* Average Score */}
          <div className="p-3 rounded-2xl bg-card border-1.5 border-border/80 shadow-2xs space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
              <CheckCircle2 className="h-3 w-3 text-[#F2994A]" />
              <span>Điểm TB</span>
            </div>
            <div className="text-base font-black font-mono text-[#D97736] dark:text-[#FBAA78]">
              {data?.stats?.avgScore ?? '9.0'}/10
            </div>
            <div className="text-[9px] text-muted-foreground font-semibold truncate">
              Xếp loại Giỏi
            </div>
          </div>

          {/* Class Count */}
          <div className="p-3 rounded-2xl bg-card border-1.5 border-border/80 shadow-2xs space-y-1">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
              <BookOpen className="h-3 w-3 text-sky-500" />
              <span>Lớp đang học</span>
            </div>
            <div className="text-base font-black font-mono text-foreground">
              {selectedStudent?.classes?.length ?? 1}
            </div>
            <div className="text-[9px] text-muted-foreground font-semibold truncate">
              {selectedStudent?.facility?.name || 'Cơ sở HN'}
            </div>
          </div>
        </div>

        {/* Current Enrolled Class Card */}
        {currentClass && (
          <div className="p-3.5 rounded-2xl bg-card border-1.5 border-border/80 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#F2994A]/20 to-[#EA580C]/20 text-[#D97736] dark:text-[#FBAA78] flex items-center justify-center font-bold shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground truncate font-heading">
                  {currentClass.course.name}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  Lớp: <strong className="text-foreground/90">{currentClass.name}</strong> • GV: {currentClass.teacher?.name || 'Phụ trách chuyên môn'}
                </div>
              </div>
            </div>
            <Link
              href="/parent/schedule"
              className="px-3 py-1.5 rounded-xl bg-muted hover:bg-primary hover:text-white text-foreground text-[11px] font-bold transition-colors shrink-0"
            >
              Lịch học
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
