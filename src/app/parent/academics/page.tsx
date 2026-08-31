'use client'

import React, { useEffect, useState } from 'react'
import { useParent } from '@/components/parent/parent-provider'
import Link from 'next/link'
import {
  ClipboardCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Calendar,
  Sparkles,
  Loader2,
  Award,
  BookOpen,
  Download,
  Share2,
  ExternalLink,
  TrendingUp,
  Printer
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ParentAcademicsPage() {
  const { parent, selectedStudent, isLoading } = useParent()
  const [data, setData] = useState<any>(null)
  const [isFetchingData, setIsFetchingData] = useState(true)
  const [activeTab, setActiveTab] = useState<'SCORES' | 'ATTENDANCE'>('SCORES')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

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
      .catch((e) => console.error('Failed to fetch academics data:', e))
      .finally(() => setIsFetchingData(false))
  }, [selectedStudent?.id])

  if (isLoading || isFetchingData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-bold font-heading">Đang tải sổ liên lạc của con...</span>
      </div>
    )
  }

  const studentName = selectedStudent?.name || 'Học viên'
  const assignments = data?.assignments || []
  const attendances = data?.attendances || []
  const stats = data?.stats || { attendanceRate: 100, avgScore: '9.0' }

  return (
    <div className="space-y-4">
      {/* Child Academic Header Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FFF0E6] via-[#FAF6F0] to-[#F3EAE0] dark:from-[#2E2015] dark:via-[#201A16] dark:to-[#181310] border-2 border-[#FCDCC8] dark:border-[#3E2D20] shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#F2994A] to-[#EA580C] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#F2994A]/30 border border-white/30 shrink-0">
              {studentName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="font-heading font-black text-base text-foreground truncate">{studentName}</h2>
              <p className="text-[11px] text-muted-foreground font-semibold">
                Mã HV: <strong className="font-mono text-foreground">{selectedStudent?.code}</strong> • {selectedStudent?.facility?.name}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-xs font-black font-mono text-primary">{stats.avgScore}/10</div>
            <div className="text-[9px] text-muted-foreground font-semibold">Điểm trung bình</div>
          </div>
        </div>

        {/* 2 Big Badges */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-2xl bg-card border border-border/80 text-center space-y-0.5 shadow-2xs">
            <div className="text-[10px] text-muted-foreground font-bold">Tỷ lệ chuyên cần</div>
            <div className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
              {stats.attendanceRate}% ({stats.completedLessons || attendances.length} buổi)
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-card border border-border/80 text-center space-y-0.5 shadow-2xs">
            <div className="text-[10px] text-muted-foreground font-bold">Số bài kiểm tra</div>
            <div className="text-sm font-black font-mono text-[#D97736] dark:text-[#FBAA78]">
              {assignments.length} bài đã chấm
            </div>
          </div>
        </div>

        {/* Export Report Action Banner */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
          <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span>Báo cáo học tập chính thức</span>
          </div>
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-extrabold flex items-center gap-1.5 shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Xuất báo cáo (Preview)</span>
          </button>
        </div>
      </div>

      {/* Export Report Choice Dialog */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2 font-heading">
              <FileText className="h-5 w-5 text-primary" /> Xuất Báo Cáo Học Tập ({selectedStudent?.name})
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Chọn 1 trong 2 loại báo cáo học vụ để tạo bản xem trước (Preview Link) và in/lưu PDF:
            </p>

            {/* Option 1: Academic Results */}
            <Link
              href={`/reports/preview/${selectedStudent?.code}?type=academic`}
              target="_blank"
              onClick={() => setIsReportModalOpen(false)}
              className="p-4 rounded-2xl bg-card border-2 border-border/80 hover:border-primary/60 hover:bg-muted/40 transition-all flex items-start gap-3.5 group cursor-pointer block"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <Award className="h-5 w-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-extrabold text-xs text-foreground font-heading flex items-center justify-between">
                  <span>1. Báo cáo Kết quả Học tập</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Bao gồm bảng điểm chi tiết, điểm TB, tỷ lệ đạt chuẩn, nhận xét từng bài kiểm tra và phân tích điểm mạnh.
                </p>
              </div>
            </Link>

            {/* Option 2: Progress Overview */}
            <Link
              href={`/reports/preview/${selectedStudent?.code}?type=overview`}
              target="_blank"
              onClick={() => setIsReportModalOpen(false)}
              className="p-4 rounded-2xl bg-card border-2 border-border/80 hover:border-emerald-500/60 hover:bg-muted/40 transition-all flex items-start gap-3.5 group cursor-pointer block"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-extrabold text-xs text-foreground font-heading flex items-center justify-between">
                  <span>2. Báo cáo Tổng quan Quá trình & Tình hình</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Bao gồm tiến độ khóa học, lịch sử chuyên cần, tỷ lệ nộp bài tập, đánh giá mức độ an toàn học vụ và kế hoạch hỗ trợ.
                </p>
              </div>
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      {/* Segmented Controls (Tab Switcher) */}
      <div className="p-1 rounded-2xl bg-muted/60 border border-border/70 grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('SCORES')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'SCORES'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="h-3.5 w-3.5 text-primary" />
          <span>Bảng điểm & Bài tập ({assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ATTENDANCE')}
          className={`py-2 px-3 rounded-xl text-xs font-extrabold font-heading transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'ATTENDANCE'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Điểm danh ({attendances.length})</span>
        </button>
      </div>

      {/* Tab 2.1: Scores & Assignments */}
      {activeTab === 'SCORES' && (
        <div className="space-y-3">
          {assignments.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-3xl border border-border/70 text-muted-foreground space-y-2">
              <Award className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs font-medium">Chưa có bài kiểm tra hoặc điểm số nào được ghi nhận.</p>
            </div>
          ) : (
            assignments.map((asg: any) => {
              const scoreNum = Number(asg.score)
              const maxNum = Number(asg.maxScore || 10)
              const isHigh = scoreNum >= 8

              return (
                <div
                  key={asg.id}
                  className="p-4 rounded-3xl bg-card border-1.5 border-border/80 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-bold text-foreground font-heading truncate">
                        {asg.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(asg.date).toLocaleDateString('vi-VN')}</span>
                        <span>•</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-muted font-bold text-[9px]">
                          {asg.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang xử lý'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base font-black font-mono ${isHigh ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`}>
                        {asg.score !== null ? asg.score : '--'}
                        <span className="text-xs font-bold text-muted-foreground font-sans">/{maxNum}</span>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Feedback */}
                  {asg.teacherNote && (
                    <div className="p-2.5 rounded-2xl bg-[#FAF6F0] dark:bg-[#251F1A] border border-border/60 text-[11px] text-foreground/90 space-y-1">
                      <div className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground font-heading flex items-center gap-1">
                        <FileText className="h-3 w-3 text-primary" />
                        <span>Nhận xét của giáo viên:</span>
                      </div>
                      <p className="italic text-foreground/80 leading-relaxed">
                        "{asg.teacherNote}"
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab 2.2: Attendance Timeline */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-3">
          {attendances.length === 0 ? (
            <div className="p-8 text-center bg-card rounded-3xl border border-border/70 text-muted-foreground space-y-2">
              <UserCheck className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-xs font-medium">Chưa có lịch sử điểm danh nào được ghi nhận.</p>
            </div>
          ) : (
            attendances.map((att: any) => {
              const statusConfig = {
                PRESENT: { label: 'Có mặt', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
                LATE: { label: 'Đi muộn', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800', icon: Clock },
                ABSENT: { label: 'Vắng mặt', color: 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800', icon: XCircle },
                EXCUSED: { label: 'Có phép', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800', icon: CheckCircle2 }
              }[att.status as string] || { label: att.status, color: 'bg-muted text-foreground', icon: CheckCircle2 }

              const StatusIcon = statusConfig.icon

              return (
                <div
                  key={att.id}
                  className="p-3.5 rounded-3xl bg-card border-1.5 border-border/80 shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs font-bold text-foreground font-heading">
                      {att.schedule?.class?.name || 'Buổi học'} ({att.schedule?.class?.course?.name})
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(att.schedule?.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                      {att.schedule?.room?.name && (
                        <>
                          <span>•</span>
                          <span>Phòng {att.schedule.room.name}</span>
                        </>
                      )}
                    </div>
                    {att.note && (
                      <p className="text-[11px] text-muted-foreground italic pt-0.5">
                        Ghi chú: {att.note}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      <span>{statusConfig.label}</span>
                    </span>

                    {att.status === 'ABSENT' && (
                      <Link
                        href="/parent/tuition-requests"
                        className="text-[9px] font-bold text-primary hover:underline"
                      >
                        Đăng ký học bù
                      </Link>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Ask AI Agent Assistance */}
      <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className="text-[11px] text-muted-foreground font-medium truncate">
            Cần giải thích chi tiết về điểm số hoặc nhận xét?
          </span>
        </div>
        <Link
          href="/parent"
          className="px-2.5 py-1 rounded-xl bg-primary text-white text-[10px] font-extrabold shrink-0 hover:opacity-90 transition-opacity"
        >
          Hỏi AI
        </Link>
      </div>
    </div>
  )
}
