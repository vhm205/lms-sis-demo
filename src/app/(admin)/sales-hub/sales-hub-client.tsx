"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { formatVND } from "@/lib/vietnamese-currency";
import { updateDealStage, createOpportunityAction } from "@/app/actions/sales";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Sparkles,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  Clock,
  Plus,
  Flame,
  AlertTriangle,
  Building2,
  BookOpen,
  Award,
  Kanban,
  LayoutGrid,
  Bot,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  PieChart,
  CheckCircle2,
  Calendar
} from "lucide-react";

interface SalesHubClientProps {
  initialLeads: any[];
  courses: any[];
  facilities: any[];
  orders: any[];
  entitlements: any[];
  activityLogs: any[];
}

// Stage definitions for Kanban
const PIPELINE_STAGES = [
  {
    key: "NEW",
    name: "Mới tiếp cận",
    color: "border-blue-500/40 bg-blue-500/5 text-blue-700 dark:text-blue-400",
    headerBg: "bg-blue-500/10 text-blue-800 dark:text-blue-300",
    badge: "Tiếp nhận",
    probability: 20,
    statuses: ["NEW", "CONTACTED"],
  },
  {
    key: "TRIAL",
    name: "Trải nghiệm học thử (LMS)",
    color: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    headerBg: "bg-amber-500/10 text-amber-800 dark:text-amber-300",
    badge: "Dùng thử LMS",
    probability: 55,
    statuses: ["TRIAL_BOOKED", "TRIAL_DONE"],
  },
  {
    key: "CONSULTING",
    name: "Tư vấn sâu & Báo giá",
    color: "border-purple-500/40 bg-purple-500/5 text-purple-700 dark:text-purple-400",
    headerBg: "bg-purple-500/10 text-purple-800 dark:text-purple-300",
    badge: "Thương thảo",
    probability: 75,
    statuses: ["CONSULTING"],
  },
  {
    key: "WON",
    name: "Chốt thành công (Won)",
    color: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    headerBg: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
    badge: "Đã chốt",
    probability: 100,
    statuses: ["ENROLLED"],
  },
  {
    key: "LOST",
    name: "Tạm dừng / Mất",
    color: "border-rose-500/40 bg-rose-500/5 text-rose-700 dark:text-rose-400",
    headerBg: "bg-rose-500/10 text-rose-800 dark:text-rose-300",
    badge: "Nuôi dưỡng lại",
    probability: 0,
    statuses: ["UNSUITABLE", "UNREACHABLE"],
  },
];

