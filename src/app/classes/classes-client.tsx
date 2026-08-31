"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClass, updateClass, deleteClass } from "../actions/class";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { CLASS_STATUS_OPTIONS, getClassStatusLabel, CLASS_STATUS_MAP } from "@/lib/constants";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  GraduationCap, 
  Users, 
  Building2, 
  User, 
  Layers,
  BookOpen
} from "lucide-react";

export function ClassesClient({ classes, courses, facilities, teachers }: { classes: any[], courses: any[], facilities: any[], teachers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const { selectedFacilityId, selectedFacility, setSelectedFacilityId, facilities: ctxFacilities, getFacilityName } = useFacility();
  const availableFacilities = ctxFacilities.length > 0 ? ctxFacilities : facilities;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const matchFacility = (c: any) => {
    if (selectedFacilityId === "all") return true;
    if (c.facilityId && c.facilityId === selectedFacilityId) return true;
    if (c.facility?.id && c.facility.id === selectedFacilityId) return true;
    if (selectedFacility && c.facility?.name === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (c.facility?.name?.includes("Cầu Giấy") || c.facilityId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (c.facility?.name?.includes("Bình Thạnh") || c.facilityId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (c.facility?.name?.includes("Hải Châu") || c.facilityId?.includes("hai-chau"))) return true;
    return false;
  };

  const filtered = classes.filter(c => {
    const matchSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = selectedCourse === "all" || c.courseId === selectedCourse;
    return matchSearch && matchCourse && matchFacility(c);
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems: paginatedClasses,
    totalItems: totalFilteredClasses,
  } = usePagination(filtered, 15);

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
    if (confirm("Bạn có chắc chắn muốn xóa lớp học này?")) {
      const res = await deleteClass(id);
      if (res.error) alert(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Action and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Tìm theo tên hoặc mã lớp..." 
              className="w-full pl-10 h-10 text-xs font-semibold rounded-2xl bg-card border-2" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <Select value={selectedCourse} onValueChange={(val) => setSelectedCourse(val || "all")}>
            <SelectTrigger className="w-[150px] h-10 text-xs">
              <SelectValue placeholder="Khóa học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khóa học</SelectItem>
              {courses.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
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
            <Plus className="h-4 w-4" /> Mở lớp học mới
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <GraduationCap className="h-5 w-5 text-primary" /> Mở lớp học mới
            </DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="grid gap-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Mã lớp *</Label>
                <Input name="code" placeholder="VD: IELTS-HCM-01" required className="h-10 text-xs font-mono font-bold" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Sĩ số tối đa *</Label>
                <Input type="number" name="capacity" defaultValue="20" required className="h-10 text-xs font-semibold" />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-bold font-heading">Tên lớp học *</Label>
              <Input name="name" placeholder="VD: Lớp IELTS Tối 2-4-6 Cầu Giấy" required className="h-10 text-xs font-semibold" />
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
                <Label className="text-xs font-bold font-heading">Cơ sở đào tạo *</Label>
                <Select name="facilityId" required>
                  <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                  <SelectContent>{facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-bold font-heading">Giáo viên phụ trách</Label>
              <Select name="teacherId">
                <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn giáo viên (Tùy chọn)" /></SelectTrigger>
                <SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                {isPending ? "Đang lưu..." : "Lưu Lớp Học"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <Edit className="h-5 w-5 text-primary" /> Chỉnh sửa lớp học
            </DialogTitle>
          </DialogHeader>
          {editingClass && (
            <form action={handleUpdate} className="grid gap-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Mã lớp</Label>
                  <Input name="code" defaultValue={editingClass.code} required className="h-10 text-xs font-mono font-bold" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Sĩ số tối đa</Label>
                  <Input type="number" name="capacity" defaultValue={editingClass.capacity} required className="h-10 text-xs font-semibold" />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Tên lớp học</Label>
                <Input name="name" defaultValue={editingClass.name} required className="h-10 text-xs font-semibold" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Khóa học</Label>
                  <Select name="courseId" defaultValue={editingClass.courseId} required>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn khóa học" /></SelectTrigger>
                    <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Cơ sở</Label>
                  <Select name="facilityId" defaultValue={editingClass.facilityId} required>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn cơ sở" /></SelectTrigger>
                    <SelectContent>{facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Giáo viên phụ trách</Label>
                  <Select name="teacherId" defaultValue={editingClass.teacherId || "none"}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chưa phân công" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Chưa phân công</SelectItem>
                      {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Trạng thái lớp</Label>
                  <Select name="status" defaultValue={editingClass.status || "ONGOING"}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CLASS_STATUS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingClass(null)}>Hủy</Button>
                <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                  {isPending ? "Đang cập nhật..." : "Cập nhật lớp"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Classes Table */}
      <div className="clay-card overflow-hidden p-0 border-2">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Mã Lớp</TableHead>
              <TableHead>Tên Lớp Học</TableHead>
              <TableHead>Khóa Học</TableHead>
              <TableHead>Giáo Viên</TableHead>
              <TableHead>Cơ Sở</TableHead>
              <TableHead className="w-[190px]">Sĩ Số & Lấp Đầy</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="w-[110px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClasses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                  Không tìm thấy lớp học nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              paginatedClasses.map((cls) => {
                const studentCount = cls.students?.length || 0;
                const ratio = Math.round((studentCount / cls.capacity) * 100);

                return (
                  <TableRow key={cls.id} className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors">
                    <TableCell className="font-mono text-xs font-black text-primary">
                      {cls.code}
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-sm text-foreground font-heading py-1">{cls.name}</div>
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <span>{cls.course?.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {cls.teacher ? (
                        <div className="flex items-center gap-2.5">
                          <div className="clay-icon-tile h-9 w-9 bg-[#FFF0E6] text-[#D97736] font-bold text-xs shadow-2xs">
                            {cls.teacher.name.slice(0, 1)}
                          </div>
                          <span className="text-xs text-foreground font-bold font-heading">{cls.teacher.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic font-medium">Chưa phân công</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{cls.facility?.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-2 py-1 w-36">
                        <div className="flex justify-between text-xs">
                          <span className="font-black text-foreground font-mono">{studentCount} / {cls.capacity}</span>
                          <span className="text-xs text-muted-foreground font-bold">{ratio}%</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              ratio >= 90 ? 'bg-rose-500' : ratio >= 70 ? 'bg-gradient-to-r from-amber-400 to-[#F2994A]' : 'bg-gradient-to-r from-sky-400 to-[#E08E58]'
                            }`} 
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant={CLASS_STATUS_MAP[cls.status]?.badgeVariant || 'outline'}
                        className="text-xs px-3 py-1"
                      >
                        {getClassStatusLabel(cls.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-primary hover:bg-[#FFF0E6] hover:text-[#D97736]" 
                          onClick={() => setEditingClass(cls)} 
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50" 
                          onClick={() => handleDelete(cls.id)} 
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
        totalItems={totalFilteredClasses}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="lớp học"
      />
    </div>
  );
}
