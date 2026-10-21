"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { formatVND, numberToVietnameseWords } from "@/lib/vietnamese-currency";
import { confirmPayment, processRefund, createBillingInvoice } from "@/app/actions/billing";
import Link from "next/link";
import {
  Receipt,
  QrCode,
  DollarSign,
  CheckCircle2,
  Clock,
  RotateCcw,
  Plus,
  Search,
  Building2,
  BookOpen,
  Copy,
  Printer,
  Sparkles,
  AlertTriangle,
  History,
  ShieldCheck,
  CreditCard,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText
} from "lucide-react";

interface BillingClientProps {
  initialOrders: any[];
  courses: any[];
  facilities: any[];
  activityLogs: any[];
}

export function BillingClient({
  initialOrders,
  courses,
  facilities,
  activityLogs,
}: BillingClientProps) {
  const { selectedFacilityId, selectedFacility, facilities: ctxFacilities } = useFacility();
  const availableFacilities = ctxFacilities.length > 0 ? ctxFacilities : facilities;

  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<"invoices" | "vietqr" | "audit">("invoices");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Order for VietQR Modal or Tab
  const [selectedOrderForQR, setSelectedOrderForQR] = useState<any | null>(null);

  // Selected Order for Receipt Modal
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<any | null>(null);

  // Selected Order for Refund Modal
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState("Học viên chuyển chỗ ở / thay đổi kế hoạch");
  const [refundAmount, setRefundAmount] = useState<number>(0);

  // Create Invoice Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourseFee, setSelectedCourseFee] = useState<number>(courses[0]?.fee || 4500000);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Facility filter matcher
  const matchFacility = (order: any) => {
    if (selectedFacilityId === "all") return true;
    const facId = order.facilityId;
    const facName = order.facility?.name;
    if (facId && facId === selectedFacilityId) return true;
    if (selectedFacility && facName === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (facName?.includes("Cầu Giấy") || facId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (facName?.includes("Bình Thạnh") || facId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (facName?.includes("Hải Châu") || facId?.includes("hai-chau"))) return true;
    return false;
  };

  const filteredOrders = orders
    .filter(matchFacility)
    .filter((o) => {
      // Search
      const matchesSearch =
        searchTerm === "" ||
        o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.parentPhone.includes(searchTerm) ||
        o.course?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status
      if (statusFilter === "all") return true;
      return o.status === statusFilter;
    });

  // Financial Metrics
  const paidOrders = filteredOrders.filter((o) => o.status === "PAID");
  const pendingOrders = filteredOrders.filter((o) => o.status === "PENDING");
  const refundedOrders = filteredOrders.filter((o) => o.status === "CANCELLED" || (o.notes && o.notes.includes("hoàn tiền")));

  const totalPaidRevenue = paidOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalPendingReceivable = pendingOrders.reduce((sum, o) => sum + o.amount, 0);
  const totalRefundedAmount = refundedOrders.reduce((sum, o) => sum + o.amount, 0);
  const collectionRate =
    filteredOrders.length > 0
      ? Math.round((paidOrders.length / (paidOrders.length + pendingOrders.length || 1)) * 100)
      : 0;

  // Instant Payment Confirmation via Webhook Simulator
  const handleConfirmPayment = async (orderId: string, paymentMethod = "VIETQR_NAPAS247") => {
    setIsSubmitting(true);
    const res = await confirmPayment(orderId, paymentMethod);
    setIsSubmitting(false);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "PAID" } : o))
      );
      if (selectedOrderForQR?.id === orderId) {
        setSelectedOrderForQR((prev: any) => ({ ...prev, status: "PAID" }));
      }
      setFeedbackMsg({
        text: `Đã xác nhận thanh toán thành công (Mã GD: ${res.transactionId})! Entitlement quyền học đã được tự động cấp.`,
        type: "success",
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setFeedbackMsg({ text: res.error || "Xác nhận thanh toán thất bại", type: "error" });
    }
  };

  // Submit Refund
  const handleProcessRefund = async () => {
    if (!selectedOrderForRefund) return;
    setIsSubmitting(true);

    const res = await processRefund(
      selectedOrderForRefund.id,
      refundAmount || selectedOrderForRefund.amount,
      refundReason
    );
    setIsSubmitting(false);

    if (res.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderForRefund.id
            ? { ...o, status: "CANCELLED", notes: `${o.notes || ""} | [Đã hoàn tiền]` }
            : o
        )
      );
      setSelectedOrderForRefund(null);
      setFeedbackMsg({
        text: `Đã xử lý hoàn tiền thành công! Trạng thái chuyển sang CANCELLED và Entitlement liên kết đã bị thu hồi.`,
        type: "success",
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } else {
      setFeedbackMsg({ text: res.error || "Hoàn tiền thất bại", type: "error" });
    }
  };

  // Submit Create Billing Order
  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const res = await createBillingInvoice(formData);
    setIsSubmitting(false);

    if (res.success && res.order) {
      setOrders((prev) => [res.order, ...prev]);
      setIsCreateModalOpen(false);
      setSelectedOrderForQR(res.order); // Prompt QR payment right away
      setFeedbackMsg({ text: `Đã tạo hóa đơn ${res.order.code} thành công!`, type: "success" });
    } else {
      setFeedbackMsg({ text: res.error || "Tạo hóa đơn thất bại", type: "error" });
    }
  };

  // Helper for QR Image URL
  const getVietQRUrl = (order: any) => {
    const bankBin = "970415"; // VietinBank BIN
    const accountNo = "102899886688";
    const amount = order.amount;
    const memo = encodeURIComponent(`${order.code} ${order.parentPhone}`);
    return `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?amount=${amount}&addInfo=${memo}&accountName=TRUNG%20TAM%20DAO%20TAO%20EDUCENTER%20VN`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Receipt className="h-5 w-5" />
            </div>
            <h1 className="font-heading text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">
              Billing & Quản lý Thanh toán
            </h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5">
              Payment Gateway
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản trị hóa đơn học phí, tạo mã thanh toán VietQR động, xác nhận thanh toán tự động cấp quyền học và đối soát hoàn tiền.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <RefreshButton />
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm gap-2"
          >
            <Plus className="h-4 w-4" />
            Tạo Yêu Cầu Thu Phí Mới
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

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Paid Revenue */}
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Doanh Thu Đã Thu (Paid)
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading text-emerald-700 dark:text-emerald-400 truncate">
              {formatVND(totalPaidRevenue)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <span>{paidOrders.length} hóa đơn đã thanh toán thành công</span>
          </CardContent>
        </Card>

        {/* KPI 2: Pending Receivables */}
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Chờ Thu (Pending)
              </span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading text-amber-600 dark:text-amber-400 truncate">
              {formatVND(totalPendingReceivable)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <span>{pendingOrders.length} đơn đang chờ phụ huynh thanh toán</span>
          </CardContent>
        </Card>

        {/* KPI 3: Total Refunded */}
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Hoàn Tiền (Refunded)
              </span>
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <RotateCcw className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-foreground mt-1 font-heading text-rose-600 dark:text-rose-400 truncate">
              {formatVND(totalRefundedAmount)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <span>{refundedOrders.length} đơn đã giải quyết hoàn phí</span>
          </CardContent>
        </Card>

        {/* KPI 4: Collection Rate */}
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tỷ Lệ Thu Thành Công
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <CardTitle className="text-2xl font-extrabold text-foreground mt-1 font-heading">
              {collectionRate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            <span className="text-emerald-600 font-medium">Chuẩn kế toán &gt; 80%</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Hóa Đơn & Giao Dịch
            <Badge variant="secondary" className="ml-1 text-xs">
              {filteredOrders.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab("vietqr")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "vietqr"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <QrCode className="h-4 w-4 text-emerald-600" />
            Cổng Thanh Toán VietQR Động
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "audit"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <History className="h-4 w-4" />
            Đối Soát & Webhook Audit Trail
          </button>
        </div>

        <div className="text-xs text-muted-foreground hidden sm:block">
          Hiển thị: <span className="font-semibold text-foreground">{selectedFacility ? selectedFacility.name : "Tất cả cơ sở"}</span>
        </div>
      </div>

      {/* TAB 1: INVOICES & TRANSACTIONS TABLE */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/80 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm mã đơn, tên phụ huynh, SĐT hoặc khóa học..."
                className="pl-9 bg-background/50 h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                  <SelectValue placeholder="Trạng thái đơn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="PENDING">Chờ thanh toán (PENDING)</SelectItem>
                  <SelectItem value="PAID">Đã thanh toán (PAID)</SelectItem>
                  <SelectItem value="CANCELLED">Đã hoàn tiền / Hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
            <Table className="min-w-[960px]">
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-xs uppercase w-[130px] whitespace-nowrap">Mã Đơn / Hóa Đơn</TableHead>
                  <TableHead className="font-bold text-xs uppercase w-[180px] whitespace-nowrap">Người Nộp / Phụ Huynh</TableHead>
                  <TableHead className="font-bold text-xs uppercase w-[220px] whitespace-nowrap">Khóa Học & Cơ Sở</TableHead>
                  <TableHead className="font-bold text-xs uppercase w-[140px] whitespace-nowrap">Số Tiền (VND)</TableHead>
                  <TableHead className="font-bold text-xs uppercase w-[170px] whitespace-nowrap">Trạng Thái & Quyền Học</TableHead>
                  <TableHead className="font-bold text-xs uppercase w-[240px] text-right whitespace-nowrap">Thao Tác Nghiệp Vụ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-sm text-muted-foreground">
                      Không tìm thấy đơn hàng / hóa đơn nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const isPaid = order.status === "PAID";
                    const isPending = order.status === "PENDING";
                    const isCancelled = order.status === "CANCELLED";
                    const hasEntitlement = order.entitlements && order.entitlements.length > 0;

                    return (
                      <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                        {/* Order Code */}
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-sm text-foreground block">
                              {order.code}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </TableCell>

                        {/* Payer Info */}
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-0.5 max-w-[180px]">
                            <span className="font-bold text-sm text-foreground block truncate" title={order.parentName}>
                              {order.parentName}
                            </span>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                              <PhoneCall className="h-3 w-3 shrink-0" />
                              <span>{order.parentPhone}</span>
                            </p>
                          </div>
                        </TableCell>

                        {/* Course & Facility */}
                        <TableCell>
                          <div className="space-y-0.5 max-w-[220px]">
                            <span className="font-medium text-xs text-foreground block truncate" title={order.course?.name}>
                              {order.course?.name}
                            </span>
                            {order.facility && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{order.facility.name.replace("Cơ sở ", "")}</span>
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="whitespace-nowrap">
                          <span className="font-extrabold text-sm text-foreground font-heading whitespace-nowrap">
                            {formatVND(order.amount)}
                          </span>
                        </TableCell>

                        {/* Status & Entitlement Badge */}
                        <TableCell className="whitespace-nowrap">
                          <div className="space-y-1">
                            {isPaid && (
                              <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-[10px] font-bold whitespace-nowrap">
                                ✓ ĐÃ THANH TOÁN
                              </Badge>
                            )}
                            {isPending && (
                              <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold whitespace-nowrap">
                                ⏳ CHỜ THANH TOÁN
                              </Badge>
                            )}
                            {isCancelled && (
                              <Badge className="bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30 text-[10px] font-bold whitespace-nowrap">
                                ↺ ĐÃ HOÀN TIỀN
                              </Badge>
                            )}

                            <div>
                              {hasEntitlement ? (
                                <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 whitespace-nowrap">
                                  <ShieldCheck className="h-2.5 w-2.5 mr-1 inline" />
                                  Entitlement đã cấp
                                </Badge>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic whitespace-nowrap">
                                  {isPaid ? "Chưa liên kết học viên" : "Chưa kích hoạt"}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                            {/* QR Code Pay */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrderForQR(order)}
                              className="h-7 px-2 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10 gap-1 shrink-0 whitespace-nowrap"
                              title="Xem mã VietQR và cổng thanh toán"
                            >
                              <QrCode className="h-3 w-3" />
                              Mã VietQR
                            </Button>

                            {/* Instant Confirm Pay (if pending) */}
                            {isPending && (
                              <Button
                                size="sm"
                                onClick={() => handleConfirmPayment(order.id)}
                                disabled={isSubmitting}
                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-semibold shrink-0 whitespace-nowrap"
                                title="Xác nhận thanh toán ngay bằng 1 click"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Thu tiền
                              </Button>
                            )}

                            {/* Print Receipt (if paid) */}
                            {isPaid && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedOrderForReceipt(order)}
                                className="h-7 px-2 text-xs text-primary border-primary/30 hover:bg-primary/10 gap-1 shrink-0 whitespace-nowrap"
                                title="Xem và in phiếu thu điện tử"
                              >
                                <FileText className="h-3 w-3" />
                                Phiếu thu
                              </Button>
                            )}

                            {/* Refund (if paid) */}
                            {isPaid && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedOrderForRefund(order);
                                  setRefundAmount(order.amount);
                                }}
                                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-rose-600 gap-1 shrink-0 whitespace-nowrap"
                                title="Xử lý hoàn tiền cho đơn hàng này"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Hoàn tiền
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
        </div>
      )}

      {/* TAB 2: INTERACTIVE VIETQR PAYMENT GATEWAY */}
      {activeTab === "vietqr" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Selector */}
          <Card className="clay-card border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading font-bold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Chọn Hóa Đơn Cần Thanh Toán
              </CardTitle>
              <CardDescription>
                Bấm vào đơn hàng bất kỳ để tạo mã VietQR động theo chuẩn Napas247.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredOrders.map((o) => {
                const isSelected = selectedOrderForQR?.id === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrderForQR(o)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                        : "border-border/80 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs">{o.code}</span>
                      <span className="font-extrabold text-xs text-foreground font-heading">
                        {formatVND(o.amount)}
                      </span>
                    </div>
                    <div className="text-xs text-foreground font-medium mt-1">{o.parentName}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                      <span>{o.course?.name}</span>
                      <Badge variant="outline" className={`text-[9px] py-0 px-1.5 ${o.status === "PAID" ? "text-emerald-600 border-emerald-500/30" : "text-amber-600 border-amber-500/30"}`}>
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* VietQR Dynamic Showcase */}
          <Card className="clay-card lg:col-span-2 border-border/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-lg font-heading font-bold">
                    Cổng Thanh Toán VietQR Tự Động (VietinBank / Napas247)
                  </CardTitle>
                </div>
                {selectedOrderForQR?.status === "PAID" ? (
                  <Badge className="bg-emerald-600 text-white text-xs">
                    ✓ ĐÃ THANH TOÁN THÀNH CÔNG
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs animate-pulse">
                    Đang chờ quét mã
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedOrderForQR ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* VietQR Code Frame */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-emerald-500/40 bg-background/80 shadow-inner">
                    <img
                      src={getVietQRUrl(selectedOrderForQR)}
                      alt="VietQR Code"
                      className="w-56 h-auto rounded-xl shadow-md border"
                    />
                    <span className="text-[11px] text-muted-foreground mt-3 text-center">
                      Quét bằng mọi ứng dụng ngân hàng hoặc ví điện tử (MoMo, ZaloPay, ViettelMoney).
                    </span>
                  </div>

                  {/* Payment Details */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="text-muted-foreground">Ngân hàng thụ hưởng:</span>
                        <strong className="text-foreground">VietinBank (Công Thương)</strong>
                      </div>
                      <div className="flex justify-between items-center border-b pb-1.5">
                        <span className="text-muted-foreground">Số tài khoản:</span>
                        <span className="font-mono font-bold text-sm text-foreground flex items-center gap-1.5">
                          1028 9988 6688
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText("102899886688");
                              setFeedbackMsg({ text: "Đã copy số tài khoản!", type: "success" });
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </span>
                      </div>
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="text-muted-foreground">Chủ tài khoản:</span>
                        <strong className="text-foreground">TRUNG TAM DAO TAO EDUCENTER VN</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="text-muted-foreground">Số tiền thanh toán:</span>
                        <span className="font-extrabold text-base text-emerald-600 font-heading">
                          {formatVND(selectedOrderForQR.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-muted-foreground">Nội dung chuyển khoản:</span>
                        <span className="font-mono font-bold text-foreground flex items-center gap-1.5 bg-background px-2 py-0.5 rounded border">
                          {selectedOrderForQR.code} {selectedOrderForQR.parentPhone}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(`${selectedOrderForQR.code} ${selectedOrderForQR.parentPhone}`);
                              setFeedbackMsg({ text: "Đã copy nội dung chuyển khoản!", type: "success" });
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </span>
                      </div>
                    </div>

                    {/* Simulation Action Button */}
                    {selectedOrderForQR.status !== "PAID" ? (
                      <Button
                        onClick={() => handleConfirmPayment(selectedOrderForQR.id)}
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 text-sm gap-2 shadow-md shadow-emerald-600/20"
                      >
                        <Sparkles className="h-4 w-4" />
                        {isSubmitting
                          ? "Đang xử lý Webhook Billing..."
                          : "⚡ Giả Lập Quét Mã & Thanh Toán Thành Công"}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 font-medium text-center">
                          ✓ Đơn hàng đã hoàn tất thanh toán. Entitlement quyền học đã được cấp tự động.
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setSelectedOrderForReceipt(selectedOrderForQR)}
                          className="w-full gap-2 text-primary"
                        >
                          <Printer className="h-4 w-4" />
                          Xem & In Phiếu Thu Điện Tử
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  Vui lòng chọn một hóa đơn ở danh sách bên trái để tạo mã VietQR.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL & WEBHOOK GATEWAY LOGS */}
      {activeTab === "audit" && (
        <Card className="clay-card border-border/80 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-heading font-bold">
                  Nhật Ký Đối Soát Thanh Toán (Billing Gateway Audit Trail)
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-xs">
                {activityLogs.length} sự kiện gần nhất
              </Badge>
            </div>
            <CardDescription>
              Kiểm tra tính toàn vẹn, tính bất biến (Idempotency dedup_key) và mã phản hồi từ Webhook Ngân hàng / Cổng thanh toán.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/80 overflow-hidden">
              <Table className="min-w-[880px]">
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs uppercase w-[160px] whitespace-nowrap">Thời Gian</TableHead>
                    <TableHead className="font-bold text-xs uppercase w-[220px] whitespace-nowrap">Sự Kiện Webhook</TableHead>
                    <TableHead className="font-bold text-xs uppercase w-[180px] whitespace-nowrap">Thực Thể / Mã Đơn</TableHead>
                    <TableHead className="font-bold text-xs uppercase w-[100px] whitespace-nowrap">Nguồn</TableHead>
                    <TableHead className="font-bold text-xs uppercase min-w-[250px] whitespace-nowrap">Chi Tiết Kỹ Thuật (Payload & Dedup Key)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                        Chưa có log đối soát nào được ghi nhận.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activityLogs.map((log) => {
                      let detailsObj: any = null;
                      try {
                        detailsObj = JSON.parse(log.details);
                      } catch {
                        detailsObj = { raw: log.details };
                      }

                      return (
                        <TableRow key={log.id} className="text-xs hover:bg-muted/30">
                          <TableCell className="font-mono text-muted-foreground whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString("vi-VN")}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold whitespace-nowrap ${
                                log.action.includes("CONFIRMATION")
                                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                                  : log.action.includes("MISMATCH")
                                  ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-700 border-blue-500/30"
                              }`}
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground whitespace-nowrap">
                            {log.entityType}: {log.entityId}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant="secondary" className="text-[10px] whitespace-nowrap">
                              {log.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground max-w-[340px] truncate" title={JSON.stringify(detailsObj)}>
                            {detailsObj?.dedup_key && (
                              <span className="text-primary font-bold mr-1">
                                [{detailsObj.dedup_key}]
                              </span>
                            )}
                            {JSON.stringify(detailsObj)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: TẠO HÓA ĐƠN / YÊU CẦU THU PHÍ MỚI */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Tạo Yêu Cầu Thu Phí / Hóa Đơn Mới
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="parentName">Họ tên người nộp / Phụ huynh *</Label>
              <Input id="parentName" name="parentName" placeholder="PH. Nguyễn Văn B" required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentPhone">Số điện thoại liên hệ *</Label>
              <Input id="parentPhone" name="parentPhone" placeholder="0912345678" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="courseId">Khóa học đăng ký *</Label>
                <Select
                  name="courseId"
                  defaultValue={courses[0]?.id}
                  onValueChange={(courseId) => {
                    const c = courses.find((item) => item.id === courseId);
                    if (c?.fee) setSelectedCourseFee(c.fee);
                  }}
                >
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
                <Label htmlFor="facilityId">Cơ sở đào tạo *</Label>
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
              <Label htmlFor="amount">Số tiền học phí (VND) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                defaultValue={selectedCourseFee}
                required
              />
              <span className="text-[11px] text-muted-foreground block">
                Bằng chữ: {numberToVietnameseWords(selectedCourseFee)}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Ghi chú thanh toán</Label>
              <Input id="notes" name="notes" placeholder="VD: Học phí Movers Kỳ 1 - Ưu đãi Early Bird" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                {isSubmitting ? "Đang tạo hóa đơn..." : "Tạo Hóa Đơn & Sinh Mã VietQR"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: XỬ LÝ HOÀN TIỀN (REFUND PROCESSING DIALOG) */}
      {selectedOrderForRefund && (
        <Dialog open={!!selectedOrderForRefund} onOpenChange={() => setSelectedOrderForRefund(null)}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2 text-rose-600">
                <RotateCcw className="h-5 w-5" />
                Xử Lý Hoàn Tiền (Refund Processing)
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <div className="p-3.5 rounded-xl bg-muted/40 border space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn:</span>
                  <span className="font-mono font-bold">{selectedOrderForRefund.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Người nộp:</span>
                  <span className="font-semibold">{selectedOrderForRefund.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tiền đã thu:</span>
                  <span className="font-extrabold text-foreground">{formatVND(selectedOrderForRefund.amount)}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="refundAmount">Số tiền hoàn (VND)</Label>
                <Input
                  id="refundAmount"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  max={selectedOrderForRefund.amount}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="refundReason">Lý do hoàn phí</Label>
                <Select value={refundReason} onValueChange={(val) => setRefundReason(val || "")}>
                  <SelectTrigger id="refundReason">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Học viên chuyển chỗ ở / thay đổi kế hoạch">Học viên chuyển chỗ ở / thay đổi kế hoạch</SelectItem>
                    <SelectItem value="Không phù hợp lịch học / thời gian của trung tâm">Không phù hợp lịch học / thời gian</SelectItem>
                    <SelectItem value="Chính sách cam kết hoàn tiền 100% trong 14 ngày">Chính sách cam kết hoàn tiền 14 ngày</SelectItem>
                    <SelectItem value="Lý do cá nhân khác">Lý do cá nhân khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300">
                ⚠️ <strong>Cảnh báo kế toán:</strong> Khi hoàn tiền, trạng thái đơn sẽ chuyển sang <strong>CANCELLED</strong> và quyền truy cập học tập (Entitlement) liên kết sẽ bị <strong>thu hồi (REVOKED)</strong> ngay lập tức.
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setSelectedOrderForRefund(null)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleProcessRefund}
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  {isSubmitting ? "Đang xử lý..." : "Xác Nhận Hoàn Tiền"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL 3: PHIẾU THU TIỀN HỌC PHÍ ĐIỆN TỬ (PRINTABLE ELECTRONIC RECEIPT) */}
      {selectedOrderForReceipt && (
        <Dialog open={!!selectedOrderForReceipt} onOpenChange={() => setSelectedOrderForReceipt(null)}>
          <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden">
            <div className="p-6 bg-background space-y-5" id="printable-receipt">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
                      E
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-base tracking-tight leading-none text-foreground">
                        EDUCENTER VN
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Hệ Thống Trung Tâm Đào Tạo Anh Ngữ & Kỹ Năng Chuẩn Quốc Tế
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {selectedOrderForReceipt.facility?.address || "Hà Nội & TP. Hồ Chí Minh"} | Hotline: 1900 8866
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-muted-foreground block">
                    MẪU SỐ: 01-TT/2026
                  </span>
                  <span className="font-mono text-xs text-foreground font-semibold block mt-0.5">
                    SỐ: {selectedOrderForReceipt.code}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Ngày: {new Date(selectedOrderForReceipt.updatedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="text-center space-y-1">
                <h2 className="font-heading font-black text-xl tracking-tight text-foreground uppercase">
                  Phiếu Thu Tiền Học Phí
                </h2>
                <span className="text-xs text-muted-foreground italic">
                  (Bản thể hiện điện tử có giá trị đối soát tài chính)
                </span>
              </div>

              {/* Body Info */}
              <div className="space-y-2 text-xs text-foreground border-y py-3.5">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Họ và tên người nộp tiền:</span>
                  <strong className="text-foreground">{selectedOrderForReceipt.parentName}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <strong className="text-foreground">{selectedOrderForReceipt.parentPhone}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Khoản thu học phí:</span>
                  <strong className="text-foreground">{selectedOrderForReceipt.course?.name}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Cơ sở đăng ký:</span>
                  <span className="text-foreground">{selectedOrderForReceipt.facility?.name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Hình thức nộp tiền:</span>
                  <span className="text-foreground">Chuyển khoản VietQR / Ngân hàng (Napas247)</span>
                </div>
                <div className="flex justify-between py-1.5 border-t mt-1">
                  <span className="text-sm font-bold text-foreground">Tổng số tiền đã nộp:</span>
                  <span className="text-base font-extrabold text-emerald-600 font-heading">
                    {formatVND(selectedOrderForReceipt.amount)}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground italic pt-0.5">
                  Viết bằng chữ: {numberToVietnameseWords(selectedOrderForReceipt.amount)}
                </div>
              </div>

              {/* Signatures & Stamp */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-center text-xs space-y-8">
                  <div>
                    <span className="font-bold text-foreground block">Người Nộp Tiền</span>
                    <span className="text-[10px] text-muted-foreground italic">(Ký, ghi rõ họ tên)</span>
                  </div>
                  <span className="text-xs font-semibold block">{selectedOrderForReceipt.parentName}</span>
                </div>

                <div className="relative text-center text-xs space-y-8">
                  <div>
                    <span className="font-bold text-foreground block">Kế Toán / Thủ Quỹ</span>
                    <span className="text-[10px] text-muted-foreground italic">(Đã ký điện tử)</span>
                  </div>
                  {/* Digital Stamp */}
                  <div className="border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black text-[11px] px-3 py-1 rounded-md rotate-[-8deg] uppercase tracking-wider shadow-sm">
                    ✓ ĐÃ THU TIỀN
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-muted/40 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedOrderForReceipt(null)}>
                Đóng
              </Button>
              <Button
                onClick={() => window.print()}
                className="bg-primary text-primary-foreground font-semibold gap-2"
              >
                <Printer className="h-4 w-4" />
                In Phiếu Thu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
