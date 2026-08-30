"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createLead, updateLead, updateLeadStatus, deleteLead } from "../actions/lead";
import { Search, Plus, Trash2, Edit } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "NEW", label: "Mới" },
  { value: "CONTACTED", label: "Đã liên hệ" },
  { value: "CONSULTING", label: "Đang tư vấn" },
  { value: "TRIAL_BOOKED", label: "Đã đặt lịch thử" },
  { value: "ENROLLED", label: "Đã đăng ký" },
  { value: "UNSUITABLE", label: "Chưa phù hợp" },
];

export function LeadsClient({ leads, courses, facilities }: { leads: any[], courses: any[], facilities: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const filtered = leads.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm));

  async function handleAdd(formData: FormData) {
    setIsPending(true);
    const res = await createLead(formData);
    setIsPending(false);
    if (res.success) setIsAddModalOpen(false);
    else alert(res.error);
  }

  async function handleUpdate(formData: FormData) {
    if (!editingLead) return;
    setIsPending(true);
    const res = await updateLead(editingLead.id, formData);
    setIsPending(false);
    if (res.success) setEditingLead(null);
    else alert(res.error);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await updateLeadStatus(id, newStatus);
    if (res.error) alert(res.error);
  }

  async function handleDelete(id: string) {
    if (confirm("Bạn có chắc muốn xóa lead này?")) {
      const res = await deleteLead(id);
      if (res.error) alert(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Tìm theo tên, SĐT..." className="w-full pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Thêm KH tiềm năng</Button>
        
        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm khách hàng tiềm năng</DialogTitle></DialogHeader>
            <form action={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Họ Tên</Label><Input name="name" placeholder="Họ tên phụ huynh/học viên" required /></div>
              <div className="grid gap-2"><Label>SĐT</Label><Input name="phone" placeholder="Số điện thoại" required /></div>
              <div className="grid gap-2">
                <Label>Khóa học quan tâm</Label>
                <Select name="courseId">
                  <SelectTrigger><SelectValue placeholder="Tùy chọn" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Cơ sở muốn học</Label>
                <Select name="facilityId">
                  <SelectTrigger><SelectValue placeholder="Tùy chọn" /></SelectTrigger>
                  <SelectContent>{facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Ghi chú</Label><Input name="notes" placeholder="Ghi chú nhu cầu..." /></div>
              <Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu"}</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Chỉnh sửa khách hàng tiềm năng</DialogTitle></DialogHeader>
            {editingLead && (
              <form action={handleUpdate} className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Họ Tên</Label><Input name="name" defaultValue={editingLead.name} required /></div>
                <div className="grid gap-2"><Label>SĐT</Label><Input name="phone" defaultValue={editingLead.phone} required /></div>
                <div className="grid gap-2">
                  <Label>Khóa học quan tâm</Label>
                  <Select name="courseId" defaultValue={editingLead.courseId || ""}>
                    <SelectTrigger><SelectValue placeholder="Tùy chọn" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn</SelectItem>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Cơ sở muốn học</Label>
                  <Select name="facilityId" defaultValue={editingLead.facilityId || ""}>
                    <SelectTrigger><SelectValue placeholder="Tùy chọn" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn</SelectItem>
                      {facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select name="status" defaultValue={editingLead.status || "NEW"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2"><Label>Ghi chú</Label><Input name="notes" defaultValue={editingLead.notes || ""} /></div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingLead(null)}>Hủy</Button>
                  <Button type="submit" disabled={isPending}>{isPending ? "Đang cập nhật..." : "Cập nhật"}</Button>
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
              <TableHead>Tên / SĐT</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Cơ sở</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Không tìm thấy KH tiềm năng nào.</TableCell></TableRow>
            ) : (
              filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}<br/><span className="text-sm text-muted-foreground">{lead.phone}</span></TableCell>
                  <TableCell>{lead.course?.name || "-"}</TableCell>
                  <TableCell>{lead.facility?.name || "-"}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={lead.notes}>{lead.notes || "-"}</TableCell>
                  <TableCell>
                    <Select defaultValue={lead.status} onValueChange={(val) => handleStatusChange(lead.id, val)}>
                      <SelectTrigger className="w-[140px] h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingLead(lead)} title="Chỉnh sửa">
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)} title="Xóa">
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

