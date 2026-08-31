"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, FileText, Star } from "lucide-react";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { getAssignmentStatusLabel, ASSIGNMENT_STATUS_MAP } from "@/lib/constants";

export function AssignmentsClient({ assignments }: { assignments: any[] }) {
  const { selectedFacilityId, selectedFacility } = useFacility();

  const matchFacility = (a: any) => {
    if (selectedFacilityId === "all") return true;
    const facId = a.student?.facilityId;
    const facName = a.student?.facility?.name;

    if (facId && facId === selectedFacilityId) return true;
    if (a.student?.facility?.id && a.student.facility.id === selectedFacilityId) return true;
    if (selectedFacility && facName === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (facName?.includes("Cầu Giấy") || facId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (facName?.includes("Bình Thạnh") || facId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (facName?.includes("Hải Châu") || facId?.includes("hai-chau"))) return true;
    return false;
  };

  const assignmentsInFacility = assignments.filter(matchFacility);

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems: paginatedAssignments,
    totalItems: totalFilteredAssignments,
  } = usePagination(assignmentsInFacility, 15);

  const completedCount = assignmentsInFacility.filter((a) => a.status === "COMPLETED").length;
  const avgScore = assignmentsInFacility.length > 0
    ? (assignmentsInFacility.reduce((sum, a) => sum + (a.score || 0), 0) / assignmentsInFacility.length).toFixed(1)
    : "0";

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="clay-icon-tile h-8 w-8 bg-[#FDF2F8] text-[#DB2777] dark:bg-[#2C1420] dark:text-[#F472B6]">
              <Award className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[#DB2777] dark:text-[#F472B6] uppercase tracking-wider font-heading">
              Học vụ & Đào tạo {selectedFacility ? `• ${selectedFacility.name}` : ""}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">Kết quả Học tập & Bài tập</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Sổ điểm học viên, bài tập định kỳ, điểm số và nhận xét chi tiết từ giáo viên đứng lớp.
          </p>
        </div>

        <RefreshButton 
          variant="outline" 
          size="default" 
          showLabel 
          label="Làm mới dữ liệu" 
          className="h-10 px-4 bg-card hover:bg-muted/80 shadow-2xs text-xs font-extrabold gap-2 shrink-0 self-start sm:self-auto" 
        />
      </div>

      {/* 2 Quick Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-bold font-heading">Tổng số bài tập đã nộp</span>
            <div className="text-2xl font-black font-heading text-foreground">
              {completedCount} / {assignmentsInFacility.length} bài
            </div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#FDF2F8] text-[#DB2777] shadow-sm">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-bold font-heading">Điểm số trung bình</span>
            <div className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">{avgScore} / 10</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#F0FDF4] text-[#16A34A] shadow-sm">
            <Star className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Gradebook Table */}
      <div className="clay-card overflow-hidden p-0 border-2">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-heading font-extrabold text-xs">Học Viên</TableHead>
              <TableHead className="font-heading font-extrabold text-xs">Tên Bài Tập / Bài Kiểm Tra</TableHead>
              <TableHead className="w-[140px] font-heading font-extrabold text-xs">Điểm Số</TableHead>
              <TableHead className="font-heading font-extrabold text-xs">Nhận Xét Của Giáo Viên</TableHead>
              <TableHead className="w-[140px] font-heading font-extrabold text-xs">Trạng Thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                  Không có bài tập nào cho cơ sở này.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAssignments.map((assignment) => {
                return (
                  <TableRow key={assignment.id} className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors">
                    <TableCell>
                      <div className="space-y-1 py-1">
                        <div className="font-bold text-sm text-foreground font-heading">{assignment.student.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono font-semibold">{assignment.student.code}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5 py-1">
                        <div className="font-bold text-sm text-foreground font-heading">{assignment.title}</div>
                        <div className="text-[11px] text-muted-foreground font-medium">
                          {new Date(assignment.date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {assignment.score !== null ? (
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFF0E6] text-[#D97736] border border-[#FCDCC8] font-mono font-black text-xs">
                          <Star className="h-4 w-4 fill-[#D97736]" />
                          <span>{assignment.score} / {assignment.maxScore}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-medium">Chưa chấm</span>
                      )}
                    </TableCell>

                    <TableCell className="max-w-md">
                      {assignment.teacherNote ? (
                        <p className="text-xs text-foreground italic bg-muted/40 p-3 rounded-2xl border border-border/70 font-medium leading-relaxed">
                          &ldquo;{assignment.teacherNote}&rdquo;
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-medium">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant={ASSIGNMENT_STATUS_MAP[assignment.status]?.badgeVariant || 'pink'}
                        className="text-xs px-3 py-1"
                      >
                        {getAssignmentStatusLabel(assignment.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <DataPagination
        currentPage={currentPage}
        totalItems={totalFilteredAssignments}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="bài tập"
      />
    </div>
  );
}
