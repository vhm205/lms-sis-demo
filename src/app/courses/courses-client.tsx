"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Trash2, Edit, BookOpen, Clock, Tag, Award } from "lucide-react";
import { createCourse, updateCourse, deleteCourse } from "../actions/course";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";

export function CoursesClient({ courses }: { courses: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const filtered = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.type && c.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems: paginatedCourses,
    totalItems: totalFilteredCourses,
  } = usePagination(filtered, 10);

  const formatVND = (amount: number | null) => {
    if (!amount) return "-";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

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
    if (confirm("Bạn có chắc muốn xóa khóa học này?")) {
      const res = await deleteCourse(id);
      if (res.error) alert(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Tìm theo mã hoặc tên khóa học..." 
            className="w-full pl-11 h-11 text-xs font-semibold rounded-2xl bg-card border-2" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2.5 shrink-0">
          <RefreshButton 
            variant="outline" 
            size="icon" 
            className="h-11 w-11 shrink-0 bg-card hover:bg-muted/80 shadow-2xs" 
          />
          
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="clay-btn-primary gap-2 h-11 px-6 rounded-2xl text-xs font-extrabold shrink-0"
          >
            <Plus className="h-4.5 w-4.5" /> Mở khóa học mới
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <BookOpen className="h-5 w-5 text-primary" /> Mở khóa học mới
            </DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="grid gap-4 py-3">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Mã khóa học *</Label>
                <Input name="code" placeholder="VD: IELTS-6.5" required className="h-10 text-xs font-mono font-bold" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Phân loại (Type)</Label>
                <Input name="type" placeholder="Tiếng Anh, Luyện thi..." className="h-10 text-xs font-semibold" />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-bold font-heading">Tên khóa học *</Label>
              <Input name="name" placeholder="VD: Khóa luyện thi IELTS Chuyên Sâu 6.5+" required className="h-10 text-xs font-semibold" />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Số buổi học</Label>
                <Input type="number" name="duration" defaultValue="36" className="h-10 text-xs font-semibold" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Học phí niêm yết (VND)</Label>
                <Input type="number" name="fee" defaultValue="8000000" className="h-10 text-xs font-mono font-semibold" />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                {isPending ? "Đang lưu..." : "Lưu Khóa Học"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <Edit className="h-5 w-5 text-primary" /> Chỉnh sửa khóa học
            </DialogTitle>
          </DialogHeader>
          {editingCourse && (
            <form key={editingCourse.id} action={handleUpdate} className="grid gap-4 py-3">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Mã khóa học</Label>
                  <Input name="code" defaultValue={editingCourse.code} required className="h-10 text-xs font-mono font-bold" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Phân loại (Type)</Label>
                  <Input name="type" defaultValue={editingCourse.type || ""} className="h-10 text-xs font-semibold" />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Tên khóa học</Label>
                <Input name="name" defaultValue={editingCourse.name} required className="h-10 text-xs font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Số buổi học</Label>
                  <Input type="number" name="duration" defaultValue={editingCourse.duration} className="h-10 text-xs font-semibold" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Học phí (VND)</Label>
                  <Input type="number" name="fee" defaultValue={editingCourse.fee || 0} className="h-10 text-xs font-mono font-semibold" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingCourse(null)}>Hủy</Button>
                <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                  {isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Courses Table */}
      <div className="clay-card overflow-hidden p-0 border-2">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[130px]">Mã Khóa</TableHead>
              <TableHead>Tên Chương Trình Đào Tạo</TableHead>
              <TableHead>Phân Loại</TableHead>
              <TableHead>Thời Lượng</TableHead>
              <TableHead>Học Phí</TableHead>
              <TableHead className="w-[110px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                  Không tìm thấy khóa học nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCourses.map((c) => (
                <TableRow key={c.id} className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors">
                  <TableCell className="font-mono text-xs font-black text-primary">
                    {c.code}
                  </TableCell>

                  <TableCell>
                    <div className="font-bold text-sm text-foreground font-heading py-1">{c.name}</div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="orange" className="text-xs px-3 py-1">
                      {c.type || "Chung"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{c.duration} buổi</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-black text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatVND(c.fee)}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl text-primary hover:bg-[#FFF0E6] hover:text-[#D97736]" 
                        onClick={() => setEditingCourse(c)} 
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50" 
                        onClick={() => handleDelete(c.id)} 
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <DataPagination
        currentPage={currentPage}
        totalItems={totalFilteredCourses}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="khóa học"
      />
    </div>
  );
}
