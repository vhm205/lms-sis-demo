import React from "react";
import { generateStudentReport } from "@/lib/report-generator";
import { ReportViewClient } from "./report-view-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; reportId?: string; print?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const isAcademic = !type || type.toLowerCase().includes("acad") || type === "ACADEMIC_RESULTS";
  return {
    title: `${isAcademic ? "Báo cáo Kết quả Học tập" : "Báo cáo Tổng quan Quá trình"} - ${id} | EduCenter SIS`,
    description: "Báo cáo học vụ chính thức từ Hệ thống Quản lý Học tập EduCenter SIS",
  };
}

export default async function ReportPreviewPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { type = "ACADEMIC_RESULTS", print } = await searchParams;

  try {
    const report = await generateStudentReport(id, type);
    return <ReportViewClient initialReport={report} autoPrint={print === "true" || print === "1"} />;
  } catch (error: any) {
    console.error("[ReportPreviewPage] Error loading report:", error);
    return (
      <div className="min-h-screen bg-[#F8F5EE] dark:bg-[#120F0D] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-card border-2 border-border/80 text-center space-y-4 shadow-xl">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <h1 className="text-lg font-black font-heading text-foreground">Không tìm thấy báo cáo</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Không thể tải thông tin báo cáo cho mã học viên: <strong>{id}</strong>. Vui lòng kiểm tra lại mã học viên hoặc liên hệ ban quản trị.
          </p>
          <div className="pt-2">
            <a
              href="/parent/academics"
              className="inline-block px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Quay lại sổ liên lạc
            </a>
          </div>
        </div>
      </div>
    );
  }
}