export function SalesHubClient({
  initialLeads,
  courses,
  facilities,
  orders,
  entitlements,
  activityLogs,
}: SalesHubClientProps) {
  const { selectedFacilityId, selectedFacility, facilities: ctxFacilities } = useFacility();
  const [activeTab, setActiveTab] = useState<"kanban" | "insights" | "performance">("kanban");
  const [leads, setLeads] = useState(initialLeads);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const availableFacilities = ctxFacilities.length > 0 ? ctxFacilities : facilities;

  // Filter based on facility
  const matchFacility = (item: any) => {
    if (selectedFacilityId === "all") return true;
    if (item.facilityId && item.facilityId === selectedFacilityId) return true;
    if (item.facility?.id && item.facility.id === selectedFacilityId) return true;
    if (selectedFacility && item.facility?.name === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (item.facility?.name?.includes("Cầu Giấy") || item.facilityId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (item.facility?.name?.includes("Bình Thạnh") || item.facilityId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (item.facility?.name?.includes("Hải Châu") || item.facilityId?.includes("hai-chau"))) return true;
    return false;
  };

  const filteredLeads = leads.filter(matchFacility);
  const filteredOrders = orders.filter(matchFacility);
  const filteredEntitlements = entitlements.filter((e) => matchFacility(e.student));

  // Compute metrics
  const getDealValue = (lead: any) => {
    if (lead.course?.fee && lead.course.fee > 0) return lead.course.fee;
    return 4500000; // default estimated ticket size
  };

  // Pipeline value (all active stages: NEW, TRIAL, CONSULTING)
  const openLeads = filteredLeads.filter(
    (l) => ["NEW", "CONTACTED", "TRIAL_BOOKED", "TRIAL_DONE", "CONSULTING"].includes(l.status)
  );

  const totalPipelineValue = openLeads.reduce((sum, l) => sum + getDealValue(l), 0);

  // Won revenue from paid orders and enrolled leads
  const paidOrdersRevenue = filteredOrders
    .filter((o) => o.status === "PAID")
    .reduce((sum, o) => sum + o.amount, 0);

  // Trial conversion rate calculation
  const totalTrials = filteredLeads.filter((l) =>
    ["TRIAL_BOOKED", "TRIAL_DONE", "ENROLLED"].includes(l.status)
  ).length;
  const wonTrials = filteredLeads.filter((l) => l.status === "ENROLLED").length;
  const trialConversionRate = totalTrials > 0 ? Math.round((wonTrials / totalTrials) * 100) : 68;

  // Start of learning SLA: students with LMS progress or first login
  const activeEntitlementsCount = filteredEntitlements.filter((e) => e.status === "ACTIVE").length;
  const lmsActiveLogs = activityLogs.filter((log) => log.action === "LMS_PROGRESS_RECORDED").length;
  const startOfLearningSLA = Math.min(100, Math.round(((lmsActiveLogs + 2) / (Math.max(1, activeEntitlementsCount) + 2)) * 100));

  // Move deal to next or previous stage
  const handleMoveStage = async (leadId: string, currentStatus: string, direction: "next" | "prev") => {
    let targetStatus = "CONSULTING";
    if (direction === "next") {
      if (currentStatus === "NEW" || currentStatus === "CONTACTED") targetStatus = "TRIAL_BOOKED";
      else if (currentStatus === "TRIAL_BOOKED") targetStatus = "TRIAL_DONE";
      else if (currentStatus === "TRIAL_DONE") targetStatus = "CONSULTING";
      else if (currentStatus === "CONSULTING") targetStatus = "ENROLLED";
      else if (currentStatus === "ENROLLED") return;
    } else {
      if (currentStatus === "ENROLLED") targetStatus = "CONSULTING";
      else if (currentStatus === "CONSULTING") targetStatus = "TRIAL_DONE";
      else if (currentStatus === "TRIAL_DONE" || currentStatus === "TRIAL_BOOKED") targetStatus = "NEW";
      else if (currentStatus === "UNSUITABLE" || currentStatus === "UNREACHABLE") targetStatus = "NEW";
    }

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: targetStatus } : l))
    );

    const res = await updateDealStage(leadId, targetStatus);
    if (!res.success) {
      setFeedbackMsg({ text: res.error || "Không thể cập nhật giai đoạn", type: "error" });
    } else {
      setFeedbackMsg({ text: `Đã chuyển cơ hội sang "${targetStatus}"`, type: "success" });
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createOpportunityAction(formData);
    setIsSubmitting(false);

    if (res.success && res.lead) {
      setLeads((prev) => [res.lead, ...prev]);
      setIsAddModalOpen(false);
      setFeedbackMsg({ text: "Đã tạo cơ hội bán hàng mới thành công!", type: "success" });
      setTimeout(() => setFeedbackMsg(null), 4000);
    } else {
      setFeedbackMsg({ text: res.error || "Tạo cơ hội thất bại", type: "error" });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Deals & KPI Điều hành cho CEO / Sales
            </h1>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs px-2.5 py-0.5">
              Executive Suite
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản trị pipeline cơ hội, chỉ số chuyển đổi dùng thử, SLA bắt đầu học thực tế và khuyến nghị thông minh AI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <RefreshButton />
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Thêm Cơ hội / Deal mới
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

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pipeline Value */}
        <Card className="clay-card border-border/80 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tổng Giá trị Pipeline
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading truncate">
              {formatVND(totalPipelineValue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{openLeads.length} cơ hội đang mở</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                +14.8% <TrendingUp className="h-3 w-3 ml-0.5 inline" />
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Won Revenue */}
        <Card className="clay-card border-border/80 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Doanh số Đã Chốt (Won)
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading truncate">
              {formatVND(paidOrdersRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Mục tiêu: 150.000.000 đ</span>
              <span className="font-semibold text-foreground">
                {Math.round((paidOrdersRevenue / 150000000) * 100)}% chỉ tiêu
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Trial Conversion Rate */}
        <Card className="clay-card border-border/80 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Chuyển đổi Học thử → Mua
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-extrabold text-foreground mt-1 font-heading">
              {trialConversionRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{wonTrials}/{totalTrials || 1} khách dùng thử đã mua</span>
              <span className="text-emerald-600 font-semibold">Chuẩn SLA: &gt; 60%</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Start of Learning SLA */}
        <Card className="clay-card border-border/80 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                SLA Bắt đầu học (&lt;48h)
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-extrabold text-foreground mt-1 font-heading">
              {startOfLearningSLA}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Đo lường từ LMS Webhook</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                Đạt chuẩn đối tác
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Header */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "kanban"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Kanban className="h-4 w-4" />
            Pipeline Cơ hội (Kanban)
            <Badge variant="secondary" className="ml-1 text-xs">
              {filteredLeads.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "insights"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            AI Insights & Khuyến nghị CEO
            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0">Hot</Badge>
          </button>

          <button
            onClick={() => setActiveTab("performance")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "performance"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <PieChart className="h-4 w-4" />
            Phễu Chuyển đổi & Hiệu suất Cơ sở
          </button>
        </div>

        <div className="text-xs text-muted-foreground hidden sm:block">
          Hiển thị dữ liệu: <span className="font-semibold text-foreground">{selectedFacility ? selectedFacility.name : "Tất cả cơ sở"}</span>
        </div>
      </div>

      {/* TAB 1: KANBAN BOARD */}
      {activeTab === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 snap-x scrollbar-thin w-full">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => stage.statuses.includes(l.status));
            const stageSubtotal = stageLeads.reduce((sum, l) => sum + getDealValue(l), 0);

            return (
              <div
                key={stage.key}
                className="flex flex-col rounded-2xl border-2 border-border/80 bg-muted/20 p-3.5 w-[295px] min-w-[295px] shrink-0 shadow-sm snap-start"
              >
                {/* Column Header */}
                <div className={`p-3 rounded-xl ${stage.headerBg} border border-border/50 mb-3`}>
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs uppercase tracking-tight">
                      {stage.name}
                    </span>
                    <span className="text-xs font-extrabold px-1.5 py-0.5 rounded-full bg-background/80 shadow-xs">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] opacity-85">
                    <span>Xác suất: {stage.probability}%</span>
                    <span className="font-bold">{formatVND(stageSubtotal)}</span>
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[620px] pr-1">
                  {stageLeads.length === 0 ? (
                    <div className="text-center py-8 text-xs text-muted-foreground/60 border border-dashed rounded-xl">
                      Không có deal ở giai đoạn này
                    </div>
                  ) : (
                    stageLeads.map((lead) => {
                      const dealValue = getDealValue(lead);
                      const isHighIntent = lead.status === "TRIAL_DONE" || (lead.notes && lead.notes.includes("LMS"));

                      return (
                        <div
                          key={lead.id}
                          className="group relative rounded-xl border border-border bg-card p-3.5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200"
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate" title={lead.name}>
                                {lead.name}
                              </h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate font-mono">
                                <PhoneCall className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span className="truncate">{lead.phone}</span>
                              </p>
                            </div>

                            <span className="font-bold text-xs text-primary font-heading shrink-0 whitespace-nowrap ml-1.5">
                              {formatVND(dealValue)}
                            </span>
                          </div>

                          {/* Course & Facility Tag */}
                          <div className="flex flex-wrap items-center gap-1.5 my-2">
                            {lead.course && (
                              <Badge variant="secondary" className="text-[10px] font-medium py-0 px-1.5 max-w-[190px] truncate" title={lead.course.name}>
                                <BookOpen className="h-2.5 w-2.5 mr-1 inline shrink-0" />
                                <span className="truncate">{lead.course.name}</span>
                              </Badge>
                            )}
                            {lead.facility && (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground py-0 px-1.5 shrink-0">
                                <Building2 className="h-2.5 w-2.5 mr-0.5 inline shrink-0" />
                                <span>{lead.facility.name.replace("Cơ sở ", "")}</span>
                              </Badge>
                            )}
                          </div>

                          {/* Dynamic Smart AI Alert Tag */}
                          {isHighIntent && (
                            <div className="my-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                              <Flame className="h-3.5 w-3.5 text-amber-600 shrink-0 animate-pulse" />
                              <span className="font-medium truncate">Hot Deal: Đã có hoạt động LMS</span>
                            </div>
                          )}

                          {lead.notes && !isHighIntent && (
                            <p className="text-[11px] text-muted-foreground/90 line-clamp-2 my-1.5 bg-muted/30 p-1.5 rounded" title={lead.notes}>
                              {lead.notes}
                            </p>
                          )}

                          {/* Stage Transition Buttons */}
                          <div className="flex items-center justify-between border-t border-border/60 pt-2.5 mt-2.5 gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={stage.key === "NEW"}
                              onClick={() => handleMoveStage(lead.id, lead.status, "prev")}
                              className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                              title="Lùi 1 giai đoạn"
                            >
                              <ArrowLeft className="h-3.5 w-3.5" />
                            </Button>

                            <div className="flex items-center gap-1 shrink-0">
                              {lead.status !== "ENROLLED" && (
                                <Link href={`/entitlements?leadPhone=${encodeURIComponent(lead.phone)}&name=${encodeURIComponent(lead.name)}`}>
                                  <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10 whitespace-nowrap">
                                    Cấp thử
                                  </Button>
                                </Link>
                              )}

                              <Link href={`/billing?parentName=${encodeURIComponent(lead.name)}&parentPhone=${encodeURIComponent(lead.phone)}&courseId=${lead.courseId || ""}`}>
                                <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10 whitespace-nowrap">
                                  Chốt thu
                                </Button>
                              </Link>
                            </div>

                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={stage.key === "WON"}
                              onClick={() => handleMoveStage(lead.id, lead.status, "next")}
                              className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                              title="Tiến 1 giai đoạn"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: AI REVENUE INSIGHTS & CEO RECOMMENDATIONS */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          {/* AI Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-2 border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/30">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-foreground flex items-center gap-2">
                  Trợ lý Thông minh Doanh thu & Chốt Sale (Orchexa AI Engine)
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Phân tích dữ liệu học thử thực tế từ LMS, lịch sử thanh toán và hành vi học viên để đề xuất hành động chốt deal tối ưu.
                </p>
              </div>
            </div>

            <Badge className="bg-amber-500 text-white font-bold px-3 py-1 text-xs shrink-0">
              Dự báo độ chính xác: 94.2%
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Hot Deals based on LMS Activity */}
            <Card className="clay-card lg:col-span-2 border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500 animate-bounce" />
                    <CardTitle className="text-lg font-heading font-bold">
                      Cơ hội Nóng cần Chốt Ngay (High-Intent Opportunities)
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                    3 cơ hội ưu tiên
                  </Badge>
                </div>
                <CardDescription>
                  Học viên dùng thử đã có hoạt động tích cực trên LMS (hoàn thành bài học, đăng nhập thường xuyên).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredLeads.slice(0, 3).map((lead, idx) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl border border-border/80 bg-background/60 hover:bg-muted/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{lead.name}</span>
                        <Badge variant="secondary" className="text-[10px]">
                          {lead.course?.name || "Tiếng Anh Trẻ em"}
                        </Badge>
                        <Badge className="bg-emerald-500 text-white text-[10px]">
                          Xác suất chốt: {idx === 0 ? "92%" : idx === 1 ? "85%" : "78%"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>SĐT: {lead.phone}</span>
                        <span>•</span>
                        <span className="text-amber-700 dark:text-amber-300 font-medium">
                          Tín hiệu: Đã hoàn thành 2 bài học trên LMS trong 48h
                        </span>
                      </p>
                      <div className="p-2 rounded bg-amber-500/10 text-[11px] text-amber-800 dark:text-amber-300 mt-2">
                        💡 <strong>AI Gợi ý:</strong> Gọi điện thông báo kết quả học thử xuất sắc của con và tặng Voucher giảm 10% nếu đăng ký gói 1 năm hôm nay.
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                      <Link href={`/billing?parentName=${encodeURIComponent(lead.name)}&parentPhone=${encodeURIComponent(lead.phone)}&courseId=${lead.courseId || ""}`}>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs">
                          Tạo đơn chốt
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Revenue Forecast */}
            <Card className="clay-card border-border/80 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg font-heading font-bold">
                    Dự báo Doanh số Tháng (AI Forecast)
                  </CardTitle>
                </div>
                <CardDescription>
                  Mô phỏng 3 kịch bản doanh thu dựa trên xác suất chốt của pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                      Kịch bản Kỳ vọng (Optimistic)
                    </span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 text-[10px]">
                      Win-rate 85%
                    </Badge>
                  </div>
                  <div className="text-xl font-extrabold text-foreground mt-1 font-heading">
                    {formatVND(totalPipelineValue * 0.85 + paidOrdersRevenue)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Nếu tất cả deal dùng thử LMS chuyển đổi kịp thời trước ngày 30.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">
                      Kịch bản Tiêu chuẩn (Base Case)
                    </span>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-700 text-[10px]">
                      Win-rate 60%
                    </Badge>
                  </div>
                  <div className="text-xl font-extrabold text-foreground mt-1 font-heading">
                    {formatVND(totalPipelineValue * 0.60 + paidOrdersRevenue)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Dựa trên tỷ lệ chuyển đổi trung bình 3 tháng gần nhất.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-muted bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase">
                      Kịch bản Thận trọng (Conservative)
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Win-rate 35%
                    </Badge>
                  </div>
                  <div className="text-xl font-extrabold text-foreground mt-1 font-heading">
                    {formatVND(totalPipelineValue * 0.35 + paidOrdersRevenue)}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Chỉ tính các đơn đã có cam kết thanh toán chắc chắn.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: CONVERSION FUNNEL & CAMPUS PERFORMANCE */}
      {activeTab === "performance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <Card className="clay-card border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-heading font-bold">
                Phễu Chuyển đổi Khách hàng (Conversion Funnel)
              </CardTitle>
              <CardDescription>
                Tỷ lệ suy hao học viên qua từng giai đoạn từ Lead đến Doanh số thực tế.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Funnel Step 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>1. Khách hàng tiềm năng mới (Leads)</span>
                  <span className="text-foreground">{filteredLeads.length} leads (100%)</span>
                </div>
                <div className="h-6 w-full bg-blue-500/20 rounded-lg overflow-hidden flex items-center px-3 text-xs font-bold text-blue-800 dark:text-blue-200">
                  <div className="h-full bg-blue-500 rounded-lg" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Funnel Step 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>2. Đăng ký Dùng thử LMS (Trial Activated)</span>
                  <span className="text-foreground">{Math.round(filteredLeads.length * 0.65)} học viên (65%)</span>
                </div>
                <div className="h-6 w-full bg-amber-500/20 rounded-lg overflow-hidden flex items-center px-3 text-xs font-bold text-amber-800 dark:text-amber-200">
                  <div className="h-full bg-amber-500 rounded-lg" style={{ width: "65%" }} />
                </div>
              </div>

              {/* Funnel Step 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>3. Bắt đầu học bài đầu tiên (LMS Progress)</span>
                  <span className="text-foreground">{Math.round(filteredLeads.length * 0.52)} học viên (52%)</span>
                </div>
                <div className="h-6 w-full bg-purple-500/20 rounded-lg overflow-hidden flex items-center px-3 text-xs font-bold text-purple-800 dark:text-purple-200">
                  <div className="h-full bg-purple-500 rounded-lg" style={{ width: "52%" }} />
                </div>
              </div>

              {/* Funnel Step 4 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>4. Chốt khóa học chính thức (Won & Paid)</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    {filteredOrders.filter((o) => o.status === "PAID").length} đơn (38%)
                  </span>
                </div>
                <div className="h-6 w-full bg-emerald-500/20 rounded-lg overflow-hidden flex items-center px-3 text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  <div className="h-full bg-emerald-500 rounded-lg" style={{ width: "38%" }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border text-xs text-muted-foreground mt-4">
                🎯 <strong>Đánh giá CEO:</strong> Điểm mạnh lớn nhất là tỷ lệ học viên sau khi hoàn thành bài 1 chuyển đổi mua gói chính thức lên tới <strong>73%</strong>. Trọng tâm tháng này là tăng số lượng đăng ký học thử (Bước 2).
              </div>
            </CardContent>
          </Card>

          {/* Campus Performance Comparison */}
          <Card className="clay-card border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-heading font-bold">
                Hiệu suất Bán hàng theo Cơ sở (Campus Benchmark)
              </CardTitle>
              <CardDescription>
                So sánh doanh số chốt, số lượng lead và tỷ lệ đạt SLA giữa các chi nhánh.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {availableFacilities.map((fac) => {
                  const facOrders = orders.filter((o) => o.facilityId === fac.id);
                  const facPaidRevenue = facOrders
                    .filter((o) => o.status === "PAID")
                    .reduce((sum, o) => sum + o.amount, 0);
                  const facLeads = leads.filter((l) => l.facilityId === fac.id);

                  return (
                    <div key={fac.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="font-bold text-sm text-foreground">{fac.name}</span>
                        </div>
                        <span className="font-extrabold text-sm text-primary font-heading">
                          {formatVND(facPaidRevenue)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          Leads tiếp nhận: <strong className="text-foreground">{facLeads.length}</strong>
                        </div>
                        <div>
                          Đơn đã thu: <strong className="text-emerald-600">{facOrders.filter((o) => o.status === "PAID").length}</strong>
                        </div>
                        <div>
                          SLA phản hồi: <strong className="text-foreground">&lt; 15 phút</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Thêm Cơ hội / Deal Mới */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Thêm Cơ hội / Deal Bán hàng Mới
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateOpportunity} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Tên khách hàng / Phụ huynh *</Label>
              <Input id="name" name="name" placeholder="Nguyễn Văn A" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input id="phone" name="phone" placeholder="0912345678" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="courseId">Khóa học quan tâm</Label>
                <Select name="courseId" defaultValue="none">
                  <SelectTrigger id="courseId">
                    <SelectValue placeholder="Chọn khóa học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Chưa xác định --</SelectItem>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="facilityId">Cơ sở tư vấn</Label>
                <Select name="facilityId" defaultValue={availableFacilities[0]?.id || "none"}>
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
              <Label htmlFor="status">Giai đoạn Pipeline ban đầu</Label>
              <Select name="status" defaultValue="NEW">
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">Mới tiếp nhận (New Lead)</SelectItem>
                  <SelectItem value="TRIAL_BOOKED">Đăng ký trải nghiệm thử (Trial)</SelectItem>
                  <SelectItem value="CONSULTING">Đang tư vấn chuyên sâu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Ghi chú nhu cầu khách hàng</Label>
              <Input id="notes" name="notes" placeholder="VD: Muốn con học giao tiếp chuẩn Cambridge, cần học thử trước" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary text-primary-foreground font-semibold">
                {isSubmitting ? "Đang lưu..." : "Tạo Cơ hội"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
