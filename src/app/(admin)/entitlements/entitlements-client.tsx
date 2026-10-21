"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { formatVND } from "@/lib/vietnamese-currency";
import {
  createTrialAccountAction,
  triggerLmsProgressAction,
  renewStudentEntitlementAction,
  expireStudentEntitlementAction,
} from "@/app/actions/entitlement";
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  BookOpen,
  Building2,
  Calendar,
  Lock,
  UserCheck,
  Flame,
  Award,
  ChevronRight,
  UserPlus
} from "lucide-react";

interface EntitlementsClientProps {
  initialEntitlements: any[];
  students: any[];
  courses: any[];
  facilities: any[];
  activityLogs: any[];
}

export function EntitlementsClient({
  initialEntitlements,
  students,
  courses,
  facilities,
  activityLogs,
}: EntitlementsClientProps) {
  const { selectedFacilityId, selectedFacility, facilities: ctxFacilities } = useFacility();
  const availableFacilities = ctxFacilities.length > 0 ? ctxFacilities : facilities;

  const [entitlements, setEntitlements] = useState(initialEntitlements);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trialSuccessData, setTrialSuccessData] = useState<any | null>(null);

  // Renewal Modal State
  const [selectedForRenewal, setSelectedForRenewal] = useState<any | null>(null);
  const [renewalDays, setRenewalDays] = useState(30);

  // Simulation Feedback Message
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Facility filter matcher
  const matchFacility = (ent: any) => {
    if (selectedFacilityId === "all") return true;
    const facId = ent.student?.facilityId;
    const facName = ent.student?.facility?.name;
    if (facId && facId === selectedFacilityId) return true;
    if (selectedFacility && facName === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (facName?.includes("Cầu Giấy") || facId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (facName?.includes("Bình Thạnh") || facId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (facName?.includes("Hải Châu") || facId?.includes("hai-chau"))) return true;
    return false;
  };

  const filteredEntitlements = entitlements
    .filter(matchFacility)
    .filter((ent) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        ent.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ent.student?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ent.course?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ent.student?.phone?.includes(searchTerm);

      // Status filter
      if (!matchesSearch) return false;
      const now = new Date();
      const expiresAt = new Date(ent.expiresAt);
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = ent.status === "EXPIRED" || daysRemaining <= 0;
      const isExpiringSoon = !isExpired && daysRemaining <= 7;

      if (statusFilter === "all") return true;
      if (statusFilter === "TRIAL") return ent.type === "TRIAL";
      if (statusFilter === "OFFICIAL") return ent.type === "OFFICIAL";
      if (statusFilter === "RENEWAL") return ent.type === "RENEWAL";
      if (statusFilter === "EXPIRING") return isExpiringSoon;
      if (statusFilter === "EXPIRED") return isExpired;
      return true;
    });

  // Calculate metrics
  const now = new Date();
  const activeCount = filteredEntitlements.filter((e) => e.status === "ACTIVE" && new Date(e.expiresAt) > now).length;
  const trialCount = filteredEntitlements.filter((e) => e.type === "TRIAL" && e.status === "ACTIVE").length;
  const expiringSoonCount = filteredEntitlements.filter((e) => {
    const days = Math.ceil((new Date(e.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return e.status === "ACTIVE" && days > 0 && days <= 7;
  }).length;
  const expiredCount = filteredEntitlements.filter((e) => e.status === "EXPIRED" || new Date(e.expiresAt) <= now).length;

  // Calculate LMS progress percentage for student
  const getStudentLmsProgress = (studentId: string) => {
    // Check assignments created from LMS
    const student = students.find((s) => s.id === studentId);
    const lmsAssignments = student?.assignments?.filter((a: any) => a.title?.includes("[LMS]")) || [];
    const logs = activityLogs.filter(
      (log) => log.entityId === studentId && log.action === "LMS_PROGRESS_RECORDED"
    );

    let progress = 0;
    if (lmsAssignments.length > 0) {
      progress = Math.min(100, lmsAssignments.length * 25);
    } else if (logs.length > 0) {
      progress = 25;
    }

    const hasFirstLogin = logs.some((l) => l.details && l.details.includes("lms.first_login"));

    return {
      progress,
      hasFirstLogin,
      assignmentsCount: lmsAssignments.length,
      lastActive: logs[0]?.createdAt || student?.createdAt,
    };
  };

  // Submit trial provisioning
  const handleProvisionTrial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const courseId = formData.get("courseId") as string;
    const facilityId = formData.get("facilityId") as string;
    const trialDays = parseInt(formData.get("trialDays") as string) || 7;
    const notes = formData.get("notes") as string;

    const res = await createTrialAccountAction({
      name,
      phone,
      courseId,
      facilityId,
      trialDays,
      notes,
    });

    setIsSubmitting(false);

    if (res.success) {
      setTrialSuccessData(res);
      setIsTrialModalOpen(false);
      setFeedbackMsg({ text: `Đã cấp quyền học thử ${trialDays} ngày cho ${name}!`, type: "success" });
    } else {
      setFeedbackMsg({ text: res.error || "Cấp quyền thất bại", type: "error" });
    }
  };

  // Simulate LMS Event
  const handleTriggerLmsEvent = async (studentId: string, event: "lms.first_login" | "lms.lesson_completed" | "lms.progress_updated") => {
    let lessonTitle = "Bài học 1: Giới thiệu & Nhập môn";
    let progressPercent = 25;

    if (event === "lms.lesson_completed") {
      const current = getStudentLmsProgress(studentId);
      const nextStep = Math.min(100, current.progress + 25);
      progressPercent = nextStep;
      lessonTitle = `Bài học ${Math.floor(nextStep / 25)}: Kỹ năng trọng tâm`;
    }

    const res = await triggerLmsProgressAction({
      studentId,
      event,
      lessonTitle,
      progressPercent,
    });

    if (res.success) {
      setFeedbackMsg({
        text: event === "lms.first_login"
          ? "Đã ghi nhận mốc Bắt đầu học (First Login) thành công! KPI đã được cập nhật."
          : `Đã cập nhật tiến độ LMS: +25% (${lessonTitle})!`,
        type: "success",
      });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ text: res.error || "Lỗi mô phỏng tiến độ", type: "error" });
    }
  };

  // Handle Renewal
  const handleConfirmRenewal = async () => {
    if (!selectedForRenewal) return;
    setIsSubmitting(true);

    const res = await renewStudentEntitlementAction(selectedForRenewal.id, renewalDays);
    setIsSubmitting(false);

    if (res.success) {
      setEntitlements((prev) =>
        prev.map((e) => (e.id === selectedForRenewal.id ? { ...e, ...res.entitlement } : e))
      );
      setSelectedForRenewal(null);
      setFeedbackMsg({ text: `Đã gia hạn thành công thêm ${renewalDays} ngày!`, type: "success" });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ text: res.error || "Gia hạn thất bại", type: "error" });
    }
  };

  // Handle Expire / Revoke
  const handleExpireEntitlement = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn kết thúc / thu hồi quyền học này trước thời hạn?")) return;
    const res = await expireStudentEntitlementAction(id);
    if (res.success) {
      setEntitlements((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "EXPIRED" } : e))
      );
      setFeedbackMsg({ text: "Đã thu hồi / kết thúc quyền học thành công", type: "success" });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Quản lý Tài khoản, Dùng thử & Tiến độ LMS
            </h1>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30 text-xs px-2.5 py-0.5">
              Entitlement Hub
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Cấp quyền học thử 7 ngày, giám sát mốc Bắt đầu học (KPI Partner SLA) và quy trình kích hoạt - gia hạn khóa học.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <RefreshButton />
          <Button
            onClick={() => setIsTrialModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Cấp Quyền Dùng Thử Ngay
          </Button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-sm font-medium flex items-center gap-2 animate-in fade-in duration-200 ${
            feedbackMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300"
          }`}
        >
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 4 Entitlement KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Entitlements */}
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Quyền Học Đang Hiệu Lực
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading truncate">
              {activeCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <span>Truy cập đầy đủ LMS & SIS</span>
          </CardContent>
        </Card>

        {/* KPI 2: Trial Accounts */}
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Đang Dùng Thử (Trial)
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading truncate">
              {trialCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <span>Thời hạn 7-14 ngày</span>
          </CardContent>
        </Card>

        {/* KPI 3: Expiring Soon */}
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Sắp Hết Hạn (&le; 7 ngày)
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading text-rose-600 dark:text-rose-400 truncate">
              {expiringSoonCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <span className="font-medium text-rose-600">Cần liên hệ gia hạn gấp</span>
          </CardContent>
        </Card>

        {/* KPI 4: Expired / Revoked */}
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Đã Hết Hạn / Thu Hồi
              </span>
              <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                <Lock className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading truncate">
              {expiredCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <span>Cần kịch bản Re-engagement</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên học viên, mã HV, SĐT hoặc khóa học..."
            className="pl-9 bg-background/50 h-9 text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Trạng thái quyền" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại quyền</SelectItem>
              <SelectItem value="TRIAL">Dùng thử (TRIAL)</SelectItem>
              <SelectItem value="OFFICIAL">Chính thức (OFFICIAL)</SelectItem>
              <SelectItem value="RENEWAL">Đã gia hạn (RENEWAL)</SelectItem>
              <SelectItem value="EXPIRING">Sắp hết hạn (&le; 7 ngày)</SelectItem>
              <SelectItem value="EXPIRED">Đã hết hạn (EXPIRED)</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-xs text-muted-foreground px-2">
            {filteredEntitlements.length} tài khoản
          </span>
        </div>
      </div>

      {/* Entitlements Table */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
        <Table className="min-w-[960px]">
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="font-bold text-xs uppercase w-[180px] whitespace-nowrap">Học viên & Cơ sở</TableHead>
              <TableHead className="font-bold text-xs uppercase w-[220px] whitespace-nowrap">Khóa học</TableHead>
              <TableHead className="font-bold text-xs uppercase w-[180px] whitespace-nowrap">Loại quyền & Hạn dùng</TableHead>
              <TableHead className="font-bold text-xs uppercase w-[200px] whitespace-nowrap">Tiến độ học LMS</TableHead>
              <TableHead className="font-bold text-xs uppercase w-[250px] text-right whitespace-nowrap">Thao tác mô phỏng & Gia hạn</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntitlements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-sm text-muted-foreground">
                  Không tìm thấy tài khoản quyền học nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              filteredEntitlements.map((ent) => {
                const expiresAt = new Date(ent.expiresAt);
                const startsAt = new Date(ent.startsAt);
                const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
                const isExpired = ent.status === "EXPIRED" || daysRemaining <= 0;
                const isExpiringSoon = !isExpired && daysRemaining <= 7;
                const lms = getStudentLmsProgress(ent.studentId);

                return (
                  <TableRow key={ent.id} className="hover:bg-muted/30 transition-colors">
                    {/* Student Info */}
                    <TableCell className="whitespace-nowrap">
                      <div className="space-y-0.5 max-w-[180px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-foreground truncate" title={ent.student?.name}>
                            {ent.student?.name}
                          </span>
                          <Badge variant="outline" className="font-mono text-[10px] px-1 py-0 bg-muted/60 shrink-0">
                            {ent.student?.code}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {ent.student?.phone || ent.student?.parent?.phone || "Chưa có SĐT"}
                        </p>
                        {ent.student?.facility && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{ent.student.facility.name.replace("Cơ sở ", "")}</span>
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Course */}
                    <TableCell>
                      <div className="space-y-1 max-w-[220px]">
                        <span className="font-medium text-xs text-foreground block truncate" title={ent.course?.name}>
                          {ent.course?.name}
                        </span>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {ent.course?.code}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Type & Expiration */}
                    <TableCell className="whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          {ent.type === "TRIAL" && (
                            <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold whitespace-nowrap">
                              DÙNG THỬ (TRIAL)
                            </Badge>
                          )}
                          {ent.type === "OFFICIAL" && (
                            <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold whitespace-nowrap">
                              CHÍNH THỨC (OFFICIAL)
                            </Badge>
                          )}
                          {ent.type === "RENEWAL" && (
                            <Badge className="bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30 text-[10px] font-bold whitespace-nowrap">
                              ĐÃ GIA HẠN (RENEWAL)
                            </Badge>
                          )}
                        </div>

                        <div className="text-[11px] text-muted-foreground space-y-0.5 whitespace-nowrap">
                          <div>Hạn đến: {expiresAt.toLocaleDateString("vi-VN")}</div>
                          {isExpired ? (
                            <span className="text-rose-600 font-bold block whitespace-nowrap">Đã hết hạn</span>
                          ) : isExpiringSoon ? (
                            <span className="text-amber-600 dark:text-amber-400 font-bold block animate-pulse whitespace-nowrap">
                              Còn {daysRemaining} ngày (Sắp hết)
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium block whitespace-nowrap">
                              Còn {daysRemaining} ngày
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* LMS Progress */}
                    <TableCell className="whitespace-nowrap">
                      <div className="space-y-2 max-w-[200px]">
                        <div className="flex items-center justify-between text-xs gap-2">
                          <span className="font-semibold text-foreground whitespace-nowrap">
                            Tiến độ: {lms.progress}%
                          </span>
                          {lms.hasFirstLogin ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 whitespace-nowrap shrink-0">
                              ✓ Đã đăng nhập
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                              Chưa đăng nhập
                            </Badge>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              lms.progress === 100
                                ? "bg-emerald-500"
                                : lms.progress >= 50
                                ? "bg-amber-500"
                                : "bg-primary"
                            }`}
                            style={{ width: `${lms.progress}%` }}
                          />
                        </div>

                        <div className="text-[11px] text-muted-foreground whitespace-nowrap truncate">
                          {lms.assignmentsCount > 0
                            ? `Đã hoàn thành ${lms.assignmentsCount} bài học`
                            : "Chưa hoàn thành bài học nào"}
                        </div>
                      </div>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        {/* Simulate LMS Progress */}
                        <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/60 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTriggerLmsEvent(ent.studentId, "lms.first_login")}
                            className="h-7 px-2 text-[11px] hover:bg-primary/10 hover:text-primary gap-1 shrink-0 whitespace-nowrap"
                            title="Mô phỏng Học viên Đăng nhập LMS lần đầu (Mốc Bắt đầu học)"
                          >
                            <Play className="h-3 w-3" />
                            First Login
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleTriggerLmsEvent(ent.studentId, "lms.lesson_completed")}
                            className="h-7 px-2 text-[11px] hover:bg-amber-500/10 hover:text-amber-700 gap-1 shrink-0 whitespace-nowrap"
                            title="Mô phỏng Hoàn thành 1 bài học tiếp theo (+25%)"
                          >
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            +25% Học
                          </Button>
                        </div>

                        {/* Renewal Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedForRenewal(ent);
                            setRenewalDays(30);
                          }}
                          className="h-7 px-2.5 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1 font-semibold shrink-0 whitespace-nowrap"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Gia hạn
                        </Button>

                        {/* Expire / Revoke */}
                        {!isExpired && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleExpireEntitlement(ent.id)}
                            className="h-7 px-2 text-[11px] text-muted-foreground hover:text-rose-600 shrink-0"
                            title="Thu hồi quyền học"
                          >
                            <Lock className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* MODAL 1: CẤP QUYỀN DÙNG THỬ (INSTANT TRIAL PROVISIONING) */}
      <Dialog open={isTrialModalOpen} onOpenChange={setIsTrialModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Đăng ký & Cấp Quyền Dùng Thử Ngay (LMS Trial)
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleProvisionTrial} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Họ và tên học viên *</Label>
              <Input id="name" name="name" placeholder="Nguyễn Thử Nghiệm" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Số điện thoại liên hệ (Phụ huynh / Học viên) *</Label>
              <Input id="phone" name="phone" placeholder="0987654321" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="courseId">Khóa học trải nghiệm *</Label>
                <Select name="courseId" defaultValue={courses[0]?.id}>
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Chọn khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facilityId">Cơ sở đăng ký</Label>
                <Select name="facilityId" defaultValue={availableFacilities[0]?.id}>
                  <SelectTrigger id="facilityId">
                    <SelectValue placeholder="Chọn cơ sở" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFacilities.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trialDays">Thời hạn dùng thử</Label>
              <Select name="trialDays" defaultValue="7">
                <SelectTrigger id="trialDays">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 ngày trải nghiệm (Mặc định)</SelectItem>
                  <SelectItem value="14">14 ngày trải nghiệm (Khóa chuyên sâu)</SelectItem>
                  <SelectItem value="30">30 ngày trải nghiệm đặc biệt (VIP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Mục tiêu học tập / Ghi chú</Label>
              <Input id="notes" name="notes" placeholder="VD: Muốn test chất lượng giáo trình trước khi đóng tiền" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsTrialModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                {isSubmitting ? "Đang tạo tài khoản..." : "Cấp Quyền Ngay"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL KẾT QUẢ CẤP DÙNG THỬ THÀNH CÔNG */}
      {trialSuccessData && (
        <Dialog open={!!trialSuccessData} onOpenChange={() => setTrialSuccessData(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                Cấp Quyền Dùng Thử Thành Công!
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <p className="text-sm text-foreground">
                Hệ thống đã tự động kích hoạt tài khoản LMS và Entitlement cho học viên. Dưới đây là thông tin đăng nhập:
              </p>

              <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã học viên:</span>
                  <span className="font-mono font-bold text-foreground">{trialSuccessData.student_code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tài khoản LMS:</span>
                  <span className="font-mono font-semibold text-foreground">{trialSuccessData.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mật khẩu tạm:</span>
                  <span className="font-mono font-bold text-primary">{trialSuccessData.temp_password}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hạn dùng thử:</span>
                  <span className="font-medium text-amber-700 dark:text-amber-300">
                    {new Date(trialSuccessData.expires_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                🔗 <strong>Link học thử LMS:</strong> {trialSuccessData.access_url}
              </div>

              <DialogFooter className="pt-2">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Chào bạn, đây là thông tin đăng nhập LMS học thử của bạn:\nLink: ${trialSuccessData.access_url}\nTài khoản: ${trialSuccessData.username}\nMật khẩu: ${trialSuccessData.temp_password}`
                    );
                    setFeedbackMsg({ text: "Đã sao chép thông tin gửi học viên!", type: "success" });
                    setTrialSuccessData(null);
                  }}
                  className="bg-primary text-primary-foreground font-semibold gap-1.5 w-full"
                >
                  <Copy className="h-4 w-4" />
                  Sao chép thông tin & Đóng
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL GIA HẠN QUYỀN HỌC (RENEWAL DIALOG) */}
      {selectedForRenewal && (
        <Dialog open={!!selectedForRenewal} onOpenChange={() => setSelectedForRenewal(null)}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Gia Hạn Quyền Học (Renewal)
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1 text-sm">
                <div className="font-bold text-foreground">{selectedForRenewal.student?.name}</div>
                <div className="text-xs text-muted-foreground">{selectedForRenewal.course?.name}</div>
                <div className="text-xs text-muted-foreground">
                  Hạn hiện tại: <strong>{new Date(selectedForRenewal.expiresAt).toLocaleDateString("vi-VN")}</strong>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="renewalDuration">Chọn gói thời gian gia hạn</Label>
                <Select value={String(renewalDays)} onValueChange={(val) => setRenewalDays(parseInt(val || "30"))}>
                  <SelectTrigger id="renewalDuration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Gia hạn 1 tháng (+30 ngày)</SelectItem>
                    <SelectItem value="90">Gia hạn 1 quý (+90 ngày)</SelectItem>
                    <SelectItem value="180">Gia hạn 6 tháng (+180 ngày)</SelectItem>
                    <SelectItem value="365">Gia hạn 1 năm trọn gói (+365 ngày)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                ✓ Trạng thái sẽ được chuyển sang <strong>ACTIVE (RENEWAL)</strong>. Học viên sẽ tiếp tục truy cập LMS không bị gián đoạn.
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setSelectedForRenewal(null)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleConfirmRenewal}
                  disabled={isSubmitting}
                  className="bg-primary text-primary-foreground font-semibold"
                >
                  {isSubmitting ? "Đang cập nhật..." : "Xác Nhận Gia Hạn"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
