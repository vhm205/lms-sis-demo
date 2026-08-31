"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  CalendarDays, 
  ClipboardCheck, 
  TrendingUp, 
  Clock, 
  UserPlus, 
  Receipt, 
  Headphones, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  ChevronRight,
  ShieldCheck,
  Star,
  PhoneCall,
  Building2
} from "lucide-react";
import Link from "next/link";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { getSupportTypeLabel, getLeadStatusLabel } from "@/lib/constants";

interface DashboardClientProps {
  students: any[];
  classes: any[];
  leads: any[];
  supportRequests: any[];
  makeUpRequests: any[];
  orders: any[];
  schedules: any[];
}

export function DashboardClient({
  students,
  classes,
  leads,
  supportRequests,
  makeUpRequests,
  orders,
  schedules
}: DashboardClientProps) {
  const { selectedFacilityId, selectedFacility } = useFacility();

  // Robust facility matcher
  const matchFacilityHelper = (itemFacId?: string, itemFacName?: string) => {
    if (selectedFacilityId === "all") return true;
    if (itemFacId && itemFacId === selectedFacilityId) return true;
    if (selectedFacility && itemFacName && itemFacName === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (itemFacName?.includes("Cầu Giấy") || itemFacId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (itemFacName?.includes("Bình Thạnh") || itemFacId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (itemFacName?.includes("Hải Châu") || itemFacId?.includes("hai-chau"))) return true;
    return false;
  };

  // Filter entities according to active facility
  const studentsInScope = students.filter((s) =>
    matchFacilityHelper(s.facilityId || s.facility?.id, s.facility?.name)
  );

  const classesInScope = classes.filter((c) =>
    matchFacilityHelper(c.facilityId || c.facility?.id, c.facility?.name)
  );

  const leadsInScope = leads.filter((l) =>
    matchFacilityHelper(l.facilityId || l.facility?.id, l.facility?.name)
  );

  const supportRequestsInScope = supportRequests.filter((r) =>
    matchFacilityHelper(r.student?.facilityId || r.student?.facility?.id, r.student?.facility?.name)
  );

  const makeUpRequestsInScope = makeUpRequests.filter((m) =>
    matchFacilityHelper(m.student?.facilityId || m.student?.facility?.id, m.student?.facility?.name)
  );

  const ordersInScope = orders.filter((o) =>
    matchFacilityHelper(o.facilityId || o.facility?.id, o.facility?.name)
  );

  const schedulesInScope = schedules.filter((s) => {
    const cFacId = s.class?.facilityId || s.class?.facility?.id;
    const rFacId = s.room?.facilityId || s.room?.facility?.id;
    const cFacName = s.class?.facility?.name;
    const rFacName = s.room?.facility?.name;
    return (
      matchFacilityHelper(cFacId, cFacName) ||
      matchFacilityHelper(rFacId, rFacName)
    );
  });

  // Compute metrics
  const studentCount = studentsInScope.length;
  const activeStudentCount = studentsInScope.filter((s) => s.status === "ACTIVE").length;
  const classCount = classesInScope.length;
  const leadCount = leadsInScope.length;
  const newLeadCount = leadsInScope.filter((l) => l.status === "NEW").length;
  const pendingRequests = supportRequestsInScope.filter((r) => r.status === "NEW").length;
  const pendingMakeupCount = makeUpRequestsInScope.filter((m) => m.status === "PENDING").length;

  const paidOrders = ordersInScope.filter((o) => o.status === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);

  const recentOrders = ordersInScope.slice(0, 4);
  const upcomingSchedules = schedulesInScope.slice(0, 4);
  const recentLeads = leadsInScope.slice(0, 4);
  const recentSupportRequests = supportRequestsInScope.filter((r) => r.status === "NEW").slice(0, 3);
  const classesList = classesInScope.slice(0, 4);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* =========================================================
          HERO WELCOME BANNER (Claymorphic Style with Floating Badges)
         ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF5ED] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2A1E16] dark:via-[#211D1A] dark:to-[#0F242C] border-2 border-[#EEDBCC] dark:border-[#3E3228] p-6 sm:p-10 shadow-[0_12px_32px_rgba(215,160,120,0.12)]">
        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0E6] dark:bg-[#382417] border-1.5 border-[#FCDCC8] dark:border-[#57351F] text-xs font-extrabold text-[#D97736] shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {selectedFacility ? `Cơ sở: ${selectedFacility.name}` : "#1 LMS & SIS Smart Hub • Toàn hệ thống"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-foreground tracking-tight leading-[1.15]">
              Quản lý thông minh <br />
              <span className="bg-gradient-to-r from-[#F2994A] via-[#E08E58] to-[#FB7185] bg-clip-text text-transparent">
                Lớp học & Học viên
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
              Hôm nay hệ thống ghi nhận <strong className="text-foreground font-bold">{studentCount} học viên</strong>{" "}
              {selectedFacility ? `thuộc ${selectedFacility.name}` : "đang theo học tại các cơ sở"}. Trợ lý AI Orchexa hoạt động 24/7 phục vụ phụ huynh & học vụ ✨
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/schedule">
                <Button className="clay-btn-primary h-11 px-5 rounded-2xl text-xs font-extrabold gap-2">
                  <CalendarDays className="h-4 w-4" /> Điểm danh ca hôm nay
                </Button>
              </Link>
              <Link href="/developer">
                <Button variant="outline" className="clay-btn-outline h-11 px-5 rounded-2xl text-xs font-extrabold gap-2">
                  <Bot className="h-4 w-4" /> Orchexa AI Hub
                </Button>
              </Link>
              <RefreshButton 
                variant="outline" 
                size="default" 
                showLabel 
                label="Làm mới dữ liệu" 
                className="h-11 px-4 bg-card hover:bg-muted/80 shadow-xs text-xs font-extrabold gap-2" 
              />
            </div>

            {/* Micro Social Stats Row */}
            <div className="flex items-center gap-6 pt-3 border-t border-border/60">
              <div>
                <div className="text-xl font-black font-heading text-[#D97736]">
                  {studentCount}+
                </div>
                <div className="text-[11px] font-bold text-muted-foreground">Học viên</div>
              </div>
              <div className="h-7 w-px bg-border/80"></div>
              <div>
                <div className="text-xl font-black font-heading text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  4.9 <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 inline" />
                </div>
                <div className="text-[11px] font-bold text-muted-foreground">Hài lòng</div>
              </div>
              <div className="h-7 w-px bg-border/80"></div>
              <div>
                <div className="text-xl font-black font-heading text-[#0284C7] dark:text-[#38BDF8]">
                  98%
                </div>
                <div className="text-[11px] font-bold text-muted-foreground">Tỷ lệ đi học</div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Frame with Floating Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm rounded-3xl border-2 border-white/80 dark:border-white/10 bg-white/60 dark:bg-card/60 backdrop-blur-md p-5 shadow-[0_16px_36px_rgba(215,160,120,0.18)] space-y-4">
              {/* Floating Top-Left Badge */}
              <div className="clay-floating-badge absolute -top-4 -left-4 animate-soft-bounce">
                <div className="clay-icon-tile h-9 w-9 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold font-heading text-foreground">AI Voice Agent</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Online 24/7</div>
                </div>
              </div>

              {/* Floating Bottom-Right Badge */}
              <div className="clay-floating-badge absolute -bottom-4 -right-4">
                <div className="clay-icon-tile h-9 w-9 bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold font-heading text-foreground">BFF Security</div>
                  <div className="text-[10px] text-pink-600 dark:text-pink-400 font-bold">HMAC-SHA256</div>
                </div>
              </div>

              {/* Inner Mockup Card */}
              <div className="rounded-2xl bg-gradient-to-br from-[#FAF6F0] to-white dark:from-[#26211C] dark:to-[#1F1B18] border-2 border-border/80 p-4 space-y-3 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-400"></span>
                    <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                    <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <Badge variant="orange" className="text-[9px] h-4 px-1.5 font-mono">SANDBOX-V2</Badge>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold font-heading">
                    <span>Ca học IELTS 6.5+</span>
                    <span className="text-[#D97736]">Phòng Lab 201</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#F2994A] to-[#FB7185] rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                    <span>15/18 học viên</span>
                    <span className="text-emerald-600 font-bold">Điểm danh 100%</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-card border border-border/70 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PhoneCall className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold text-[11px]">Phụ huynh Nguyễn Minh</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">Vừa gọi AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#F2994A]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-[#FB7185]/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* =========================================================
          4 STAT KPI CARDS (Claymorphic Blocks) - Facility Scoped
         ========================================================= */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="clay-card clay-card-interactive group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider font-heading">Tổng học viên</span>
            <div className="clay-icon-tile h-10 w-10 bg-[#E6F8FB] dark:bg-[#0E2E3B] text-[#0284C7] dark:text-[#38BDF8] group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-heading tracking-tight">{studentCount}</span>
              <Badge variant="green" className="text-[10px]">
                <TrendingUp className="h-3 w-3 mr-0.5" /> +12% tháng
              </Badge>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                <span>Đang theo học:</span>
                <span className="font-extrabold text-foreground">{activeStudentCount} / {studentCount}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-full transition-all duration-300" 
                  style={{ width: `${studentCount > 0 ? (activeStudentCount / studentCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Classes */}
        <Card className="clay-card clay-card-interactive group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider font-heading">Lớp học mở</span>
            <div className="clay-icon-tile h-10 w-10 bg-[#FFF0E6] dark:bg-[#352114] text-[#D97736] dark:text-[#FBAA78] group-hover:scale-110 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-heading tracking-tight">{classCount}</span>
              <Badge variant="orange" className="text-[10px]">
                {classCount > 0 ? "85% lấp đầy" : "0 lớp"}
              </Badge>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                <span>Khóa đào tạo:</span>
                <span className="font-extrabold text-foreground">
                  {classesInScope.length > 0 ? classesInScope[0].course?.name || "Đang hoạt động" : "Chưa có lớp"}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#F2994A] to-[#E08E58] rounded-full transition-all duration-300" 
                  style={{ width: classCount > 0 ? '85%' : '0%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Leads */}
        <Card className="clay-card clay-card-interactive group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider font-heading">Khách tiềm năng</span>
            <div className="clay-icon-tile h-10 w-10 bg-[#FEFCE8] dark:bg-[#382A0B] text-[#D97706] dark:text-[#FBBF24] group-hover:scale-110 transition-transform">
              <UserPlus className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-heading tracking-tight">{leadCount}</span>
              <Badge variant="amber" className="text-[10px]">
                {newLeadCount} cần liên hệ
              </Badge>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                <span>Tỷ lệ chốt đơn:</span>
                <span className="font-extrabold text-foreground">{leadCount > 0 ? "62% hoàn tất" : "0%"}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300" 
                  style={{ width: leadCount > 0 ? '62%' : '0%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tickets & Makeup */}
        <Card className="clay-card clay-card-interactive group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider font-heading">Yêu cầu & Học bù</span>
            <div className="clay-icon-tile h-10 w-10 bg-[#FDF2F8] dark:bg-[#3B1226] text-[#DB2777] dark:text-[#F48FB1] group-hover:scale-110 transition-transform">
              <Headphones className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-black font-heading tracking-tight">{pendingRequests + pendingMakeupCount}</span>
              <Badge variant="pink" className="text-[10px]">
                {(pendingRequests + pendingMakeupCount) > 0 ? "Cần xử lý" : "Đã xử lý xong"}
              </Badge>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-muted-foreground font-semibold">
                <span>SLA phản hồi:</span>
                <span className="font-extrabold text-emerald-600">&lt; 15 phút</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full transition-all duration-300" 
                  style={{ width: (pendingRequests + pendingMakeupCount) > 0 ? '75%' : '100%' }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =========================================================
          MAIN CONTENT LAYOUT GRID
         ========================================================= */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Classes & Schedule */}
          <Card className="clay-card">
            <CardHeader className="pb-3 border-b-2 border-border/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="clay-icon-tile h-10 w-10 bg-[#FFF0E6] dark:bg-[#352114] text-[#D97736] dark:text-[#FBAA78]">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold">Lịch học & Điểm danh hôm nay</CardTitle>
                    <CardDescription className="text-xs font-medium">
                      Các ca học trong ngày và tình trạng điểm danh của giáo viên.
                    </CardDescription>
                  </div>
                </div>
                <Link href="/schedule">
                  <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 h-8 text-[#D97736] hover:bg-[#FFF0E6]">
                    Xem tất cả <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-5 divide-y-2 divide-border/60">
              {upcomingSchedules.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-foreground font-semibold">
                  Không có ca học nào được lên lịch cho cơ sở này.
                </div>
              ) : (
                upcomingSchedules.map((schedule) => {
                  const studentTotal = schedule.class.students.length;
                  const presentCount = schedule.attendances.filter((a: any) => a.status === 'PRESENT').length;
                  return (
                    <div key={schedule.id} className="py-4.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group">
                      <div className="flex items-start gap-3.5">
                        <div className="clay-icon-tile h-12 w-12 bg-muted/80 text-primary shrink-0 border-2 border-border/80 group-hover:border-primary/50 transition-colors shadow-2xs">
                          <Clock className="h-5.5 w-5.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm text-foreground font-heading">{schedule.class.name}</span>
                            <Badge variant="secondary" className="text-[10px] h-5.5 px-2.5 font-mono font-bold">{schedule.class.code}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium flex-wrap">
                            <span className="flex items-center gap-1.5 text-foreground/80 font-bold">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              {new Date(schedule.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({schedule.duration}p)
                            </span>
                            <span>•</span>
                            <span>Phòng: <strong className="text-foreground font-bold">{schedule.room.name}</strong></span>
                            <span>•</span>
                            <span>GV: <strong className="text-foreground font-bold">{schedule.class.teacher?.name || "Chưa gán"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <Badge variant="outline" className="text-xs px-3 py-1 font-bold">
                          {presentCount > 0 ? `Đã điểm danh: ${presentCount}/${studentTotal}` : `Sĩ số: ${studentTotal}`}
                        </Badge>
                        <Link href="/schedule">
                          <Button size="sm" variant="default" className="h-9 px-3.5 text-xs font-bold gap-1.5">
                            <ClipboardCheck className="h-4 w-4" /> Điểm danh
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Recent Orders & Payments */}
          <Card className="clay-card">
            <CardHeader className="pb-4 border-b-2 border-border/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="clay-icon-tile h-10 w-10 bg-[#F0FDF4] dark:bg-[#112F1B] text-[#16A34A] dark:text-[#4ADE80]">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold font-heading">Đơn đăng ký & Doanh thu mới</CardTitle>
                    <CardDescription className="text-xs font-medium mt-0.5">
                      Tổng doanh thu đã thu: <strong className="text-[#D97736] font-bold">{formatVND(totalRevenue)}</strong>
                    </CardDescription>
                  </div>
                </div>
                <Link href="/orders">
                  <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 h-8 text-[#D97736] hover:bg-[#FFF0E6]">
                    Xem tất cả <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-5 divide-y-2 divide-border/60">
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground font-semibold">
                  Chưa có đơn đăng ký nào cho cơ sở này.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3.5">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="clay-icon-tile h-11 w-11 bg-[#FFF0E6] text-[#D97736] font-black text-xs shrink-0 border border-[#FCDCC8] shadow-2xs">
                        {order.parentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-foreground truncate font-heading">{order.parentName}</span>
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">{order.code}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-medium">
                          {order.course?.name} • {order.facility?.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-black text-sm text-foreground font-mono">{formatVND(order.amount)}</div>
                      <Badge 
                        variant={order.status === 'PAID' ? 'green' : 'amber'}
                        className="text-xs px-2.5 py-0.5 mt-1"
                      >
                        {order.status === 'PAID' ? 'Đã thu tiền' : 'Chưa thanh toán'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Class Capacity Meter */}
          <Card className="clay-card">
            <CardHeader className="pb-3 border-b-2 border-border/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="clay-icon-tile h-10 w-10 bg-[#FDF2F8] dark:bg-[#3B1226] text-[#DB2777] dark:text-[#F48FB1]">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-extrabold">Tỷ lệ lấp đầy các lớp học</CardTitle>
                    <CardDescription className="text-xs font-medium">Theo dõi sĩ số hiện tại so với sức chứa lớp.</CardDescription>
                  </div>
                </div>
                <Link href="/classes">
                  <Button variant="ghost" size="sm" className="text-xs font-bold gap-1 h-8 text-[#D97736] hover:bg-[#FFF0E6]">
                    Quản lý lớp <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid gap-3.5 sm:grid-cols-2">
              {classesList.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-muted-foreground font-semibold">
                  Chưa có lớp học nào mở cho cơ sở này.
                </div>
              ) : (
                classesList.map((cls) => {
                  const studentCount = cls.students.length;
                  const ratio = Math.round((studentCount / cls.capacity) * 100);
                  return (
                    <div key={cls.id} className="p-4 rounded-2xl border-2 border-border/80 bg-muted/20 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-foreground truncate font-heading">{cls.name}</span>
                        <span className="text-xs font-extrabold text-primary font-mono">{studentCount}/{cls.capacity} ({ratio}%)</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            ratio >= 90 ? 'bg-rose-500' : ratio >= 70 ? 'bg-gradient-to-r from-amber-400 to-[#F2994A]' : 'bg-gradient-to-r from-sky-400 to-[#E08E58]'
                          }`} 
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                        <span>{cls.facility.name}</span>
                        <Badge variant="outline" className="text-[9px] h-4.5 px-1.5 font-bold font-mono">{cls.course.code}</Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Orchexa Embedded AI Assistant Card */}
          <Card className="clay-card border-2 border-[#FCDCC8] dark:border-[#523824] bg-gradient-to-br from-[#FFF0E6] via-[#FAF6F0] to-[#E6F8FB] dark:from-[#2B1B11] dark:via-[#211D1A] dark:to-[#0D242C] relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="clay-icon-tile h-10 w-10 bg-gradient-to-tr from-[#F2994A] to-[#E08E58] text-white shadow-md border border-white/40">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-black font-heading text-foreground">Orchexa AI Assistant</CardTitle>
                    <CardDescription className="text-[11px] font-semibold text-muted-foreground">Voice Agent & MCP Sandbox</CardDescription>
                  </div>
                </div>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Tự động trả lời phụ huynh, hỗ trợ xin nghỉ phép, tra cứu lịch học bù và đăng ký khóa học tức thì.
              </p>
              <div className="p-3 rounded-2xl bg-card border-2 border-border/80 text-xs space-y-2 font-mono text-muted-foreground shadow-2xs">
                <div className="text-[11px] text-primary font-bold flex items-center gap-1.5 font-heading">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Câu hỏi mẫu phụ huynh:
                </div>
                <div className="text-[11px] text-foreground bg-muted/60 p-2 rounded-xl font-sans font-medium">
                  &ldquo;Hôm nay con tôi bận, cho tôi xin học bù ca khác.&rdquo;
                </div>
                <div className="text-[11px] text-foreground bg-muted/60 p-2 rounded-xl font-sans font-medium">
                  &ldquo;Khóa IELTS có lớp nào học tối 2-4-6 không?&rdquo;
                </div>
              </div>
              <Link href="/developer" className="block w-full">
                <Button size="default" className="clay-btn-primary w-full text-xs font-extrabold gap-2 h-10">
                  <Sparkles className="h-4 w-4" /> Mở Bảng Điều Hành AI
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pending Requests Triage */}
          <Card className="clay-card">
            <CardHeader className="pb-3 border-b-2 border-border/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="clay-icon-tile h-8.5 w-8.5 bg-[#FDF2F8] dark:bg-[#3B1226] text-[#DB2777] dark:text-[#F48FB1]">
                    <AlertCircle className="h-4.5 w-4.5" />
                  </div>
                  <CardTitle className="text-sm font-extrabold">Yêu cầu cần xử lý</CardTitle>
                </div>
                <Link href="/requests" className="text-xs text-[#D97736] hover:underline font-bold">
                  Xem hết ({recentSupportRequests.length})
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-3 divide-y-2 divide-border/60">
              {recentSupportRequests.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Không có yêu cầu tồn đọng
                </div>
              ) : (
                recentSupportRequests.map((req) => (
                  <div key={req.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-foreground font-heading">{req.student.name}</span>
                      <Badge variant="pink" className="text-[9px]">
                        {getSupportTypeLabel(req.type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                      {req.content}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Leads Pipeline */}
          <Card className="clay-card">
            <CardHeader className="pb-3 border-b-2 border-border/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="clay-icon-tile h-8.5 w-8.5 bg-[#FEFCE8] dark:bg-[#382A0B] text-[#D97706] dark:text-[#FBBF24]">
                    <UserPlus className="h-4.5 w-4.5" />
                  </div>
                  <CardTitle className="text-sm font-extrabold">Khách tiềm năng mới</CardTitle>
                </div>
                <Link href="/leads" className="text-xs text-[#D97736] hover:underline font-bold">
                  Xem CRM
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-3 divide-y-2 divide-border/60">
              {recentLeads.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground font-semibold">
                  Chưa có khách tiềm năng cho cơ sở này.
                </div>
              ) : (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="font-extrabold text-xs text-foreground truncate font-heading">{lead.name}</div>
                      <div className="text-[11px] text-muted-foreground font-medium">{lead.phone} • {lead.course?.name || "Chưa chọn khóa"}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] shrink-0 font-bold">
                      {getLeadStatusLabel(lead.status)}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
