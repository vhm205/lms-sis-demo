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
import { createStudent, updateStudent, deleteStudent } from "../actions/student";
import { Search, Plus, Trash2, Edit } from "lucide-react";

export function StudentsClient({ students, facilities }: { students: any[], facilities: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.parent?.phone && s.parent.phone.includes(searchTerm))
  );

  async function handleAdd(formData: FormData) {
    setIsPending(true);
    const result = await createStudent(formData);
    setIsPending(false);
    if (result.success) {
      setIsAddModalOpen(false);
    } else {
      alert(result.error);
    }
  }

  async function handleUpdate(formData: FormData) {
    if (!editingStudent) return;
    setIsPending(true);
    const result = await updateStudent(editingStudent.id, formData);
    setIsPending(false);
    if (result.success) {
      setEditingStudent(null);
    } else {
      alert(result.error);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Bạn có chắc chắn muốn xóa học viên này?")) {
      const result = await deleteStudent(id);
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
            placeholder="Tìm theo tên, mã HV, SĐT phụ huynh..." 
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Thêm học viên
        </Button>
        
        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thêm học viên mới</DialogTitle>
            </DialogHeader>
            <form action={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Mã HV</Label>
                <Input id="code" name="code" placeholder="VD: HV0099" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Họ Tên</Label>
                <Input id="name" name="name" placeholder="Tên học viên" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">SĐT Học Viên</Label>
                <Input id="phone" name="phone" placeholder="Để trống nếu không có" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="facilityId">Cơ Sở</Label>
                <Select name="facilityId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cơ sở" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parentName">Tên Phụ Huynh</Label>
                <Input id="parentName" name="parentName" placeholder="Họ tên phụ huynh" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parentPhone">SĐT Phụ Huynh</Label>
                <Input id="parentPhone" name="parentPhone" placeholder="SĐT phụ huynh" />
              </div>
              <Button type="submit" className="mt-2" disabled={isPending}>
                {isPending ? "Đang lưu..." : "Lưu Học Viên"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa học viên</DialogTitle>
            </DialogHeader>
            {editingStudent && (
              <form action={handleUpdate} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-code">Mã HV</Label>
                  <Input id="edit-code" name="code" defaultValue={editingStudent.code} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Họ Tên</Label>
                  <Input id="edit-name" name="name" defaultValue={editingStudent.name} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">SĐT Học Viên</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editingStudent.phone || ""} placeholder="Để trống nếu không có" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-facilityId">Cơ Sở</Label>
                  <Select name="facilityId" defaultValue={editingStudent.facilityId || editingStudent.facility?.id} required>
                    <SelectTrigger id="edit-facilityId">
                      <SelectValue placeholder="Chọn cơ sở" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-parentName">Tên Phụ Huynh</Label>
                  <Input id="edit-parentName" name="parentName" defaultValue={editingStudent.parent?.name || ""} placeholder="Họ tên phụ huynh" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-parentPhone">SĐT Phụ Huynh</Label>
                  <Input id="edit-parentPhone" name="parentPhone" defaultValue={editingStudent.parent?.phone || ""} placeholder="SĐT phụ huynh" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Trạng Thái</Label>
                  <Select name="status" defaultValue={editingStudent.status || "ACTIVE"}>
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Đang học</SelectItem>
                      <SelectItem value="INACTIVE">Nghỉ học</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>Hủy</Button>
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
              <TableHead>Mã HV</TableHead>
              <TableHead>Họ Tên</TableHead>
              <TableHead>Phụ Huynh</TableHead>
              <TableHead>Cơ Sở</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="w-[100px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy học viên nào.
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.code}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{student.name}</div>
                    {student.phone && <div className="text-xs text-muted-foreground">{student.phone}</div>}
                  </TableCell>
                  <TableCell>
                    {student.parent ? (
                      <>
                        <div className="font-medium">{student.parent.name}</div>
                        <div className="text-xs text-muted-foreground">{student.parent.phone}</div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{student.facility?.name}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {student.status === 'ACTIVE' ? 'Đang học' : 'Nghỉ học'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)} title="Chỉnh sửa">
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)} title="Xóa">
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

