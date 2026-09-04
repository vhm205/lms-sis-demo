"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder, updateOrder, updateOrderStatus, deleteOrder } from "@/app/actions/order";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useTableHighlight } from "@/hooks/use-table-highlight";
import { cn } from "@/lib/utils";
import { ORDER_STATUS_OPTIONS, getOrderStatusLabel } from "@/lib/constants";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Receipt, 
  Phone, 
  Building2, 
  BookOpen, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle,
  CreditCard
} from "lucide-react";

export function OrdersClient({ orders, courses, facilities }: { orders: any[], courses: any[], facilities: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { selectedFacilityId, selectedFacility, setSelectedFacilityId, facilities: ctxFacilities, getFacilityName } = useFacility();
  const availableFacilities = ctxFacilities.length > 0 ? ctxFacilities : facilities;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const matchFacility = (o: any) => {
    if (selectedFacilityId === "all") return true;
    if (o.facilityId && o.facilityId === selectedFacilityId) return true;
    if (o.facility?.id && o.facility.id === selectedFacilityId) return true;
    if (selectedFacility && o.facility?.name === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (o.facility?.name?.includes("Cầu Giấy") || o.facilityId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (o.facility?.name?.includes("Bình Thạnh") || o.facilityId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (o.facility?.name?.includes("Hải Châu") || o.facilityId?.includes("hai-chau"))) return true;
    return false;
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = 
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.parentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.parentPhone.includes(searchTerm);
    const matchStatus = selectedStatus === "all" || o.status === selectedStatus;
    return matchSearch && matchStatus && matchFacility(o);
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems: paginatedOrders,
    totalItems: totalFilteredOrders,
  } = usePagination(filteredOrders, 20);

  const {
    highlightedId,
    highlightedItem,
    isHighlighted,
    clearHighlight,
  } = useTableHighlight({
    items: orders,
    filteredItems: filteredOrders,
    getId: (o) => o.id,
    getSecondaryId: (o) => o.code,
    getFacilityId: (o) => o.facilityId || o.facility?.id,
    getStatus: (o) => o.status,
    pageSize,
    setCurrentPage,
    selectedFacilityId,
    setSelectedFacilityId,
    selectedStatus,
    setSelectedStatus,
    searchTerm,
    setSearchTerm,
  });

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const ordersInFacility = orders.filter(matchFacility);

  const totalAmount = ordersInFacility.reduce((sum, o) => sum + o.amount, 0);
  const paidAmount = ordersInFacility.filter(o => o.status === 'PAID').reduce((sum, o) => sum + o.amount, 0);
  const pendingAmount = ordersInFacility.filter(o => o.status === 'PENDING').reduce((sum, o) => sum + o.amount, 0);

  async function handleAdd(formData: FormData) {
    setIsPending(true);
    const result = await createOrder(formData);
    setIsPending(false);
    if (result.success) {
      setIsAddModalOpen(false);
    } else {
      alert(result.error);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingOrder) return;
    setIsPending(true);
    const result = await updateOrder(editingOrder.id, formData);
    setIsPending(false);
    if (result.success) {
      setEditingOrder(null);
    } else {
      alert(result.error);
    }
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await updateOrderStatus(id, newStatus);
    if (res.error) alert(res.error);
  }

  async function handleDelete(id: string) {
    if (confirm("Bạn có chắc chắn muốn xóa đơn này?")) {
      const result = await deleteOrder(id);
      if (result.error) alert(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Financial Summary Cards */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-bold font-heading">Tổng giá trị đơn hàng ({ordersInFacility.length} đơn)</span>
            <div className="text-2xl font-black font-heading text-foreground">{formatVND(totalAmount)}</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#E6F8FB] text-[#0284C7] shadow-sm">
            <Receipt className="h-6 w-6" />
          </div>
        </div>

        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-bold font-heading">Đã thanh toán (Thực thu)</span>
            <div className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">{formatVND(paidAmount)}</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#F0FDF4] text-[#16A34A] shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-bold font-heading">Chưa thu tiền (Công nợ)</span>
            <div className="text-2xl font-black font-heading text-amber-600 dark:text-amber-400">{formatVND(pendingAmount)}</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#FFFBEB] text-[#D97706] shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Tìm theo mã đơn, phụ huynh, SĐT..." 
              className="w-full pl-10 h-10 text-xs font-semibold rounded-2xl bg-card border-2" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "all")}>
            <SelectTrigger className="w-[160px] h-10 text-xs">
              <SelectValue placeholder="Trạng thái thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {ORDER_STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedFacilityId} onValueChange={(val) => setSelectedFacilityId(val || "all")}>
            <SelectTrigger className="w-[160px] h-10 text-xs">
              <SelectValue placeholder="Tất cả cơ sở">
                {getFacilityName(selectedFacilityId)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cơ sở</SelectItem>
              {availableFacilities.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2.5 shrink-0">
          <RefreshButton 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 shrink-0 bg-card hover:bg-muted/80 shadow-2xs" 
          />
          
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="clay-btn-primary gap-2 h-10 px-5 rounded-2xl text-xs font-extrabold shrink-0"
          >
            <Plus className="h-4 w-4" /> Tạo đơn đăng ký mới
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <Receipt className="h-5 w-5 text-primary" /> Tạo đơn đăng ký khóa học
            </DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="grid gap-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Họ tên phụ huynh *</Label>
                <Input name="parentName" placeholder="Họ tên phụ huynh" required className="h-10 text-xs font-semibold" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">SĐT phụ huynh *</Label>
                <Input name="parentPhone" placeholder="0912..." required className="h-10 text-xs font-mono font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Khóa học *</Label>
                <Select name="courseId" required>
                  <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Cơ sở đăng ký *</Label>
                <Select name="facilityId" required>
                  <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent>{facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-bold font-heading">Số tiền học phí (VND) *</Label>
              <Input name="amount" type="number" defaultValue="8000000" required className="h-10 text-xs font-mono font-bold" />
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-bold font-heading">Ghi chú đơn hàng</Label>
              <Input name="notes" placeholder="Ghi chú ưu đãi, phương thức thanh toán..." className="h-10 text-xs font-medium" />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                {isPending ? "Đang lưu..." : "Lưu Đơn Đăng Ký"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <Edit className="h-5 w-5 text-primary" /> Chỉnh sửa đơn đăng ký
            </DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <form key={editingOrder.id} action={handleUpdate} className="grid gap-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Họ tên phụ huynh</Label>
                  <Input name="parentName" defaultValue={editingOrder.parentName} required className="h-10 text-xs font-semibold" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">SĐT phụ huynh</Label>
                  <Input name="parentPhone" defaultValue={editingOrder.parentPhone} required className="h-10 text-xs font-mono font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Khóa học</Label>
                  <Select name="courseId" defaultValue={editingOrder.courseId} required>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                    <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Cơ sở</Label>
                  <Select name="facilityId" defaultValue={editingOrder.facilityId} required>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                    <SelectContent>{facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Số tiền (VND)</Label>
                  <Input name="amount" type="number" defaultValue={editingOrder.amount} required className="h-10 text-xs font-mono font-bold" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Trạng thái thanh toán</Label>
                  <Select name="status" defaultValue={editingOrder.status || "PENDING"}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Ghi chú</Label>
                <Input name="notes" defaultValue={editingOrder.notes || ""} className="h-10 text-xs font-medium" />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingOrder(null)}>Hủy</Button>
                <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                  {isPending ? "Đang cập nhật..." : "Cập nhật đơn"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Search Highlight Alert Banner */}
      {highlightedItem && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FFF0E6] dark:bg-[#352114] border-2 border-[#FCDCC8] dark:border-[#523824] text-xs font-bold text-[#D97736] dark:text-[#FBAA78] shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#D97736] animate-ping shrink-0" />
            <span className="truncate">
              Đang làm nổi bật đơn hàng được chọn từ tìm kiếm nhanh:{" "}
              <span className="font-extrabold underline font-heading text-foreground">{highlightedItem.parentName}</span>{" "}
              <span className="font-mono text-[11px] font-bold">({highlightedItem.code})</span>
            </span>
          </div>
          <button
            type="button"
            onClick={clearHighlight}
            className="text-xs font-semibold px-3 py-1 rounded-xl bg-card border border-border/80 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0 ml-3"
          >
            Bỏ đánh dấu
          </button>
        </div>
      )}

      {/* Orders Table */}
      <div className="clay-card overflow-hidden p-0 border-2">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Mã Đơn</TableHead>
              <TableHead>Phụ Huynh / SĐT</TableHead>
              <TableHead>Khóa Học Đăng Ký</TableHead>
              <TableHead>Cơ Sở</TableHead>
              <TableHead>Học Phí</TableHead>
              <TableHead className="w-[190px]">Thanh Toán</TableHead>
              <TableHead className="w-[110px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                  Không tìm thấy đơn đăng ký nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => {
                const isRowHighlighted = isHighlighted(order);

                return (
                  <TableRow 
                    key={order.id} 
                    id={`row-highlight-${order.id}`}
                    className={cn(
                      "transition-all duration-300",
                      isRowHighlighted
                        ? "bg-[#FFF0E6]/95 dark:bg-[#352114]/95 border-2 border-primary ring-2 ring-primary/60 shadow-md row-highlight-active"
                        : "hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors"
                    )}
                  >
                    <TableCell className="font-mono text-xs font-black text-primary">
                      <div className="flex items-center gap-2">
                        <span>{order.code}</span>
                        {isRowHighlighted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white shadow-xs animate-pulse">
                            🎯 Đã chọn
                          </span>
                        )}
                      </div>
                    </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3 py-1">
                      <div className="clay-icon-tile h-10 w-10 bg-[#FFF0E6] text-[#D97736] font-bold text-xs shrink-0 shadow-2xs">
                        {order.parentName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-foreground font-heading">{order.parentName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono font-medium">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {order.parentPhone}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-foreground font-heading">{order.course?.name}</div>
                      {order.course?.type && (
                        <Badge variant="orange" className="text-[10px] px-2 py-0.5 font-semibold">
                          {order.course.type}
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{order.facility?.name}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-black text-sm text-[#D97736] font-mono">
                      {formatVND(order.amount)}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Select 
                      defaultValue={order.status} 
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="w-[170px] h-10 text-xs font-bold rounded-xl border-2">
                        <SelectValue placeholder={getOrderStatusLabel(order.status)} />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl text-primary hover:bg-[#FFF0E6] hover:text-[#D97736]" 
                        onClick={() => setEditingOrder(order)} 
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50" 
                        onClick={() => handleDelete(order.id)} 
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
        totalItems={totalFilteredOrders}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="đơn đăng ký"
      />
    </div>
  );
}
