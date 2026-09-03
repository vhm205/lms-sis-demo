"use client";

import React, { useState, useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Headphones,
  Calendar,
  AlertCircle,
  FileText,
  Plus,
  Search,
  Check,
  X,
  Eye,
  Trash2,
  Phone,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MessageSquareQuote,
  Flame,
  Layers,
} from "lucide-react";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
  getSupportTypeLabel,
  SUPPORT_TYPE_MAP,
  SUPPORT_TYPE_OPTIONS,
  getSupportStatusLabel,
  SUPPORT_STATUS_MAP,
  SUPPORT_STATUS_OPTIONS,
  getRequestStatusLabel,
  REQUEST_STATUS_MAP,
  REQUEST_STATUS_OPTIONS,
  PRIORITY_MAP,
  PRIORITY_OPTIONS,
  getPriorityLabel,
} from "@/lib/constants";
import {
  refreshRequestsAction,
  updateSupportRequestStatus,
  updateSupportRequest,
  createSupportRequest,
  deleteSupportRequest,
  updateMakeUpRequestStatus,
  updateMakeUpRequest,
  createMakeUpRequest,
  deleteMakeUpRequest,
} from "@/app/actions/requests";

export function RequestsClient({
  supportRequests,
  makeUpRequests,
  users = [],
  students = [],
  upcomingSchedules = [],
}: {
  supportRequests: any[];
  makeUpRequests: any[];
  users?: any[];
  students?: any[];
  upcomingSchedules?: any[];
}) {
  const { selectedFacilityId, selectedFacility } = useFacility();
  const [isPending, startTransition] = useTransition();

  // Active view tab
  const [activeTab, setActiveTab] = useState<"all" | "support" | "makeup">("all");

  // Search and status filter states
  const [supportSearch, setSupportSearch] = useState("");
  const [supportStatusFilter, setSupportStatusFilter] = useState("all");
  const [makeupSearch, setMakeupSearch] = useState("");
  const [makeupStatusFilter, setMakeupStatusFilter] = useState("all");

  // Interactive Modals
  const [selectedSupport, setSelectedSupport] = useState<any | null>(null);
  const [isAddSupportOpen, setIsAddSupportOpen] = useState(false);

  const [selectedMakeup, setSelectedMakeup] = useState<any | null>(null);
  const [isAddMakeupOpen, setIsAddMakeupOpen] = useState(false);

  // Form states for creating make-up request
  const [newMakeupStudentId, setNewMakeupStudentId] = useState("");

  // Processing ID indicator for individual row actions
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

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

  // Filter Support Requests
  const facilitySupport = supportRequests.filter(matchFacility);
  const filteredSupport = facilitySupport.filter((req) => {
    const matchStatus = supportStatusFilter === "all" || req.status === supportStatusFilter;
    const q = supportSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      req.student?.name?.toLowerCase().includes(q) ||
      req.student?.code?.toLowerCase().includes(q) ||
      req.content?.toLowerCase().includes(q) ||
      req.notes?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Filter MakeUp Requests
  const facilityMakeup = makeUpRequests.filter(matchFacility);
  const filteredMakeup = facilityMakeup.filter((req) => {
    const matchStatus = makeupStatusFilter === "all" || req.status === makeupStatusFilter;
    const q = makeupSearch.toLowerCase().trim();
    const matchSearch =
      !q ||
      req.student?.name?.toLowerCase().includes(q) ||
      req.student?.code?.toLowerCase().includes(q) ||
      req.missedSchedule?.class?.name?.toLowerCase().includes(q) ||
      req.targetSchedule?.class?.name?.toLowerCase().includes(q) ||
      req.notes?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

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

  // Summary counts
  const newSupportCount = facilitySupport.filter((r) => r.status === "NEW").length;
  const inProgressSupportCount = facilitySupport.filter((r) => r.status === "IN_PROGRESS" || r.status === "PENDING").length;
  const resolvedSupportCount = facilitySupport.filter((r) => r.status === "RESOLVED").length;

  const pendingMakeupCount = facilityMakeup.filter((r) => r.status === "PENDING").length;
  const approvedMakeupCount = facilityMakeup.filter((r) => r.status === "APPROVED").length;

  // Available students for facility
  const availableStudents = students.filter((s) => {
    if (selectedFacilityId === "all") return true;
    return (
      s.facilityId === selectedFacilityId ||
      s.facility?.name === selectedFacility?.name ||
      (selectedFacilityId.includes("cau-giay") && s.facility?.name?.includes("Cầu Giấy")) ||
      (selectedFacilityId.includes("binh-thanh") && s.facility?.name?.includes("Bình Thạnh")) ||
      (selectedFacilityId.includes("hai-chau") && s.facility?.name?.includes("Hải Châu"))
    );
  });

  // Selected student schedules for creating make-up request
  const selectedStudentObj = students.find((s) => s.id === newMakeupStudentId);
  const studentPastSchedules = selectedStudentObj
    ? selectedStudentObj.classes?.flatMap((c: any) => c.schedules || []) || []
    : [];

  // ================= ACTION HANDLERS =================

  // Quick update support request status
  const handleSupportStatusChange = async (id: string, newStatus: string) => {
    setProcessingId(id);
    startTransition(async () => {
      const res = await updateSupportRequestStatus(id, newStatus);
      setProcessingId(null);
      if (res.success) {
        showToast(`Đã chuyển trạng thái sang "${getSupportStatusLabel(newStatus)}"`);
      } else {
        showToast(res.error || "Có lỗi xảy ra", "error");
      }
    });
  };

  // Delete support request
  const handleDeleteSupport = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phiếu yêu cầu hỗ trợ này?")) return;
    setProcessingId(id);
    startTransition(async () => {
      const res = await deleteSupportRequest(id);
      setProcessingId(null);
      if (res.success) {
        showToast("Đã xóa phiếu yêu cầu hỗ trợ");
        if (selectedSupport?.id === id) setSelectedSupport(null);
      } else {
        showToast(res.error || "Có lỗi xảy ra khi xóa", "error");
      }
    });
  };

  // Full update support request from detail modal
  const handleSaveSupportDetail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupport) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const status = formData.get("status") as string;
    const priority = formData.get("priority") as string;
    const assigneeId = (formData.get("assigneeId") as string) || null;
    const notes = formData.get("notes") as string;

    setProcessingId(selectedSupport.id);
    startTransition(async () => {
      const res = await updateSupportRequest(selectedSupport.id, {
        status,
        priority,
        assigneeId,
        notes,
      });
      setProcessingId(null);
      if (res.success) {
        showToast("Cập nhật phiếu hỗ trợ thành công");
        setSelectedSupport(null);
      } else {
        showToast(res.error || "Có lỗi xảy ra", "error");
      }
    });
  };

  // Create new support request
  const handleCreateSupport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const studentId = formData.get("studentId") as string;
    const type = formData.get("type") as string;
    const priority = formData.get("priority") as string;
    const assigneeId = (formData.get("assigneeId") as string) || null;
    const content = formData.get("content") as string;
    const notes = formData.get("notes") as string;

    startTransition(async () => {
      const res = await createSupportRequest({
        studentId,
        type,
        priority,
        assigneeId,
        content,
        notes,
      });
      if (res.success) {
        showToast("Đã tạo phiếu yêu cầu hỗ trợ mới thành công");
        setIsAddSupportOpen(false);
        form.reset();
      } else {
        showToast(res.error || "Có lỗi xảy ra khi tạo yêu cầu", "error");
      }
    });
  };

  // Quick update make-up request status (Approve / Reject / Pending)
  const handleMakeupStatusChange = async (id: string, newStatus: string) => {
    setProcessingId(id);
    startTransition(async () => {
      const res = await updateMakeUpRequestStatus(id, newStatus);
      setProcessingId(null);
      if (res.success) {
        if (newStatus === "APPROVED") {
          showToast("Đã duyệt ca bù và cập nhật danh sách điểm danh lớp!");
        } else if (newStatus === "REJECTED") {
          showToast("Đã từ chối yêu cầu học bù.");
        } else {
          showToast(`Đã chuyển trạng thái sang "${getRequestStatusLabel(newStatus)}"`);
        }
      } else {
        showToast(res.error || "Có lỗi xảy ra", "error");
      }
    });
  };

  // Delete make-up request
  const handleDeleteMakeup = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa yêu cầu học bù này?")) return;
    setProcessingId(id);
    startTransition(async () => {
      const res = await deleteMakeUpRequest(id);
      setProcessingId(null);
      if (res.success) {
        showToast("Đã xóa yêu cầu học bù");
        if (selectedMakeup?.id === id) setSelectedMakeup(null);
      } else {
        showToast(res.error || "Có lỗi xảy ra khi xóa", "error");
      }
    });
  };

  // Full update make-up request from modal
  const handleSaveMakeupDetail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMakeup) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    const status = formData.get("status") as string;
    const targetScheduleId = formData.get("targetScheduleId") as string;
    const notes = formData.get("notes") as string;

    setProcessingId(selectedMakeup.id);
    startTransition(async () => {
      const res = await updateMakeUpRequest(selectedMakeup.id, {
        status,
        targetScheduleId,
        notes,
      });
      setProcessingId(null);
      if (res.success) {
        showToast("Cập nhật yêu cầu học bù thành công");
        setSelectedMakeup(null);
      } else {
        showToast(res.error || "Có lỗi xảy ra", "error");
      }
    });
  };

  // Create new make-up request
  const handleCreateMakeup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const studentId = formData.get("studentId") as string;
    const missedScheduleId = formData.get("missedScheduleId") as string;
    const targetScheduleId = formData.get("targetScheduleId") as string;
    const notes = formData.get("notes") as string;
    const status = (formData.get("status") as string) || "PENDING";

    startTransition(async () => {
      const res = await createMakeUpRequest({
        studentId,
        missedScheduleId,
        targetScheduleId,
        notes,
        status,
      });
      if (res.success) {
        showToast("Đã tạo yêu cầu đăng ký học bù thành công");
        setIsAddMakeupOpen(false);
        setNewMakeupStudentId("");
        form.reset();
      } else {
        showToast(res.error || "Có lỗi xảy ra khi tạo yêu cầu", "error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-12 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-100"
              : "bg-rose-50 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-100"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-bold font-heading">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
            Yêu cầu Hỗ trợ & Học bù
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Tiếp nhận, phê duyệt và xử lý các phiếu yêu cầu từ phụ huynh và học sinh (qua Website & Trợ lý AI Orchexa).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={() => setIsAddSupportOpen(true)}
            className="h-10 px-3.5 rounded-2xl text-xs font-extrabold gap-1.5 bg-[#FDF2F8] text-[#DB2777] border-2 border-[#FBCFE8] hover:bg-[#FCE7F3] dark:bg-[#381B26] dark:text-[#F472B6] dark:border-[#5A253A] cursor-pointer shadow-xs"
          >
            <Plus className="h-4 w-4" /> Tạo phiếu hỗ trợ
          </Button>

          <Button
            onClick={() => setIsAddMakeupOpen(true)}
            className="clay-btn-primary h-10 px-4 rounded-2xl text-xs font-extrabold gap-1.5 cursor-pointer shadow-xs"
          >
            <Calendar className="h-4 w-4" /> Đăng ký ca học bù
          </Button>

          <RefreshButton
            variant="outline"
            size="default"
            showLabel
            label="Làm mới"
            onRefresh={refreshRequestsAction}
            className="h-10 px-3.5 bg-card hover:bg-muted/80 shadow-2xs text-xs font-extrabold gap-1.5 shrink-0"
          />
        </div>
      </div>

      {/* 2 Quick Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="clay-card p-5 flex items-center justify-between border-2">
          <div className="space-y-1">
            <span className="text-xs text-[#DB2777] font-bold uppercase tracking-wider font-heading">
              Phiếu hỗ trợ & Nghỉ phép mới
            </span>
            <div className="text-2xl font-black font-heading text-foreground">
              {newSupportCount} phiếu cần xử lý
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {inProgressSupportCount} đang xử lý • {resolvedSupportCount} đã hoàn tất
            </div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#FDF2F8] text-[#DB2777] shadow-sm">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="clay-card p-5 flex items-center justify-between border-2">
          <div className="space-y-1">
            <span className="text-xs text-[#D97736] font-bold uppercase tracking-wider font-heading">
              Yêu cầu đăng ký học bù
            </span>
            <div className="text-2xl font-black font-heading text-foreground">
              {pendingMakeupCount} ca chờ xếp lớp
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {approvedMakeupCount} ca đã xếp lớp bù thành công
            </div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#FFF0E6] text-[#D97736] shadow-sm">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* View Mode Switcher / Tab Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 p-1.5 rounded-2xl bg-card border-2 border-border/80 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant={activeTab === "all" ? "default" : "ghost"}
            onClick={() => setActiveTab("all")}
            className={`h-8 px-3 rounded-xl text-xs font-bold gap-1.5 transition-all ${
              activeTab === "all" ? "clay-btn-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Tất cả ({filteredSupport.length + filteredMakeup.length})
          </Button>
          <Button
            size="sm"
            variant={activeTab === "support" ? "default" : "ghost"}
            onClick={() => setActiveTab("support")}
            className={`h-8 px-3 rounded-xl text-xs font-bold gap-1.5 transition-all ${
              activeTab === "support" ? "clay-btn-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-[#DB2777]" />
            Yêu cầu chung & Nghỉ phép
            <Badge variant="pink" className="text-[10px] px-1.5 py-0 h-4 font-mono font-black ml-0.5">
              {filteredSupport.length}
            </Badge>
          </Button>
          <Button
            size="sm"
            variant={activeTab === "makeup" ? "default" : "ghost"}
            onClick={() => setActiveTab("makeup")}
            className={`h-8 px-3 rounded-xl text-xs font-bold gap-1.5 transition-all ${
              activeTab === "makeup" ? "clay-btn-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-[#D97736]" />
            Đăng ký ca học bù
            <Badge variant="orange" className="text-[10px] px-1.5 py-0 h-4 font-mono font-black ml-0.5">
              {filteredMakeup.length}
            </Badge>
          </Button>
        </div>

        <div className="text-[11px] font-semibold text-muted-foreground px-2 hidden sm:block">
          {activeTab === "all" ? "Chế độ xem 2 bảng song song" : "Chế độ xem chi tiết toàn màn hình"}
        </div>
      </div>

      {/* Split Grid for Support vs Makeup */}
      <div className={`grid gap-6 ${activeTab === "all" ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1"}`}>
        {/* ================= CARD 1: GENERAL & LEAVE SUPPORT REQUESTS ================= */}
        {(activeTab === "all" || activeTab === "support") && (
          <Card className="clay-card p-0 overflow-hidden flex flex-col border-2">
          <CardHeader className="border-b-2 border-border/70 pb-3 bg-muted/30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="clay-icon-tile h-8 w-8 bg-[#FDF2F8] text-[#DB2777]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold font-heading">
                    Yêu cầu chung & Nghỉ phép
                  </CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="pink" className="text-xs font-bold font-heading">
                  {filteredSupport.length} phiếu
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setIsAddSupportOpen(true)}
                  className="rounded-xl gap-1 text-[11px] font-bold text-[#DB2777] border-[#FBCFE8] hover:bg-[#FDF2F8]"
                >
                  <Plus className="h-3 w-3" /> Thêm
                </Button>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Tìm học viên, nội dung..."
                  value={supportSearch}
                  onChange={(e) => setSupportSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-xl bg-card border-2 font-medium"
                />
              </div>

              <select
                value={supportStatusFilter}
                onChange={(e) => setSupportStatusFilter(e.target.value)}
                className="h-8 rounded-xl border-2 text-xs font-bold px-2 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="all">Tất cả trạng thái</option>
                {SUPPORT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            <div className="overflow-x-auto">
              <Table className="min-w-[560px]">
                <TableHeader className="bg-muted/40 border-b border-border/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-heading font-extrabold text-xs w-[140px]">Học Viên</TableHead>
                    <TableHead className="font-heading font-extrabold text-xs">Loại / Nội Dung</TableHead>
                    <TableHead className="w-[140px] font-heading font-extrabold text-xs">Trạng Thái</TableHead>
                    <TableHead className="w-[110px] text-right font-heading font-extrabold text-xs">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSupport.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-36 text-center text-xs text-muted-foreground font-semibold">
                        Không tìm thấy yêu cầu hỗ trợ nào phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSupport.map((req) => (
                      <TableRow
                        key={req.id}
                        className="hover:bg-[#FAF6F0]/60 dark:hover:bg-[#28221D]/60 transition-colors"
                      >
                        {/* Student */}
                        <TableCell>
                          <div className="space-y-0.5 py-1">
                            <div className="font-bold text-sm text-foreground font-heading leading-snug">
                              {req.student?.name || "Học viên"}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono font-semibold">
                              {req.student?.code || "N/A"}
                            </div>
                            {req.student?.parent && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                                PH: {req.student.parent.name}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Type & Content */}
                        <TableCell className="space-y-1.5 py-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge
                              variant={SUPPORT_TYPE_MAP[req.type]?.badgeVariant || "aqua"}
                              className="text-[10px] px-2 py-0.5 font-bold"
                            >
                              {getSupportTypeLabel(req.type)}
                            </Badge>

                            {req.priority === "HIGH" && (
                              <Badge variant="pink" className="text-[10px] px-2 py-0.5 font-black gap-0.5">
                                <Flame className="h-3 w-3 inline text-rose-500" /> Khẩn cấp
                              </Badge>
                            )}

                            <span className="text-[11px] text-muted-foreground font-medium">
                              {new Date(req.createdAt).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="text-xs text-foreground leading-relaxed font-medium line-clamp-2">
                            {req.content}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                            {req.assignee && (
                              <span className="font-semibold text-primary inline-flex items-center gap-1">
                                <User className="h-3 w-3" /> {req.assignee.name}
                              </span>
                            )}
                            {req.notes && (
                              <span className="italic text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded text-[10px] font-medium truncate max-w-xs">
                                💬 {req.notes}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Status Dropdown */}
                        <TableCell>
                          <select
                            value={req.status}
                            disabled={processingId === req.id}
                            onChange={(e) => handleSupportStatusChange(req.id, e.target.value)}
                            className={`w-full h-8 text-[11px] font-black rounded-xl border-2 px-2 py-0.5 cursor-pointer shadow-2xs focus:outline-hidden transition-all ${
                              req.status === "NEW"
                                ? "bg-rose-50 border-rose-300 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                                : req.status === "IN_PROGRESS"
                                ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                                : req.status === "PENDING"
                                ? "bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300"
                                : req.status === "RESOLVED"
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                                : "bg-muted/40 border-border text-muted-foreground"
                            }`}
                          >
                            {SUPPORT_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Quick Action Button */}
                            {req.status === "NEW" && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={processingId === req.id}
                                onClick={() => handleSupportStatusChange(req.id, "IN_PROGRESS")}
                                className="h-7 text-[10px] font-bold text-amber-700 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg px-2"
                                title="Chuyển sang Đang xử lý"
                              >
                                Tiếp nhận
                              </Button>
                            )}

                            {(req.status === "IN_PROGRESS" || req.status === "PENDING") && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={processingId === req.id}
                                onClick={() => handleSupportStatusChange(req.id, "RESOLVED")}
                                className="h-7 text-[10px] font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg px-2"
                                title="Đánh dấu đã giải quyết"
                              >
                                Hoàn tất
                              </Button>
                            )}

                            {/* View / Edit Modal Button */}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="h-7 w-7 rounded-lg text-primary hover:bg-[#FFF0E6] hover:text-[#D97736]"
                              onClick={() => setSelectedSupport(req)}
                              title="Xem chi tiết & Xử lý phiếu"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={processingId === req.id}
                              className="h-7 w-7 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => handleDeleteSupport(req.id)}
                              title="Xóa phiếu"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

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
        )}

        {/* ================= CARD 2: MAKE-UP REQUESTS ================= */}
        {(activeTab === "all" || activeTab === "makeup") && (
        <Card className="clay-card p-0 overflow-hidden flex flex-col border-2">
          <CardHeader className="border-b-2 border-border/70 pb-3 bg-muted/30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="clay-icon-tile h-8 w-8 bg-[#FFF0E6] text-[#D97736]">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-extrabold font-heading">
                    Đăng ký ca học bù
                  </CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="orange" className="text-xs font-bold font-heading">
                  {filteredMakeup.length} ca
                </Badge>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setIsAddMakeupOpen(true)}
                  className="rounded-xl gap-1 text-[11px] font-bold text-[#D97736] border-[#FCDCC8] hover:bg-[#FFF0E6]"
                >
                  <Plus className="h-3 w-3" /> Thêm
                </Button>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Tìm học viên, lớp học..."
                  value={makeupSearch}
                  onChange={(e) => setMakeupSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-xl bg-card border-2 font-medium"
                />
              </div>

              <select
                value={makeupStatusFilter}
                onChange={(e) => setMakeupStatusFilter(e.target.value)}
                className="h-8 rounded-xl border-2 text-xs font-bold px-2 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="all">Tất cả trạng thái</option>
                {REQUEST_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col justify-between">
            <div className="overflow-x-auto">
              <Table className="min-w-[540px]">
                <TableHeader className="bg-muted/50 border-b-2 border-border/70">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-heading font-extrabold text-xs w-[130px]">Học Viên</TableHead>
                    <TableHead className="font-heading font-extrabold text-xs">Ca Nghỉ & Ca Bù</TableHead>
                    <TableHead className="w-[125px] font-heading font-extrabold text-xs">Trạng Thái</TableHead>
                    <TableHead className="w-[110px] text-right font-heading font-extrabold text-xs">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMakeup.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                        Không tìm thấy yêu cầu học bù nào phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMakeup.map((req) => (
                      <TableRow
                        key={req.id}
                        className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors"
                      >
                        {/* Student */}
                        <TableCell>
                          <div className="space-y-0.5 py-1">
                            <div className="font-bold text-sm text-foreground font-heading">
                              {req.student?.name || "Học viên"}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono font-semibold">
                              {req.student?.code || "N/A"}
                            </div>
                          </div>
                        </TableCell>

                        {/* Schedule Info */}
                        <TableCell className="space-y-1.5 py-2">
                          <div className="text-xs text-muted-foreground flex items-start gap-1.5 flex-wrap">
                            <span className="font-semibold text-[#DC2626] dark:text-[#EF4444] shrink-0 mt-0.5">Buổi vắng:</span>
                            <span className="font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md text-[11px] break-words whitespace-normal line-clamp-2 max-w-[280px]">
                              {req.missedSchedule
                                ? `${req.missedSchedule.class?.name || req.missedSchedule.class?.code || "Lớp học"} (${new Date(
                                    req.missedSchedule.date
                                  ).toLocaleDateString("vi-VN", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "2-digit",
                                  })} • ${new Date(req.missedSchedule.date).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}${req.missedSchedule.room?.name ? ` • ${req.missedSchedule.room.name}` : ""})`
                                : `Ca học #${req.missedScheduleId?.slice(-6) || "N/A"}`}
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground flex items-start gap-1.5 flex-wrap">
                            <span className="font-semibold text-primary shrink-0 mt-0.5">Đăng ký bù:</span>
                            <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md text-[11px] break-words whitespace-normal line-clamp-2 max-w-[280px]">
                              {req.targetSchedule
                                ? `${req.targetSchedule.class?.name || req.targetSchedule.class?.code || "Lớp học"} (${new Date(
                                    req.targetSchedule.date
                                  ).toLocaleDateString("vi-VN", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "2-digit",
                                  })} • ${new Date(req.targetSchedule.date).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}${req.targetSchedule.room?.name ? ` • ${req.targetSchedule.room.name}` : ""})`
                                : `Ca học #${req.targetScheduleId?.slice(-6) || "N/A"}`}
                            </span>
                          </div>

                          {req.notes && (
                            <div className="text-[11px] text-muted-foreground italic truncate max-w-[280px]">
                              Ghi chú: {req.notes}
                            </div>
                          )}
                        </TableCell>

                        {/* Status Selector */}
                        <TableCell>
                          <select
                            value={req.status}
                            disabled={processingId === req.id}
                            onChange={(e) => handleMakeupStatusChange(req.id, e.target.value)}
                            className={`w-full h-8 text-[11px] font-black rounded-xl border-2 px-2 py-0.5 cursor-pointer shadow-2xs focus:outline-hidden transition-all ${
                              req.status === "PENDING"
                                ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300"
                                : req.status === "APPROVED"
                                ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300"
                                : "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300"
                            }`}
                          >
                            {REQUEST_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Quick Approve / Reject buttons for PENDING */}
                            {req.status === "PENDING" && (
                              <>
                                <Button
                                  size="icon-xs"
                                  variant="outline"
                                  disabled={processingId === req.id}
                                  onClick={() => handleMakeupStatusChange(req.id, "APPROVED")}
                                  className="h-7 w-7 rounded-lg bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-700 dark:text-emerald-300"
                                  title="Duyệt ca bù (tự động xếp lịch điểm danh)"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon-xs"
                                  variant="outline"
                                  disabled={processingId === req.id}
                                  onClick={() => handleMakeupStatusChange(req.id, "REJECTED")}
                                  className="h-7 w-7 rounded-lg bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:border-rose-700 dark:text-rose-300"
                                  title="Từ chối ca bù"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}

                            {/* View / Edit Modal Button */}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="h-7 w-7 rounded-lg text-primary hover:bg-[#FFF0E6] hover:text-[#D97736]"
                              onClick={() => setSelectedMakeup(req)}
                              title="Chi tiết ca học bù"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              disabled={processingId === req.id}
                              className="h-7 w-7 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              onClick={() => handleDeleteMakeup(req.id)}
                              title="Xóa ca bù"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

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
        )}
      </div>

      {/* ================= MODAL 1: SUPPORT REQUEST DETAIL & PROCESS ================= */}
      <Dialog open={!!selectedSupport} onOpenChange={(open) => !open && setSelectedSupport(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="clay-icon-tile h-9 w-9 bg-[#FDF2F8] text-[#DB2777]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold font-heading">
                  Xử lý Yêu cầu hỗ trợ & Nghỉ phép
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Mã phiếu: #{selectedSupport?.id?.slice(-8)} • Ngày gửi:{" "}
                  {selectedSupport?.createdAt &&
                    new Date(selectedSupport.createdAt).toLocaleString("vi-VN")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedSupport && (
            <form onSubmit={handleSaveSupportDetail} className="grid gap-4 py-2 w-full max-w-full min-w-0">
              {/* Student Summary Box */}
              <div className="p-3 rounded-2xl bg-muted/40 border-2 border-border/70 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-extrabold text-sm text-foreground font-heading truncate">
                    {selectedSupport.student?.name}
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                    {selectedSupport.student?.code}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">Cơ sở:</span>{" "}
                    {selectedSupport.student?.facility?.name || "Chưa gán"}
                  </div>
                  {selectedSupport.student?.parent && (
                    <div className="truncate">
                      <span className="font-semibold">Phụ huynh:</span>{" "}
                      {selectedSupport.student.parent.name} ({selectedSupport.student.parent.phone})
                    </div>
                  )}
                </div>
              </div>

              {/* Request Content Box */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-xs font-bold font-heading text-muted-foreground uppercase tracking-wider">
                    Nội dung yêu cầu
                  </Label>
                  <Badge
                    variant={SUPPORT_TYPE_MAP[selectedSupport.type]?.badgeVariant || "aqua"}
                    className="text-[10px] px-2 py-0.5 shrink-0"
                  >
                    {getSupportTypeLabel(selectedSupport.type)}
                  </Badge>
                </div>
                <div className="p-3 rounded-xl bg-card border-2 border-border/80 text-xs text-foreground leading-relaxed break-words">
                  {selectedSupport.content}
                </div>
              </div>

              {/* Processing Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="grid gap-1.5 min-w-0">
                  <Label className="text-xs font-bold font-heading">Trạng thái xử lý *</Label>
                  <select
                    name="status"
                    defaultValue={selectedSupport.status}
                    className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-bold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
                  >
                    {SUPPORT_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-1.5 min-w-0">
                  <Label className="text-xs font-bold font-heading">Mức độ ưu tiên *</Label>
                  <select
                    name="priority"
                    defaultValue={selectedSupport.priority || "NORMAL"}
                    className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-bold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assignee Selection */}
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Nhân sự phụ trách / CS</Label>
                <select
                  name="assigneeId"
                  defaultValue={selectedSupport.assigneeId || ""}
                  className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-semibold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
                >
                  <option value="">-- Chưa chỉ định nhân viên --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role} - {u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Internal Notes */}
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Ghi chú xử lý / Phản hồi nội bộ</Label>
                <Textarea
                  name="notes"
                  defaultValue={selectedSupport.notes || ""}
                  placeholder="Ghi lại tiến trình xử lý, phương án đã trao đổi với phụ huynh..."
                  className="w-full max-w-full min-w-0 min-h-[80px] text-xs font-medium rounded-xl border-2"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSupport(null)}
                  className="rounded-xl"
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="clay-btn-primary rounded-xl"
                >
                  {isPending ? "Đang lưu..." : "Lưu cập nhật"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 2: CREATE SUPPORT REQUEST ================= */}
      <Dialog open={isAddSupportOpen} onOpenChange={setIsAddSupportOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="clay-icon-tile h-9 w-9 bg-[#FDF2F8] text-[#DB2777]">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold font-heading">
                  Tạo phiếu yêu cầu hỗ trợ mới
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Ghi nhận yêu cầu hỗ trợ hoặc xin nghỉ phép từ phụ huynh / học sinh.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSupport} className="grid gap-4 py-2 w-full max-w-full min-w-0">
            <div className="grid gap-1.5 min-w-0">
              <Label className="text-xs font-bold font-heading">Học viên *</Label>
              <select
                name="studentId"
                required
                className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-semibold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="">-- Chọn học viên --</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code} {s.parent?.phone ? `• SĐT: ${s.parent.phone}` : ""})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Loại yêu cầu *</Label>
                <select
                  name="type"
                  defaultValue="LEAVE"
                  required
                  className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-bold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
                >
                  {SUPPORT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Độ ưu tiên *</Label>
                <select
                  name="priority"
                  defaultValue="NORMAL"
                  required
                  className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-bold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-1.5 min-w-0">
              <Label className="text-xs font-bold font-heading">Người tiếp nhận / Phụ trách</Label>
              <select
                name="assigneeId"
                className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-semibold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="">-- Tự động phân công / Tiếp nhận sau --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5 min-w-0">
              <Label className="text-xs font-bold font-heading">Nội dung yêu cầu *</Label>
              <Textarea
                name="content"
                required
                placeholder="Ví dụ: Xin nghỉ buổi học thứ 4 ngày 15/10 do bị sốt xuất huyết..."
                className="w-full max-w-full min-w-0 min-h-[80px] text-xs font-medium rounded-xl border-2"
              />
            </div>

            <div className="grid gap-1.5 min-w-0">
              <Label className="text-xs font-bold font-heading">Ghi chú nội bộ</Label>
              <Input
                name="notes"
                placeholder="Ghi chú thêm từ nhân viên tư vấn..."
                className="h-10 w-full max-w-full min-w-0 text-xs font-medium rounded-xl border-2"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddSupportOpen(false)}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="clay-btn-primary rounded-xl"
              >
                {isPending ? "Đang tạo..." : "Tạo phiếu hỗ trợ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 3: MAKE-UP REQUEST DETAIL & EDIT ================= */}
      <Dialog open={!!selectedMakeup} onOpenChange={(open) => !open && setSelectedMakeup(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="clay-icon-tile h-9 w-9 bg-[#FFF0E6] text-[#D97736]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold font-heading">
                  Chi tiết & Xử lý ca học bù
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Mã ca bù: #{selectedMakeup?.id?.slice(-8)} • Ngày đăng ký:{" "}
                  {selectedMakeup?.createdAt &&
                    new Date(selectedMakeup.createdAt).toLocaleString("vi-VN")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedMakeup && (
            <form onSubmit={handleSaveMakeupDetail} className="grid gap-4 py-2 w-full max-w-full min-w-0">
              {/* Student Summary Box */}
              <div className="p-3 rounded-2xl bg-muted/40 border-2 border-border/70 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-extrabold text-sm text-foreground font-heading truncate">
                    {selectedMakeup.student?.name}
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono shrink-0">
                    {selectedMakeup.student?.code}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  <span className="font-semibold">Cơ sở:</span>{" "}
                  {selectedMakeup.student?.facility?.name || "Chưa gán"}
                </div>
              </div>

              {/* Missed vs Target Schedule info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/50 space-y-1 min-w-0 break-words">
                  <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Buổi học vắng
                  </div>
                  <div className="text-xs font-bold text-foreground">
                    {selectedMakeup.missedSchedule?.class?.name || "Lớp học"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {selectedMakeup.missedSchedule?.date &&
                      new Date(selectedMakeup.missedSchedule.date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/50 space-y-1 min-w-0 break-words">
                  <div className="text-[11px] font-bold text-[#D97736] uppercase tracking-wider">
                    Ca bù dự kiến
                  </div>
                  <div className="text-xs font-bold text-foreground">
                    {selectedMakeup.targetSchedule?.class?.name || "Lớp học"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {selectedMakeup.targetSchedule?.date &&
                      new Date(selectedMakeup.targetSchedule.date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </div>
                </div>
              </div>

              {/* Change target schedule dropdown */}
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Đổi ca học bù sang lịch khác</Label>
                <select
                  name="targetScheduleId"
                  defaultValue={selectedMakeup.targetScheduleId}
                  className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-semibold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
                >
                  <option value={selectedMakeup.targetScheduleId}>
                    Giữ nguyên: {selectedMakeup.targetSchedule?.class?.name} (
                    {selectedMakeup.targetSchedule?.date &&
                      new Date(selectedMakeup.targetSchedule.date).toLocaleDateString("vi-VN")}
                    )
                  </option>
                  {upcomingSchedules
                    .filter((s) => s.id !== selectedMakeup.targetScheduleId)
                    .map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.class?.name} ({sch.class?.code}) -{" "}
                        {new Date(sch.date).toLocaleDateString("vi-VN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        {sch.room?.name ? `• ${sch.room.name}` : ""}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status Select */}
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Trạng thái phê duyệt *</Label>
                <select
                  name="status"
                  defaultValue={selectedMakeup.status}
                  className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-bold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
                >
                  {REQUEST_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Ghi chú ca bù</Label>
                <Textarea
                  name="notes"
                  defaultValue={selectedMakeup.notes || ""}
                  placeholder="Lý do bù hoặc thông tin ghi chú cho giáo viên..."
                  className="w-full max-w-full min-w-0 min-h-[70px] text-xs font-medium rounded-xl border-2"
                />
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMakeup(null)}
                  className="rounded-xl"
                >
                  Đóng
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="clay-btn-primary rounded-xl"
                >
                  {isPending ? "Đang lưu..." : "Lưu ca học bù"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= MODAL 4: CREATE MAKE-UP REQUEST ================= */}
      <Dialog open={isAddMakeupOpen} onOpenChange={setIsAddMakeupOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="clay-icon-tile h-9 w-9 bg-[#FFF0E6] text-[#D97736]">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold font-heading">
                  Đăng ký xếp ca học bù mới
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Đăng ký lịch bù cho học viên vắng tiết và tự động đưa vào danh sách lớp.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateMakeup} className="grid gap-4 py-2 w-full max-w-full min-w-0">
            {/* Student selection */}
            <div className="grid gap-1.5 min-w-0">
              <Label className="text-xs font-bold font-heading">Học viên cần học bù *</Label>
              <select
                name="studentId"
                value={newMakeupStudentId}
                onChange={(e) => setNewMakeupStudentId(e.target.value)}
                required
                className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-semibold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="">-- Chọn học viên --</option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Missed schedule selection */}
            <div className="grid gap-1.5 min-w-0">
              <Label className="text-xs font-bold font-heading">Ca học đã vắng *</Label>
              <select
                name="missedScheduleId"
                required
                className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-semibold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="">-- Chọn ca học đã nghỉ --</option>
                {studentPastSchedules.length > 0 ? (
                  studentPastSchedules.map((sch: any) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.class?.name || "Lớp học"} (
                      {new Date(sch.date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      )
                    </option>
                  ))
                ) : (
                  upcomingSchedules.slice(0, 15).map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.class?.name} (
                      {new Date(sch.date).toLocaleDateString("vi-VN", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}
                      )
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Target schedule selection */}
            <div className="grid gap-1.5 min-w-0">
              <Label className="text-xs font-bold font-heading">Ca học bù mong muốn *</Label>
              <select
                name="targetScheduleId"
                required
                className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-semibold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
              >
                <option value="">-- Chọn ca bù sắp tới --</option>
                {upcomingSchedules.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.class?.name} ({sch.class?.code}) -{" "}
                    {new Date(sch.date).toLocaleDateString("vi-VN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    {sch.room?.name ? `• Phòng: ${sch.room.name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Trạng thái phê duyệt</Label>
                <select
                  name="status"
                  defaultValue="APPROVED"
                  className="h-10 w-full max-w-full truncate min-w-0 rounded-xl border-2 text-xs font-bold px-3 py-1 bg-card text-foreground cursor-pointer focus:outline-hidden"
                >
                  <option value="APPROVED">Duyệt ngay (Xếp vào lớp)</option>
                  <option value="PENDING">Chờ duyệt</option>
                </select>
              </div>

              <div className="grid gap-1.5 min-w-0">
                <Label className="text-xs font-bold font-heading">Lý do / Ghi chú</Label>
                <Input
                  name="notes"
                  placeholder="Lý do học bù..."
                  className="h-10 w-full max-w-full min-w-0 text-xs font-medium rounded-xl border-2"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddMakeupOpen(false)}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="clay-btn-primary rounded-xl"
              >
                {isPending ? "Đang tạo..." : "Xác nhận xếp ca bù"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
