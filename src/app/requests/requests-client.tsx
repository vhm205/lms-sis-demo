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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Headphones, Calendar, AlertCircle, FileText } from "lucide-react";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { 
  getSupportTypeLabel, 
  SUPPORT_TYPE_MAP, 
  getSupportStatusLabel, 
  SUPPORT_STATUS_MAP, 
  getRequestStatusLabel, 
  REQUEST_STATUS_MAP 
} from "@/lib/constants";

export function RequestsClient({
  supportRequests,
  makeUpRequests
}: {
  supportRequests: any[];
  makeUpRequests: any[];
}) {
  const { selectedFacilityId, selectedFacility } = useFacility();

  const matchFacility = (item: any) => {
    if (selectedFacilityId === "all") return true;
    const facId = item.student?.facilityId;
    const facName = item.student?.facility?.name;

    if (facId && facId === selectedFacilityId) return true;
    if (item.student?.facility?.id && item.student.facility.id === selectedFacilityId) return true;
    if (selectedFacility && facName === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (facName?.includes("Cầu Giấy") || facId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (facName?.includes("Bình Thạnh") || facId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (facName?.includes("Hải Châu") || facId?.includes("hai-chau"))) return true;
    return false;
  };

  const filteredSupport = supportRequests.filter(matchFacility);
  const filteredMakeup = makeUpRequests.filter(matchFacility);

  const {
    currentPage: supportPage,
    setCurrentPage: setSupportPage,
    pageSize: supportPageSize,
    setPageSize: setSupportPageSize,
    paginatedItems: paginatedSupport,
    totalItems: totalFilteredSupport,
  } = usePagination(filteredSupport, 8);

  const {
    currentPage: makeupPage,
    setCurrentPage: setMakeupPage,
    pageSize: makeupPageSize,
    setPageSize: setMakeupPageSize,
    paginatedItems: paginatedMakeup,
    totalItems: totalFilteredMakeup,
  } = usePagination(filteredMakeup, 8);

  const newSupportCount = filteredSupport.filter((r) => r.status === "NEW").length;
  const pendingMakeupCount = filteredMakeup.filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="clay-icon-tile h-8 w-8 bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78]">
              <Headphones className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[#D97736] dark:text-[#FBAA78] uppercase tracking-wider font-heading">
              Tuyển sinh & Dịch vụ {selectedFacility ? `• ${selectedFacility.name}` : ""}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">Yêu cầu Hỗ trợ & Học bù</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Tiếp nhận và xử lý các phiếu yêu cầu từ phụ huynh và học sinh (qua Website & Trợ lý AI Orchexa).
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
            <span className="text-xs text-[#DB2777] font-bold uppercase tracking-wider font-heading">Phiếu hỗ trợ & Nghỉ phép mới</span>
            <div className="text-2xl font-black font-heading text-foreground">{newSupportCount} phiếu cần duyệt</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#FDF2F8] text-[#DB2777] shadow-sm">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#D97736] font-bold uppercase tracking-wider font-heading">Yêu cầu đăng ký học bù</span>
            <div className="text-2xl font-black font-heading text-foreground">{pendingMakeupCount} ca chờ xếp lớp</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#FFF0E6] text-[#D97736] shadow-sm">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Split Grid for Support vs Makeup */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General & Leave Support Requests */}
        <Card className="clay-card p-0 overflow-hidden flex flex-col border-2">
          <CardHeader className="border-b-2 border-border/70 pb-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="clay-icon-tile h-8 w-8 bg-[#FDF2F8] text-[#DB2777]">
                  <FileText className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-extrabold font-heading">Yêu cầu chung & Nghỉ phép</CardTitle>
              </div>
              <Badge variant="pink" className="text-xs font-bold font-heading">{filteredSupport.length} phiếu</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <Table>
              <TableHeader className="bg-muted/40 border-b border-border/60">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-heading font-extrabold text-xs">Học Viên</TableHead>
                  <TableHead className="font-heading font-extrabold text-xs">Loại / Nội Dung</TableHead>
                  <TableHead className="w-[120px] font-heading font-extrabold text-xs">Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSupport.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-36 text-center text-xs text-muted-foreground font-semibold">
                      Không có yêu cầu hỗ trợ nào cho cơ sở này.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSupport.map((req) => (
                    <TableRow key={req.id} className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#28221D]/60 transition-colors">
                      <TableCell>
                        <div className="space-y-1 py-1">
                          <div className="font-bold text-sm text-foreground font-heading">{req.student.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono font-semibold">{req.student.code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="space-y-2 py-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={SUPPORT_TYPE_MAP[req.type]?.badgeVariant || 'aqua'}
                            className="text-[10px] px-2.5 py-0.5"
                          >
                            {getSupportTypeLabel(req.type)}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed font-medium">
                          {req.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={SUPPORT_STATUS_MAP[req.status]?.badgeVariant || 'pink'}
                          className="text-xs px-3 py-1"
                        >
                          {getSupportStatusLabel(req.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-3 border-t-2 border-border/70">
              <DataPagination
                currentPage={supportPage}
                totalItems={totalFilteredSupport}
                pageSize={supportPageSize}
                onPageChange={setSupportPage}
                onPageSizeChange={setSupportPageSize}
                pageSizeOptions={[8, 15, 30]}
                itemLabel="yêu cầu"
              />
            </div>
          </CardContent>
        </Card>

        {/* Make-up Requests */}
        <Card className="clay-card p-0 overflow-hidden flex flex-col border-2">
          <CardHeader className="border-b-2 border-border/70 pb-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="clay-icon-tile h-8 w-8 bg-[#FFF0E6] text-[#D97736]">
                  <Calendar className="h-4 w-4" />
                </div>
                <CardTitle className="text-base font-extrabold font-heading">Đăng ký ca học bù</CardTitle>
              </div>
              <Badge variant="orange" className="text-xs font-bold font-heading">{filteredMakeup.length} ca</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            <Table>
              <TableHeader className="bg-muted/50 border-b-2 border-border/70">
                <TableRow className="hover:bg-transparent">
                  <TableHead>Học Viên</TableHead>
                  <TableHead>Ca Nghỉ & Ca Bù</TableHead>
                  <TableHead className="w-[130px]">Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMakeup.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                      Không có yêu cầu học bù nào cho cơ sở này.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMakeup.map((req) => (
                    <TableRow key={req.id} className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors">
                      <TableCell>
                        <div className="space-y-1 py-1">
                          <div className="font-bold text-sm text-foreground font-heading">{req.student.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono font-semibold">{req.student.code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="space-y-1.5 py-1.5">
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[#DC2626] dark:text-[#EF4444]">Buổi vắng:</span>
                          <span className="font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md text-[11px]">
                            {req.missedSchedule 
                              ? `${req.missedSchedule.class?.name || req.missedSchedule.class?.code || "Lớp học"} (${new Date(req.missedSchedule.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })} • ${new Date(req.missedSchedule.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}${req.missedSchedule.room?.name ? ` • ${req.missedSchedule.room.name}` : ''})`
                              : `Ca học #${req.missedScheduleId?.slice(-6) || 'N/A'}`}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-primary">Đăng ký bù:</span>
                          <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[11px]">
                            {req.targetSchedule 
                              ? `${req.targetSchedule.class?.name || req.targetSchedule.class?.code || "Lớp học"} (${new Date(req.targetSchedule.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })} • ${new Date(req.targetSchedule.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}${req.targetSchedule.room?.name ? ` • ${req.targetSchedule.room.name}` : ''})`
                              : `Ca học #${req.targetScheduleId?.slice(-6) || 'N/A'}`}
                          </span>
                        </div>
                        {req.notes && (
                          <div className="text-[11px] text-muted-foreground italic truncate max-w-sm">
                            Ghi chú: {req.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={REQUEST_STATUS_MAP[req.status]?.badgeVariant || 'amber'}
                          className="text-xs px-3 py-1"
                        >
                          {getRequestStatusLabel(req.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-3 border-t-2 border-border/70">
              <DataPagination
                currentPage={makeupPage}
                totalItems={totalFilteredMakeup}
                pageSize={makeupPageSize}
                onPageChange={setMakeupPage}
                onPageSizeChange={setMakeupPageSize}
                pageSizeOptions={[8, 15, 30]}
                itemLabel="ca bù"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
