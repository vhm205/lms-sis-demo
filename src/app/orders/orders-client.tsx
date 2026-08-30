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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrder, updateOrder, updateOrderStatus, deleteOrder } from "../actions/order";
import { Search, Plus, Trash2, Edit } from "lucide-react";

export function OrdersClient({ orders, courses, facilities }: { orders: any[], courses: any[], facilities: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const filteredOrders = orders.filter(o => 
    o.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.parentPhone.includes(searchTerm)
  );

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
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Tìm theo mã, tên, SĐT phụ huynh..." 
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Tạo đơn đăng ký
        </Button>
        
        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tạo đơn đăng ký khóa học</DialogTitle>
            </DialogHeader>
            <form action={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="parentName">Họ Tên Phụ Huynh</Label>
                <Input id="parentName" name="parentName" placeholder="Họ tên phụ huynh" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parentPhone">SĐT Phụ Huynh</Label>
                <Input id="parentPhone" name="parentPhone" placeholder="SĐT phụ huynh" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="courseId">Khóa Học</Label>
                <Select name="courseId" required>
                  <SelectTrigger><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="facilityId">Cơ Sở</Label>
                <Select name="facilityId" required>
                  <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent>
                    {facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Học phí (VND)</Label>
                <Input id="amount" name="amount" type="number" defaultValue="0" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Input id="notes" name="notes" placeholder="Ghi chú thêm..." />
              </div>
              <Button type="submit" className="mt-2" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu Đơn"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editingOrder} onOpenChange={(open) => !open && setEditingOrder(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa đơn đăng ký</DialogTitle>
            </DialogHeader>
            {editingOrder && (
              <form action={handleUpdate} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-parentName">Họ Tên Phụ Huynh</Label>
                  <Input id="edit-parentName" name="parentName" defaultValue={editingOrder.parentName} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-parentPhone">SĐT Phụ Huynh</Label>
                  <Input id="edit-parentPhone" name="parentPhone" defaultValue={editingOrder.parentPhone} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-courseId">Khóa Học</Label>
                  <Select name="courseId" defaultValue={editingOrder.courseId} required>
                    <SelectTrigger id="edit-courseId"><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                    <SelectContent>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-facilityId">Cơ Sở</Label>
                  <Select name="facilityId" defaultValue={editingOrder.facilityId} required>
                    <SelectTrigger id="edit-facilityId"><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                    <SelectContent>
                      {facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">Học phí (VND)</Label>
                  <Input id="edit-amount" name="amount" type="number" defaultValue={editingOrder.amount} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select name="status" defaultValue={editingOrder.status || "PENDING"}>
                    <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Chưa thu tiền</SelectItem>
                      <SelectItem value="PAID">Đã thanh toán</SelectItem>
                      <SelectItem value="CANCELLED">Hủy bỏ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-notes">Ghi chú</Label>
                  <Input id="edit-notes" name="notes" defaultValue={editingOrder.notes || ""} />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingOrder(null)}>Hủy</Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Đang cập nhật..." : "Cập nhật"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Đơn</TableHead>
              <TableHead>Phụ Huynh</TableHead>
              <TableHead>Khóa Học</TableHead>
              <TableHead>Cơ Sở</TableHead>
              <TableHead>Học Phí</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">Không tìm thấy đơn nào.</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.code}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.parentName}</div>
                    <div className="text-xs text-muted-foreground">{order.parentPhone}</div>
                  </TableCell>
                  <TableCell>{order.course?.name}</TableCell>
                  <TableCell>{order.facility?.name}</TableCell>
                  <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}</TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={order.status} 
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Chưa thu tiền</SelectItem>
                        <SelectItem value="PAID">Đã thanh toán</SelectItem>
                        <SelectItem value="CANCELLED">Hủy bỏ</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingOrder(order)} title="Chỉnh sửa">
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)} title="Xóa">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

