"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClass, updateClass, deleteClass } from "../actions/class";
import { Search, Plus, Trash2, Edit } from "lucide-react";

export function ClassesClient({ classes, courses, facilities, teachers }: { classes: any[], courses: any[], facilities: any[], teachers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const filtered = classes.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  async function handleAdd(formData: FormData) {
    setIsPending(true);
    const res = await createClass(formData);
    setIsPending(false);
    if (res.success) setIsAddModalOpen(false);
    else alert(res.error);
  }

  async function handleUpdate(formData: FormData) {
    if (!editingClass) return;
    setIsPending(true);
    const res = await updateClass(editingClass.id, formData);
    setIsPending(false);
    if (res.success) setEditingClass(null);
    else alert(res.error);
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa lớp học này?")) {
      const res = await deleteClass(id);
      if (res.error) alert(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Tìm lớp học..." className="w-full pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Thêm lớp học</Button>
        
        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm lớp học mới</DialogTitle></DialogHeader>
            <form action={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Mã lớp</Label><Input name="code" placeholder="VD: IELTS-HCM-01" required /></div>
              <div className="grid gap-2"><Label>Tên lớp</Label><Input name="name" placeholder="VD: Lớp IELTS Tối 2-4-6 Bình Thạnh" required /></div>
              <div className="grid gap-2">
                <Label>Khóa học</Label>
                <Select name="courseId" required>
                  <SelectTrigger><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Cơ sở</Label>
                <Select name="facilityId" required>
                  <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent>{facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Giáo viên (Tùy chọn)</Label>
                <Select name="teacherId">
                  <SelectTrigger><SelectValue placeholder="Chọn giáo viên" /></SelectTrigger>
                  <SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Sĩ số tối đa</Label><Input type="number" name="capacity" defaultValue="20" required /></div>
              <Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu"}</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Chỉnh sửa lớp học</DialogTitle></DialogHeader>
            {editingClass && (
              <form action={handleUpdate} className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Mã lớp</Label><Input name="code" defaultValue={editingClass.code} required /></div>
                <div className="grid gap-2"><Label>Tên lớp</Label><Input name="name" defaultValue={editingClass.name} required /></div>
                <div className="grid gap-2">
                  <Label>Khóa học</Label>
                  <Select name="courseId" defaultValue={editingClass.courseId} required>
                    <SelectTrigger><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                    <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Cơ sở</Label>
                  <Select name="facilityId" defaultValue={editingClass.facilityId} required>
                    <SelectTrigger><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                    <SelectContent>{facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Giáo viên</Label>
                  <Select name="teacherId" defaultValue={editingClass.teacherId || ""}>
                    <SelectTrigger><SelectValue placeholder="Chưa phân công" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chưa phân công</SelectItem>
                      {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2"><Label>Sĩ số tối đa</Label><Input type="number" name="capacity" defaultValue={editingClass.capacity} required /></div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select name="status" defaultValue={editingClass.status || "ONGOING"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONGOING">ONGOING (Đang diễn ra)</SelectItem>
                      <SelectItem value="UPCOMING">UPCOMING (Sắp mở)</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED (Đã kết thúc)</SelectItem>
                      <SelectItem value="PAUSED">PAUSED (Tạm dừng)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingClass(null)}>Hủy</Button>
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
              <TableHead>Mã</TableHead>
              <TableHead>Tên Lớp</TableHead>
              <TableHead>Khóa Học</TableHead>
              <TableHead>Giáo Viên</TableHead>
              <TableHead>Cơ Sở</TableHead>
              <TableHead>Sĩ Số</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(cls => (
              <TableRow key={cls.id}>
                <TableCell className="font-medium">{cls.code}</TableCell>
                <TableCell>{cls.name}</TableCell>
                <TableCell>{cls.course?.name}</TableCell>
                <TableCell>{cls.teacher?.name || "-"}</TableCell>
                <TableCell>{cls.facility?.name}</TableCell>
                <TableCell>{cls.students?.length || 0} / {cls.capacity}</TableCell>
                <TableCell>
                  <Badge variant={cls.status === 'ONGOING' ? 'default' : cls.status === 'UPCOMING' ? 'outline' : 'secondary'}>
                    {cls.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingClass(cls)} title="Chỉnh sửa">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id)} title="Xóa">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

