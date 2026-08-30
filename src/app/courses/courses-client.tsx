"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import { createCourse, updateCourse, deleteCourse } from "../actions/course";

export function CoursesClient({ courses }: { courses: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const filtered = courses.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));

  async function handleAdd(formData: FormData) {
    setIsPending(true);
    const res = await createCourse(formData);
    setIsPending(false);
    if (res.success) setIsAddModalOpen(false);
    else alert(res.error);
  }

  async function handleUpdate(formData: FormData) {
    if (!editingCourse) return;
    setIsPending(true);
    const res = await updateCourse(editingCourse.id, formData);
    setIsPending(false);
    if (res.success) setEditingCourse(null);
    else alert(res.error);
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa khóa học này? Các lớp học liên quan có thể bị ảnh hưởng.")) {
      const res = await deleteCourse(id);
      if (res.error) alert(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Tìm khóa học..." className="w-full pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Thêm khóa học</Button>
        
        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm khóa học</DialogTitle></DialogHeader>
            <form action={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Mã khóa học</Label><Input name="code" placeholder="VD: IELTS-INT" required /></div>
              <div className="grid gap-2"><Label>Tên khóa học</Label><Input name="name" placeholder="VD: Luyện thi IELTS Intermediate" required /></div>
              <div className="grid gap-2"><Label>Phân loại (Type)</Label><Input name="type" placeholder="VD: Luyện thi IELTS" /></div>
              <div className="grid gap-2"><Label>Số buổi (Thời lượng)</Label><Input type="number" name="duration" placeholder="36" /></div>
              <div className="grid gap-2"><Label>Học phí (VND)</Label><Input type="number" name="fee" placeholder="8000000" /></div>
              <Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu"}</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Chỉnh sửa khóa học</DialogTitle></DialogHeader>
            {editingCourse && (
              <form action={handleUpdate} className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Mã khóa học</Label><Input name="code" defaultValue={editingCourse.code} required /></div>
                <div className="grid gap-2"><Label>Tên khóa học</Label><Input name="name" defaultValue={editingCourse.name} required /></div>
                <div className="grid gap-2"><Label>Phân loại (Type)</Label><Input name="type" defaultValue={editingCourse.type || ""} /></div>
                <div className="grid gap-2"><Label>Số buổi (Thời lượng)</Label><Input type="number" name="duration" defaultValue={editingCourse.duration} /></div>
                <div className="grid gap-2"><Label>Học phí (VND)</Label><Input type="number" name="fee" defaultValue={editingCourse.fee || 0} /></div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingCourse(null)}>Hủy</Button>
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
              <TableHead>Tên khóa học</TableHead>
              <TableHead>Phân loại</TableHead>
              <TableHead>Số buổi</TableHead>
              <TableHead>Học phí</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.code}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.type}</TableCell>
                <TableCell>{c.duration}</TableCell>
                <TableCell>{c.fee ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.fee) : '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingCourse(c)} title="Chỉnh sửa">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} title="Xóa">
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

