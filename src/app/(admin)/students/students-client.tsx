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
import { createStudent, updateStudent, deleteStudent } from "@/app/actions/student";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useTableHighlight } from "@/hooks/use-table-highlight";
import { cn } from "@/lib/utils";
import { STUDENT_STATUS_OPTIONS, getStudentStatusLabel } from "@/lib/constants";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Users, 
  Phone, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  XCircle,
  Filter,
  UserCheck,
  UserX,
  FileText,
  Award,
  TrendingUp,
  ExternalLink,
  Download
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30",
  "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function StudentsClient({ students, facilities }: { students: any[], facilities: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedFacilityId, selectedFacility, setSelectedFacilityId, facilities: ctxFacilities, getFacilityName } = useFacility();
  const availableFacilities = ctxFacilities.length > 0 ? ctxFacilities : facilities;
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [reportingStudent, setReportingStudent] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const matchFacility = (s: any) => {
    if (selectedFacilityId === "all") return true;
    if (s.facilityId && s.facilityId === selectedFacilityId) return true;
    if (s.facility?.id && s.facility.id === selectedFacilityId) return true;
    if (selectedFacility && s.facility?.name === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (s.facility?.name?.includes("Cầu Giấy") || s.facilityId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (s.facility?.name?.includes("Bình Thạnh") || s.facilityId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (s.facility?.name?.includes("Hải Châu") || s.facilityId?.includes("hai-chau"))) return true;
    return false;
  };

  const filteredStudents = students.filter(s => {
    const matchSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.parent?.phone && s.parent.phone.includes(searchTerm));

    const matchStatus = selectedStatus === "all" || s.status === selectedStatus;

    return matchSearch && matchFacility(s) && matchStatus;
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems: paginatedStudents,
    totalItems: totalFilteredStudents,
  } = usePagination(filteredStudents, 20);

  const {
    highlightedId,
    highlightedItem,
    isHighlighted,
    clearHighlight,
  } = useTableHighlight({
    items: students,
    filteredItems: filteredStudents,
    getId: (s) => s.id,
    getSecondaryId: (s) => s.code,
    getFacilityId: (s) => s.facilityId || s.facility?.id,
    getStatus: (s) => s.status,
    pageSize,
    setCurrentPage,
    selectedFacilityId,
    setSelectedFacilityId,
    selectedStatus,
    setSelectedStatus,
    searchTerm,
    setSearchTerm,
  });

  const studentsInFacility = students.filter(matchFacility);

  const totalFacilityStudents = studentsInFacility.length;
  const activeCount = studentsInFacility.filter(s => s.status === 'ACTIVE').length;
  const inactiveCount = studentsInFacility.filter(s => s.status === 'INACTIVE').length;

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
    <div className="flex flex-col gap-7">
      {/* Top Stat Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="clay-card p-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-extrabold uppercase tracking-wider font-heading">Tổng học viên</span>
            <div className="text-3xl font-black font-heading text-foreground">{totalFacilityStudents}</div>
          </div>
          <div className="clay-icon-tile h-14 w-14 bg-[#E6F8FB] text-[#0284C7] shadow-sm">
            <Users className="h-7 w-7" />
          </div>
        </div>

        <div className="clay-card p-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-extrabold uppercase tracking-wider font-heading">Đang theo học</span>
            <div className="text-3xl font-black font-heading text-emerald-600 dark:text-emerald-400">{activeCount}</div>
          </div>
          <div className="clay-icon-tile h-14 w-14 bg-[#F0FDF4] text-[#16A34A] shadow-sm">
            <UserCheck className="h-7 w-7" />
          </div>
        </div>

        <div className="clay-card p-6 flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-extrabold uppercase tracking-wider font-heading">Tạm nghỉ / Bảo lưu</span>
            <div className="text-3xl font-black font-heading text-rose-600 dark:text-rose-400">{inactiveCount}</div>
          </div>
          <div className="clay-icon-tile h-14 w-14 bg-[#FFF1F2] text-[#E11D48] shadow-sm">
            <UserX className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Action and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Tìm theo tên, mã HV, SĐT phụ huynh..." 
              className="w-full pl-11 h-11 text-xs font-semibold rounded-2xl bg-card border-2" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <Select value={selectedFacilityId} onValueChange={(val) => setSelectedFacilityId(val || "all")}>
            <SelectTrigger className="w-[170px] h-11 text-xs">
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

          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "all")}>
            <SelectTrigger className="w-[170px] h-11 text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {STUDENT_STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            <Plus className="h-4.5 w-4.5" /> Thêm học viên
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <Users className="h-5 w-5 text-primary" /> Thêm học viên mới
            </DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="grid gap-4 py-3">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="grid gap-1.5">
                <Label htmlFor="code" className="text-xs font-bold font-heading">Mã học viên *</Label>
                <Input id="code" name="code" placeholder="VD: HV0099" required className="h-10 text-xs font-mono" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="name" className="text-xs font-bold font-heading">Họ và tên *</Label>
                <Input id="name" name="name" placeholder="Nguyễn Văn An" required className="h-10 text-xs font-semibold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="grid gap-1.5">
                <Label htmlFor="phone" className="text-xs font-bold font-heading">SĐT Học viên</Label>
                <Input id="phone" name="phone" placeholder="0988..." className="h-10 text-xs" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="facilityId" className="text-xs font-bold font-heading">Cơ sở đăng ký *</Label>
                <Select name="facilityId" required>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue placeholder="Chọn cơ sở" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map(f => (
                      <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border-2 border-border/70 space-y-3">
              <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider font-heading">Thông tin phụ huynh</span>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="grid gap-1.5">
                  <Label htmlFor="parentName" className="text-xs font-medium">Tên phụ huynh</Label>
                  <Input id="parentName" name="parentName" placeholder="Phụ huynh..." className="h-9 text-xs" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="parentPhone" className="text-xs font-medium">SĐT phụ huynh</Label>
                  <Input id="parentPhone" name="parentPhone" placeholder="0912..." className="h-9 text-xs" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                {isPending ? "Đang lưu..." : "Lưu Học Viên"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <Edit className="h-5 w-5 text-primary" /> Chỉnh sửa hồ sơ học viên
            </DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <form key={editingStudent.id} action={handleUpdate} className="grid gap-4 py-3">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-code" className="text-xs font-bold font-heading">Mã học viên</Label>
                  <Input id="edit-code" name="code" defaultValue={editingStudent.code} required className="h-10 text-xs font-mono font-bold" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-name" className="text-xs font-bold font-heading">Họ và tên</Label>
                  <Input id="edit-name" name="name" defaultValue={editingStudent.name} required className="h-10 text-xs font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-phone" className="text-xs font-bold font-heading">SĐT Học viên</Label>
                  <Input id="edit-phone" name="phone" defaultValue={editingStudent.phone || ""} className="h-10 text-xs" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-facilityId" className="text-xs font-bold font-heading">Cơ sở</Label>
                  <Select name="facilityId" defaultValue={editingStudent.facilityId || editingStudent.facility?.id} required>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue placeholder="Chọn cơ sở" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilities.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="edit-status" className="text-xs font-bold font-heading">Trạng thái học vụ</Label>
                <Select name="status" defaultValue={editingStudent.status || "ACTIVE"}>
                  <SelectTrigger className="h-10 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border-2 border-border/70 space-y-3">
                <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider font-heading">Thông tin phụ huynh</span>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-parentName" className="text-xs font-medium">Tên phụ huynh</Label>
                    <Input id="edit-parentName" name="parentName" defaultValue={editingStudent.parent?.name || ""} className="h-9 text-xs" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="edit-parentPhone" className="text-xs font-medium">SĐT phụ huynh</Label>
                    <Input id="edit-parentPhone" name="parentPhone" defaultValue={editingStudent.parent?.phone || ""} className="h-9 text-xs" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingStudent(null)}>Hủy</Button>
                <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                  {isPending ? "Đang cập nhật..." : "Cập nhật hồ sơ"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Export Dialog */}
      <Dialog open={!!reportingStudent} onOpenChange={(open) => !open && setReportingStudent(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <FileText className="h-5 w-5 text-primary" /> Xuất Báo Cáo Học Tập ({reportingStudent?.name} - {reportingStudent?.code})
            </DialogTitle>
          </DialogHeader>

          {reportingStudent && (
            <div className="py-2 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tạo bản xem trước (Preview Link) hoặc in/lưu bản PDF chính thức cho học viên:
              </p>

              {/* Option 1: Academic Results */}
              <a
                href={`/reports/preview/${reportingStudent.code}?type=academic`}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-card border-2 border-border/80 hover:border-primary/60 hover:bg-muted/40 transition-all flex items-start gap-3.5 group cursor-pointer block"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-foreground font-heading flex items-center justify-between">
                    <span>1. Báo cáo Kết quả Học tập</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Bảng điểm, điểm trung bình, xếp loại học lực, tỷ lệ đạt chuẩn, nhận xét bài kiểm tra & phân tích kỹ năng.
                  </p>
                </div>
              </a>

              {/* Option 2: Progress Overview */}
              <a
                href={`/reports/preview/${reportingStudent.code}?type=overview`}
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-card border-2 border-border/80 hover:border-emerald-500/60 hover:bg-muted/40 transition-all flex items-start gap-3.5 group cursor-pointer block"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="font-extrabold text-xs text-foreground font-heading flex items-center justify-between">
                    <span>2. Báo cáo Tổng quan Quá trình & Tình hình Hiện tại</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Tiến độ khóa học, tỷ lệ chuyên cần, timeline điểm danh, nộp bài tập, đánh giá mức độ an toàn học vụ.
                  </p>
                </div>
              </a>

              <div className="pt-2 flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setReportingStudent(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Search Highlight Alert Banner */}
      {highlightedItem && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FFF0E6] dark:bg-[#352114] border-2 border-[#FCDCC8] dark:border-[#523824] text-xs font-bold text-[#D97736] dark:text-[#FBAA78] shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#D97736] animate-ping shrink-0" />
            <span className="truncate">
              Đang làm nổi bật học viên được chọn từ tìm kiếm nhanh:{" "}
              <span className="font-extrabold underline font-heading text-foreground">{highlightedItem.name}</span>{" "}
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

      {/* Students Data Table */}
      <div className="clay-card overflow-hidden p-0 border-2">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[120px]">Mã HV</TableHead>
              <TableHead>Học Viên</TableHead>
              <TableHead>Phụ Huynh</TableHead>
              <TableHead>Cơ Sở</TableHead>
              <TableHead>Lớp Đang Học</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="w-[110px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                  Không tìm thấy học viên nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((student) => {
                const avatarStyle = getAvatarColor(student.name);
                const initials = student.name.split(" ").map((n: string) => n[0]).slice(-2).join("").toUpperCase();
                const isRowHighlighted = isHighlighted(student);

                return (
                  <TableRow 
                    key={student.id} 
                    id={`row-highlight-${student.id}`}
                    className={cn(
                      "transition-all duration-300",
                      isRowHighlighted
                        ? "bg-[#FFF0E6]/95 dark:bg-[#352114]/95 border-2 border-primary ring-2 ring-primary/60 shadow-md row-highlight-active"
                        : "hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors"
                    )}
                  >
                    <TableCell className="font-mono text-xs font-black text-primary">
                      <div className="flex items-center gap-2">
                        <span>{student.code}</span>
                        {isRowHighlighted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-white shadow-xs animate-pulse">
                            🎯 Đã chọn
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3.5 py-1">
                        <div className={`clay-icon-tile h-11 w-11 border-2 font-black text-xs shrink-0 shadow-2xs ${avatarStyle}`}>
                          {initials}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-sm text-foreground font-heading">{student.name}</div>
                          {student.phone && (
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono font-medium">
                              <Phone className="h-3 w-3 text-muted-foreground" /> {student.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {student.parent ? (
                        <div className="space-y-1 py-1">
                          <div className="font-bold text-xs text-foreground font-heading">{student.parent.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono font-medium">{student.parent.phone}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs font-semibold">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span>{student.facility?.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {student.classes && student.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {student.classes.map((c: any) => (
                            <Badge key={c.id} variant="secondary" className="text-[10px] h-6 px-2.5 font-mono font-bold">
                              {c.code}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium italic">Chưa xếp lớp</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant={student.status === 'ACTIVE' ? 'green' : 'outline'}
                        className="text-xs px-3 py-1"
                      >
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-muted-foreground'}`}></span>
                        {getStudentStatusLabel(student.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50" 
                          onClick={() => setReportingStudent(student)} 
                          title="Xuất báo cáo học tập (Preview Link)"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-primary hover:bg-[#FFF0E6] hover:text-[#D97736]" 
                          onClick={() => setEditingStudent(student)} 
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50" 
                          onClick={() => handleDelete(student.id)} 
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
        totalItems={totalFilteredStudents}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="học viên"
      />
    </div>
  );
}
