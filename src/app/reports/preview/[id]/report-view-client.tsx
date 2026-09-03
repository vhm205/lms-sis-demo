"use client";

import React, { useState, useEffect } from "react";
import { GeneratedStudentReport, ReportType } from "@/lib/report-generator";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Layers,
  Printer,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  AlertTriangle,
  Building2,
  GraduationCap,
  Phone,
  ArrowLeft,
  Check,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ReportViewClientProps {
  initialReport: GeneratedStudentReport;
  autoPrint?: boolean;
}

export function ReportViewClient({ initialReport, autoPrint }: ReportViewClientProps) {
  const [report, setReport] = useState<GeneratedStudentReport>(initialReport);
  const [activeType, setActiveType] = useState<ReportType>(initialReport.type);
  const [isLoadingType, setIsLoadingType] = useState(false);
  const [copied, setCopied] = useState(false);

  // Trigger auto print if query param print=true was passed
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  // Handle switching report type
  async function handleSwitchType(newType: ReportType) {
    if (newType === activeType) return;
    setActiveType(newType);
    setIsLoadingType(true);
    try {
      const res = await fetch(`/api/students/reports/generate?studentId=${report.student.code}&type=${newType}`);
      const json = await res.json();
      if (json.success) {
        // Reconstruct full report object format
        const updatedReport: GeneratedStudentReport = {
          id: json.reportId,
          type: json.type,
          typeName: json.typeName,
          title: json.title,
          generatedAt: json.generatedAt,
          validUntil: initialReport.validUntil,
          student: json.student,
          academic: json.type === "ACADEMIC_RESULTS" ? json.data : undefined,
          progress: json.type === "PROGRESS_OVERVIEW" ? json.data : undefined,
          summaryText: json.summaryText,
          shortHighlights: json.shortHighlights,
          previewUrl: json.previewUrl,
          pdfUrl: json.pdfUrl,
        };
        setReport(updatedReport);
      }
    } catch (e) {
      console.error("Failed to switch report type:", e);
    } finally {
      setIsLoadingType(false);
    }
  }

  function handleCopyLink() {
    const url = typeof window !== "undefined" ? window.location.href : report.previewUrl;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handlePrint() {
    window.print();
  }

  const isAcademic = report.type === "ACADEMIC_RESULTS";
  const academic = report.academic;
  const progress = report.progress;
  const student = report.student;

  const formattedDate = new Date(report.generatedAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#120F0D] text-foreground font-sans print:bg-white print:text-black">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/80 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/parent/academics"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded-xl bg-muted/60 hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Sổ liên lạc</span>
            </Link>
            <div className="hidden sm:block h-5 w-[1px] bg-border" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-foreground font-heading">{student.name}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                {student.code}
              </span>
            </div>
          </div>

          {/* Report Type Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-muted/70 border border-border/70 text-xs">
            <button
              type="button"
              onClick={() => handleSwitchType("ACADEMIC_RESULTS")}
              className={`px-3 py-1.5 rounded-xl font-bold font-heading transition-all cursor-pointer flex items-center gap-1.5 ${
                activeType === "ACADEMIC_RESULTS"
                  ? "bg-card text-foreground shadow-xs text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Kết quả học tập</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchType("PROGRESS_OVERVIEW")}
              className={`px-3 py-1.5 rounded-xl font-bold font-heading transition-all cursor-pointer flex items-center gap-1.5 ${
                activeType === "PROGRESS_OVERVIEW"
                  ? "bg-card text-foreground shadow-xs text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Tổng quan quá trình</span>
            </button>
          </div>

          {/* Action Buttons: Copy link, Print/PDF */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-card border border-border hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5 text-muted-foreground" />}
              <span>{copied ? "Đã sao chép link" : "Chia sẻ link"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-primary text-white hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>In / Lưu PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Printable Document Canvas */}
      <div className="max-w-5xl mx-auto px-4 py-8 print:p-0 print:max-w-none">
        <div className="bg-card print:bg-white border-2 border-border/80 print:border-none rounded-3xl print:rounded-none shadow-xl print:shadow-none p-6 sm:p-10 space-y-8 relative overflow-hidden">
          
          {/* Subtle Background Watermark on Print/Screen */}
          <div className="absolute right-4 top-4 opacity-5 dark:opacity-10 pointer-events-none select-none text-[120px] font-black font-heading leading-none text-primary">
            EDUCENTER
          </div>

          {/* 1. Official Header & Institute Branding */}
          <div className="border-b-2 border-border/80 pb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-primary text-white flex items-center justify-center font-black text-base shadow-sm">
                    E
                  </div>
                  <div>
                    <h1 className="text-lg font-black tracking-tight font-heading text-foreground">
                      EDUCENTER SIS • HỆ THỐNG GIÁO DỤC
                    </h1>
                    <p className="text-[11px] text-muted-foreground font-semibold">
                      EduCenter International Academic Management System
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-0.5 text-xs text-muted-foreground">
                <div className="font-bold text-foreground flex items-center sm:justify-end gap-1">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  <span>{student.facility.name}</span>
                </div>
                <p className="text-[11px]">{student.facility.address}</p>
                <p className="text-[11px] font-mono">Hotline: 1900 8888 • Email: academic@educenter.vn</p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="pt-4 text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Bản Báo Cáo Học Vụ Chính Thức</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-foreground tracking-tight uppercase">
                {isAcademic ? "BÁO CÁO KẾT QUẢ HỌC TẬP HỌC VIÊN" : "BÁO CÁO TỔNG QUAN QUÁ TRÌNH HỌC TẬP"}
              </h2>
              <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground font-medium">
                <span>Mã báo cáo: <strong className="font-mono text-foreground">{report.id}</strong></span>
                <span>•</span>
                <span>Ngày lập: <strong className="text-foreground">{formattedDate}</strong></span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Đã xác thực</span>
              </div>
            </div>
          </div>

          {/* 2. Student & Parent Profile Information Grid */}
          <div className="p-5 rounded-2xl bg-muted/40 border-2 border-border/70 space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground font-heading flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Thông tin học viên & Phụ huynh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px] font-medium">Họ và tên học viên:</span>
                <div className="font-black text-sm text-foreground font-heading">{student.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  Mã học viên: <strong className="font-mono text-primary">{student.code}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px] font-medium">Lớp đang theo học:</span>
                <div className="font-bold text-foreground">
                  {student.classes.length > 0
                    ? student.classes.map((c) => c.name).join(", ")
                    : "Chưa xếp lớp"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Giáo viên phụ trách:{" "}
                  <strong>
                    {student.classes.map((c) => c.teacherName).filter(Boolean).join(", ") || "Hội đồng học vụ"}
                  </strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px] font-medium">Phụ huynh đại diện:</span>
                <div className="font-bold text-foreground">
                  {student.parent?.name || "Chưa cập nhật"}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  SĐT: <strong>{student.parent?.phone || "Chưa cập nhật"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. TYPE 1 CONTENT: ACADEMIC RESULTS */}
          {isAcademic && academic && (
            <div className="space-y-7">
              {/* Summary Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-[#FFF0E6] dark:bg-[#2A1D15] border border-[#FCDCC8] dark:border-[#4A3222] text-center space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Điểm trung bình</div>
                  <div className="text-2xl font-black font-mono text-primary">{academic.averageScore}/10</div>
                  <div className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-primary text-white">
                    XẾP LOẠI: {academic.performanceTier}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Số bài kiểm tra</div>
                  <div className="text-2xl font-black font-mono text-foreground">
                    {academic.completedAssignments}/{academic.totalAssignments}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">Đã hoàn thành & chấm điểm</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Điểm cao nhất / Thấp nhất</div>
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {academic.highestScore} <span className="text-xs text-muted-foreground font-normal">/ {academic.lowestScore}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">Thang điểm 10.0</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Tỷ lệ đạt chuẩn</div>
                  <div className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">{academic.passRate}%</div>
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {academic.distinctionRate}% bài đạt điểm Giỏi
                  </div>
                </div>
              </div>

              {/* Trend Callout */}
              <div className="p-3.5 rounded-2xl bg-muted/50 border border-border/80 flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-primary shrink-0" />
                <div className="text-xs font-semibold text-foreground">
                  <strong>Xu hướng học tập:</strong> {academic.scoreTrendLabel}
                </div>
              </div>

              {/* Detailed Gradebook Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold font-heading text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Chi tiết điểm số các bài kiểm tra & bài tập</span>
                  </h3>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {academic.assignments.length} đầu điểm đã ghi nhận
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border-2 border-border/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/60 border-b border-border/80 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3.5 w-12 text-center">STT</th>
                        <th className="py-3 px-3.5">Nội dung bài kiểm tra / Bài tập</th>
                        <th className="py-3 px-3.5 w-28">Ngày làm bài</th>
                        <th className="py-3 px-3.5 w-24 text-center">Điểm số</th>
                        <th className="py-3 px-3.5 w-28 text-center">Tỷ lệ đạt</th>
                        <th className="py-3 px-3.5">Nhận xét chi tiết của giáo viên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {academic.assignments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground italic">
                            Chưa có dữ liệu bài tập/bài kiểm tra cho học viên này.
                          </td>
                        </tr>
                      ) : (
                        academic.assignments.map((asg, idx) => {
                          const isHigh = asg.score !== null && asg.score >= 8;
                          return (
                            <tr key={asg.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-3.5 text-center font-mono text-muted-foreground font-bold">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3.5 font-bold text-foreground font-heading">
                                {asg.title}
                              </td>
                              <td className="py-3 px-3.5 text-muted-foreground">
                                {new Date(asg.date).toLocaleDateString("vi-VN")}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                {asg.score !== null ? (
                                  <span className={`font-mono font-black text-sm ${isHigh ? "text-emerald-600 dark:text-emerald-400" : "text-primary"}`}>
                                    {asg.score}
                                    <span className="text-[10px] text-muted-foreground font-normal">/{asg.maxScore}</span>
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground italic">Chưa chấm</span>
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                {asg.percentage !== null ? (
                                  <span className="inline-block px-2 py-0.5 rounded-md font-mono font-bold text-[11px] bg-muted">
                                    {asg.percentage}%
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className="py-3 px-3.5 text-foreground/90 italic whitespace-normal break-words max-w-sm">
                                {asg.teacherNote ? `"${asg.teacherNote}"` : <span className="text-muted-foreground not-italic">-</span>}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strengths & Improvement Areas Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 font-heading flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Điểm mạnh nổi bật</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                    {academic.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
                  <div className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 font-heading flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <span>Nội dung cần lưu ý & Củng cố</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200 font-medium">
                    {academic.areasForImprovement.map((area, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Teacher Synthesis Callout */}
              <div className="p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#251F1A] border-2 border-border/80 space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground font-heading flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Nhận xét tổng hợp từ Giáo viên & Hội đồng Học vụ</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed italic">
                  "{academic.teacherSynthesis}"
                </p>
              </div>

              {/* Next Goals */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-foreground font-heading flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Mục tiêu học tập giai đoạn tiếp theo</span>
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground font-medium">
                  {academic.nextGoals.map((g, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span className="text-foreground">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 4. TYPE 2 CONTENT: PROGRESS OVERVIEW */}
          {!isAcademic && progress && (
            <div className="space-y-7">
              {/* Summary Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Tỷ lệ chuyên cần</div>
                  <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    {progress.attendanceRate}%
                  </div>
                  <div className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                    ĐÁNH GIÁ: {progress.attendanceTier}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Tiến độ khóa học</div>
                  <div className="text-2xl font-black font-mono text-primary">
                    {progress.progressPercentage}%
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">
                    {progress.completedSessions}/{progress.totalSessions} buổi học
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Chỉ số điểm danh</div>
                  <div className="text-xs font-bold text-foreground space-y-0.5 pt-1">
                    <div>Có mặt: <span className="font-mono text-emerald-600 font-black">{progress.presentCount}</span></div>
                    <div>Đi muộn: <span className="font-mono text-amber-600 font-black">{progress.lateCount}</span> | Vắng: <span className="font-mono text-rose-600 font-black">{progress.absentCount + progress.excusedCount}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 text-center space-y-1">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase">Mức độ an toàn học vụ</div>
                  <div className={`text-sm font-black font-heading uppercase pt-1 ${
                    progress.riskLevel === "LOW" ? "text-emerald-600" : progress.riskLevel === "MEDIUM" ? "text-amber-600" : "text-rose-600"
                  }`}>
                    {progress.riskLevel === "LOW" ? "ỔN ĐỊNH (LOW RISK)" : progress.riskLevel === "MEDIUM" ? "CẦN CHÚ Ý" : "CẦN HỖ TRỢ GẤP"}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-medium">
                    Tỷ lệ nộp bài: {progress.submissionRate}%
                  </div>
                </div>
              </div>

              {/* Progress Summary Callout */}
              <div className="p-5 rounded-2xl bg-[#FAF6F0] dark:bg-[#251F1A] border-2 border-border/80 space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground font-heading flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>Tóm tắt tình hình học tập & Quá trình rèn luyện</span>
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {progress.overallStatusSummary}
                </p>
              </div>

              {/* Attendance Breakdown & History Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold font-heading text-foreground uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-emerald-600" />
                    <span>Lịch sử điểm danh các buổi học gần đây</span>
                  </h3>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {progress.recentAttendances.length} buổi gần nhất
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border-2 border-border/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/60 border-b border-border/80 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-3.5 w-12 text-center">STT</th>
                        <th className="py-3 px-3.5">Lớp học / Khóa học</th>
                        <th className="py-3 px-3.5 w-28">Thời gian</th>
                        <th className="py-3 px-3.5 w-24">Phòng học</th>
                        <th className="py-3 px-3.5 w-28 text-center">Trạng thái</th>
                        <th className="py-3 px-3.5">Ghi chú buổi học</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {progress.recentAttendances.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-muted-foreground italic">
                            Chưa có dữ liệu điểm danh.
                          </td>
                        </tr>
                      ) : (
                        progress.recentAttendances.map((att, idx) => {
                          const statusBadge = {
                            PRESENT: { label: "Có mặt", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                            LATE: { label: "Đi muộn", color: "bg-amber-50 text-amber-700 border-amber-200" },
                            ABSENT: { label: "Vắng mặt", color: "bg-red-50 text-red-700 border-red-200" },
                            EXCUSED: { label: "Có phép", color: "bg-sky-50 text-sky-700 border-sky-200" },
                            ABSENT_EXCUSED: { label: "Có phép", color: "bg-sky-50 text-sky-700 border-sky-200" },
                            ABSENT_UNEXCUSED: { label: "Vắng không phép", color: "bg-red-50 text-red-700 border-red-200" },
                            UNMARKED: { label: "Chưa điểm danh", color: "bg-muted text-foreground" },
                          }[att.status] || { label: "Chưa điểm danh", color: "bg-muted text-foreground" };

                          return (
                            <tr key={att.id} className="hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-3.5 text-center font-mono text-muted-foreground font-bold">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3.5">
                                <div className="font-bold text-foreground font-heading">{att.className}</div>
                                <div className="text-[11px] text-muted-foreground">{att.courseName}</div>
                              </td>
                              <td className="py-3 px-3.5 text-muted-foreground">
                                {new Date(att.date).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" })}
                              </td>
                              <td className="py-3 px-3.5 text-muted-foreground font-mono">
                                {att.roomName ? `P.${att.roomName}` : "-"}
                              </td>
                              <td className="py-3 px-3.5 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                                  {statusBadge.label}
                                </span>
                              </td>
                              <td className="py-3 px-3.5 text-foreground/80 italic">
                                {att.note ? att.note : <span className="text-muted-foreground not-italic">-</span>}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Risk & Intervention Playbook Card */}
              <div className="p-5 rounded-2xl bg-muted/40 border-2 border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-foreground font-heading flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Đánh giá rủi ro & Kế hoạch đồng hành (Student Success Plan)</span>
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground">
                    Theo quy chuẩn CSKH & Quản lý Học vụ
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {progress.riskAssessment.signals.length > 0 ? (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
                      <div className="font-bold mb-1">Tín hiệu cần lưu ý:</div>
                      <ul className="list-disc list-inside space-y-0.5">
                        {progress.riskAssessment.signals.map((sig, i) => (
                          <li key={i}>{sig}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Học viên duy trì phong độ tốt, không phát hiện rủi ro học vụ.</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="font-bold text-foreground mb-1.5">Giải pháp & Khuyến nghị tiếp theo:</div>
                    <ul className="space-y-1 text-muted-foreground font-medium">
                      {progress.recommendedInterventions.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary font-bold">✓</span>
                          <span className="text-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Official Verification, Seal & Signatures */}
          <div className="border-t-2 border-border/80 pt-6 mt-8 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center text-xs">
              <div className="space-y-1">
                <div className="text-[11px] text-muted-foreground uppercase font-bold">Xác thực điện tử:</div>
                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verified by EduCenter SIS</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Chứng thực dữ liệu học vụ số hóa
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-[11px] text-muted-foreground uppercase font-bold">Giáo viên phụ trách</div>
                <div className="h-12 flex items-center justify-center italic text-muted-foreground/60 text-xs">
                  (Đã ký điện tử)
                </div>
                <div className="font-bold text-foreground">
                  {student.classes[0]?.teacherName || "Giáo viên bộ môn"}
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="text-[11px] text-muted-foreground uppercase font-bold">Hội đồng Học vụ EduCenter</div>
                <div className="h-12 flex items-center justify-end">
                  <span className="px-2 py-0.5 rounded border border-rose-500/40 text-rose-600 font-black text-[10px] uppercase rotate-[-4deg] inline-block">
                    ★ ĐÃ KIỂM DUYỆT ★
                  </span>
                </div>
                <div className="font-bold text-foreground">{student.facility.name}</div>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-muted-foreground border-t border-border/40">
              Báo cáo này được tạo tự động bởi Hệ thống Quản trị Học tập EduCenter SIS. Mọi thắc mắc vui lòng liên hệ Hotline 1900 8888 hoặc trao đổi trực tiếp với Trợ lý AI Orchexa.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
