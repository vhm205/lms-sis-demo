"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CreditCard, 
  GraduationCap, 
  ShieldCheck, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Play, 
  Layers, 
  Calendar,
  Sparkles,
  ArrowRight
} from "lucide-react";

export function PartnerSimulatorPanel() {
  const [orders, setOrders] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Billing simulator state
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [billingAmount, setBillingAmount] = useState<string>("");
  const [billingDedupKey, setBillingDedupKey] = useState<string>("");

  // LMS simulator state
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("Unit 1: Getting Started");

  // Console response log
  const [consoleLog, setConsoleLog] = useState<{
    type: "success" | "error" | "info";
    title: string;
    payload?: any;
    response?: any;
    timestamp: string;
  } | null>(null);

  // Fetch initial data via unified simulator-data API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mock/simulator-data");
      if (res.ok) {
        const data = await res.json();
        const loadedOrders = data.orders || [];
        const loadedStudents = data.students || [];
        const loadedEntitlements = data.entitlements || [];

        setOrders(loadedOrders);
        setStudents(loadedStudents);
        setEntitlements(loadedEntitlements);

        // Auto-select pending order or first order
        if (loadedOrders.length > 0) {
          const pending = loadedOrders.find((o: any) => o.status === "PENDING") || loadedOrders[0];
          setSelectedOrderId(pending.id);
          setBillingAmount(String(pending.amount || ""));
        }

        // Auto-select student
        if (loadedStudents.length > 0) {
          setSelectedStudentId(loadedStudents[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load simulator data:", err);
    } finally {
      setLoading(false);
    }
  };

  const createSampleOrder = async () => {
    try {
      setLoading(true);
      const studentName = selectedStudent?.name || "Nguyễn Văn Phụ Huynh";
      const studentPhone = selectedStudent?.parent?.phone || selectedStudent?.phone || "0912345678";
      const payload = {
        customer_name: studentName,
        phone: studentPhone,
        total: 4500000,
        notes: "Đơn hàng mẫu tạo nhanh từ Partner Simulator Console",
        items: [{ name: "Khóa học Cambridge Movers (Kỳ 1)", quantity: 1, price: 4500000 }],
        course_id: selectedStudent?.classes?.[0]?.courseId || "ENG-CAM-MOVERS",
      };
      const res = await fetch("/api/webhooks/orchexa/order-created", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setConsoleLog({
        type: res.ok && data.success ? "success" : "error",
        title: "Tạo Đơn Hàng Mẫu PENDING",
        payload,
        response: data,
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });
      await fetchData();
    } catch (err: any) {
      console.error("Failed to create sample order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Update billing amount when order changes
  const handleOrderChange = (id: string) => {
    setSelectedOrderId(id);
    const ord = orders.find((o) => o.id === id);
    if (ord) {
      setBillingAmount(String(ord.amount || ""));
    }
  };

  // 1. Execute Billing Webhook
  const triggerBillingWebhook = async (event: "payment_success" | "refund_processed" | "payment_failed", useDedup: boolean = false) => {
    if (!selectedOrder) {
      alert("Vui lòng chọn đơn hàng.");
      return;
    }

    const dedup = useDedup ? billingDedupKey || `dedup_pay_${selectedOrder.code}` : `tx_${Date.now()}`;
    if (!billingDedupKey && useDedup) setBillingDedupKey(dedup);

    const payload = {
      event,
      order_code: selectedOrder.code,
      order_id: selectedOrder.id,
      transaction_id: `tx_${Date.now().toString().slice(-6)}`,
      amount: parseFloat(billingAmount) || selectedOrder.amount,
      currency: "VND",
      payment_method: "BANK_TRANSFER",
      paid_at: new Date().toISOString(),
      dedup_key: dedup,
      source: "BILLING_MOCK_SIMULATOR",
      notes: `Mô phỏng từ Partner Simulator Console (${event})`,
    };

    try {
      setLoading(true);
      const res = await fetch("/api/webhooks/billing/payment-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      setConsoleLog({
        type: res.ok && resData.success ? "success" : "error",
        title: `Billing Webhook: ${event.toUpperCase()}`,
        payload,
        response: resData,
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });

      await fetchData();
    } catch (err: any) {
      setConsoleLog({
        type: "error",
        title: "Billing Webhook Failed",
        payload,
        response: { error: err.message },
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Execute LMS Progress Webhook
  const triggerLmsWebhook = async (event: "lms.first_login" | "lms.lesson_completed") => {
    if (!selectedStudent) {
      alert("Vui lòng chọn học viên.");
      return;
    }

    const payload = {
      event,
      learner_id: selectedStudent.code || selectedStudent.id,
      lesson_id: `lesson_${Date.now().toString().slice(-4)}`,
      lesson_title: lessonTitle,
      progress_percent: 100,
      external_reference: `LMS_SYNC_${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      dedup_key: `lms_${selectedStudent.code}_${event}_${Date.now()}`,
    };

    try {
      setLoading(true);
      const res = await fetch("/api/webhooks/lms/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      setConsoleLog({
        type: res.ok && resData.success ? "success" : "error",
        title: `LMS Webhook: ${event}`,
        payload,
        response: resData,
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });

      await fetchData();
    } catch (err: any) {
      setConsoleLog({
        type: "error",
        title: "LMS Webhook Failed",
        payload,
        response: { error: err.message },
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Trigger Trial Provisioning
  const triggerTrialProvisioning = async () => {
    const studentName = selectedStudent?.name || "Học viên Học thử";
    const studentPhone = selectedStudent?.parent?.phone || selectedStudent?.phone || "0988776655";

    const payload = {
      name: studentName,
      phone: studentPhone,
      trial_days: 7,
      notes: "Cấp tài khoản học thử 7 ngày từ Partner Simulator Console",
    };

    try {
      setLoading(true);
      const res = await fetch("/api/mock/lms/trial-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      setConsoleLog({
        type: res.ok && resData.success ? "success" : "error",
        title: "LMS Trial Provisioning",
        payload,
        response: resData,
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });

      await fetchData();
    } catch (err: any) {
      setConsoleLog({
        type: "error",
        title: "Trial Provisioning Failed",
        payload,
        response: { error: err.message },
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });
    } finally {
      setLoading(false);
    }
  };

  // 4. Entitlement Quick Actions
  const handleEntitlementAction = async (id: string, action: "renew" | "expire") => {
    try {
      setLoading(true);
      const res = await fetch("/api/entitlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id, additionalDays: 30 }),
      });

      const resData = await res.json();
      setConsoleLog({
        type: res.ok && resData.success ? "success" : "error",
        title: `Entitlement Action: ${action.toUpperCase()}`,
        payload: { action, id },
        response: resData,
        timestamp: new Date().toLocaleTimeString("vi-VN"),
      });

      await fetchData();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background border border-indigo-500/20 p-5 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-600 text-white font-mono text-xs">EDU-02-A</Badge>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Partner & External System Simulator Hub
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Bảng điều khiển giả lập độc lập: Mô phỏng cổng thanh toán Billing, hệ thống học tập LMS và quản lý thời hạn gói học (Entitlement) để chứng minh nguồn xác nhận độc lập cho KPI Orchexa.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData} 
            disabled={loading}
            className="border-indigo-500/30 hover:bg-indigo-500/10 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới dữ liệu
          </Button>
        </div>
      </div>

      {/* Main Grid: Billing & LMS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Billing Simulator */}
        <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">1. Mock Billing Gateway</CardTitle>
                  <CardDescription className="text-xs">Xác nhận thanh toán & dòng tiền độc lập</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">
                Endpoint: /api/webhooks/billing/payment-confirmation
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Chọn đơn hàng cần mô phỏng ({orders.length}):</label>
                <button
                  type="button"
                  onClick={createSampleOrder}
                  disabled={loading}
                  className="text-[11px] text-emerald-500 hover:text-emerald-400 font-medium underline flex items-center gap-1"
                >
                  + Tạo đơn mẫu PENDING
                </button>
              </div>
              <select
                value={selectedOrderId}
                onChange={(e) => handleOrderChange(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {orders.length === 0 ? (
                  <option value="">-- Chưa có đơn hàng --</option>
                ) : (
                  orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      [{o.status}] {o.code} - {o.parentName} ({Number(o.amount).toLocaleString("vi-VN")}đ)
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedOrder && (
              <div className="bg-muted/30 border border-border/40 p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khách hàng:</span>
                  <span className="font-medium">{selectedOrder.parentName} ({selectedOrder.parentPhone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái hiện tại:</span>
                  <Badge variant="outline" className={selectedOrder.status === "PAID" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]" : "bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]"}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số tiền theo đơn:</span>
                  <span className="font-semibold text-emerald-500">{Number(selectedOrder.amount).toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Số tiền giả lập thanh toán (VND):</label>
              <Input
                type="number"
                value={billingAmount}
                onChange={(e) => setBillingAmount(e.target.value)}
                placeholder="Nhập số tiền..."
                className="h-8 text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Mẹo: Đổi số tiền khác để test kịch bản <code>PAYMENT_MISMATCH</code> (bất thường doanh thu).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium h-9"
                onClick={() => triggerBillingWebhook("payment_success")}
                disabled={loading}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Thanh toán Thành công
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs h-9"
                onClick={() => triggerBillingWebhook("refund_processed")}
                disabled={loading}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Mô phỏng Hoàn tiền
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs h-9"
                onClick={() => triggerBillingWebhook("payment_failed")}
                disabled={loading}
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                Mô phỏng Giao dịch Lỗi
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs h-9"
                onClick={() => triggerBillingWebhook("payment_success", true)}
                disabled={loading}
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                Test Khử trùng (Idempotent)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: LMS Simulator */}
        <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur">
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">2. Mock LMS / App System</CardTitle>
                  <CardDescription className="text-xs">Tiến độ học tập & mốc "Bắt đầu học" cho KPI</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-sky-500 border-sky-500/30 text-[10px]">
                Endpoint: /api/webhooks/lms/progress
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Chọn học viên cần phát sinh tiến độ ({students.length}):</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {students.length === 0 ? (
                  <option value="">-- Chưa có học viên --</option>
                ) : (
                  students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name} ({s.parent?.phone || s.phone || "N/A"})
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedStudent && (
              <div className="bg-muted/30 border border-border/40 p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã học viên / Learner ID:</span>
                  <span className="font-mono font-semibold text-sky-400">{selectedStudent.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Họ tên:</span>
                  <span className="font-medium">{selectedStudent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cơ sở:</span>
                  <span>{selectedStudent.facility?.name || "Cơ sở Cầu Giấy"}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tên bài học mô phỏng:</label>
              <Input
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="Nhập tên bài học..."
                className="h-8 text-xs font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                size="sm"
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium h-9"
                onClick={() => triggerLmsWebhook("lms.first_login")}
                disabled={loading}
              >
                <Play className="w-3.5 h-3.5 mr-1" />
                Mô phỏng "Bắt đầu học"
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="border-sky-500/30 text-sky-400 hover:bg-sky-500/10 text-xs h-9"
                onClick={() => triggerLmsWebhook("lms.lesson_completed")}
                disabled={loading}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Hoàn thành Bài học 1
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="col-span-2 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 text-xs h-9"
                onClick={triggerTrialProvisioning}
                disabled={loading}
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Cấp tài khoản Dùng thử 7 ngày (/api/mock/lms/trial-accounts)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel 3: Entitlement Management & S06 Renewal */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">3. Quản lý Quyền Cấp phép (Entitlement & Renewal S06)</CardTitle>
                <CardDescription className="text-xs">Theo dõi thời hạn gói học, kích hoạt tự động từ Đơn hàng & hỗ trợ AI Agent tư vấn gia hạn</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-purple-400 border-purple-500/30 text-[10px]">
              Tự động cấp 90 ngày khi Order = PAID
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {entitlements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              Chưa có Entitlement nào. Hãy dùng Mock Billing ở trên để kích hoạt thanh toán một đơn hàng, hệ thống sẽ tự động cấp quyền!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground text-left">
                    <th className="pb-2 font-medium">Học viên</th>
                    <th className="pb-2 font-medium">Khóa học / Gói</th>
                    <th className="pb-2 font-medium">Loại</th>
                    <th className="pb-2 font-medium">Trạng thái</th>
                    <th className="pb-2 font-medium">Ngày hết hạn</th>
                    <th className="pb-2 font-medium">Thời hạn còn lại</th>
                    <th className="pb-2 font-medium text-right">Thao tác mô phỏng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {entitlements.map((ent) => (
                    <tr key={ent.id} className="hover:bg-muted/20">
                      <td className="py-2.5 font-medium">
                        {ent.student?.name} <span className="text-muted-foreground font-mono">({ent.student?.code})</span>
                      </td>
                      <td className="py-2.5">{ent.course?.name}</td>
                      <td className="py-2.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {ent.type}
                        </Badge>
                      </td>
                      <td className="py-2.5">
                        <Badge 
                          variant="outline" 
                          className={
                            ent.status === "ACTIVE" 
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]"
                              : "bg-red-500/10 text-red-500 border-red-500/30 text-[10px]"
                          }
                        >
                          {ent.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-mono text-[11px]">
                        {new Date(ent.expiresAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-2.5">
                        {ent.isExpired ? (
                          <span className="text-red-400 font-semibold">Đã hết hạn</span>
                        ) : ent.isExpiringSoon ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Còn {ent.daysRemaining} ngày (Sắp hết hạn!)
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">Còn {ent.daysRemaining} ngày</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-2"
                          onClick={() => handleEntitlementAction(ent.id, "renew")}
                          disabled={loading}
                        >
                          +30 ngày
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10 px-2"
                          onClick={() => handleEntitlementAction(ent.id, "expire")}
                          disabled={loading}
                        >
                          Hết hạn ngay
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Event & Response Log Console */}
      {consoleLog && (
        <Card className="border-border/60 shadow-sm bg-black/60 text-green-400 font-mono text-xs">
          <CardHeader className="py-2.5 px-4 border-b border-border/40 bg-zinc-950/80 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="font-semibold text-white">{consoleLog.title}</span>
              <span className="text-zinc-500">[{consoleLog.timestamp}]</span>
            </div>
            <Badge 
              variant="outline" 
              className={consoleLog.type === "success" ? "text-emerald-400 border-emerald-500/40" : "text-red-400 border-red-500/40"}
            >
              {consoleLog.type === "success" ? "HTTP 200 OK" : "ERROR"}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div>
              <span className="text-zinc-400 font-semibold block mb-1">▶ Outgoing Mock Webhook Payload:</span>
              <pre className="p-2.5 rounded bg-zinc-950 text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(consoleLog.payload, null, 2)}
              </pre>
            </div>
            <div>
              <span className="text-zinc-400 font-semibold block mb-1">◀ SIS Incoming Webhook Response:</span>
              <pre className="p-2.5 rounded bg-zinc-950 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(consoleLog.response, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
