"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Trash2, 
  ClipboardCheck, 
  Edit, 
  CalendarDays, 
  Clock, 
  Building2, 
  User, 
  CheckCircle2,
  AlertTriangle,
  Users
} from "lucide-react";
import { createSchedule, updateSchedule, deleteSchedule } from "../actions/schedule";
import { submitAttendance } from "../actions/attendance";

import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { 
  SCHEDULE_STATUS_OPTIONS, 
  getScheduleStatusLabel, 
  SCHEDULE_STATUS_MAP, 
  ATTENDANCE_STATUS_OPTIONS, 
  getAttendanceStatusLabel 
} from "@/lib/constants";

function toDatetimeLocal(date: string | Date) {
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function ScheduleClient({ schedules, classes, rooms, teachers }: { schedules: any[], classes: any[], rooms: any[], teachers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { selectedFacilityId, selectedFacility } = useFacility();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const [activeScheduleForAttendance, setActiveScheduleForAttendance] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string, notes: string }>>({});

  const matchFacility = (s: any) => {
    if (selectedFacilityId === "all") return true;
    const cFacId = s.class?.facilityId;
    const rFacId = s.room?.facilityId;
    const cFacName = s.class?.facility?.name;
    const rFacName = s.room?.facility?.name;

    if (cFacId === selectedFacilityId || rFacId === selectedFacilityId) return true;
    if (selectedFacility && (cFacName === selectedFacility.name || rFacName === selectedFacility.name)) return true;
    if (selectedFacilityId.includes("cau-giay") && (cFacName?.includes("Cầu Giấy") || rFacName?.includes("Cầu Giấy") || cFacId?.includes("cau-giay") || rFacId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (cFacName?.includes("Bình Thạnh") || rFacName?.includes("Bình Thạnh") || cFacId?.includes("binh-thanh") || rFacId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (cFacName?.includes("Hải Châu") || rFacName?.includes("Hải Châu") || cFacId?.includes("hai-chau") || rFacId?.includes("hai-chau"))) return true;
    return false;
  };

  const filtered = schedules.filter(s => {
    const matchSearch = 
      s.class?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.room?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.class?.teacher?.name && s.class.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch && matchFacility(s);
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems: paginatedSchedules,
    totalItems: totalFilteredSchedules,
  } = usePagination(filtered, 15);

  async function handleAdd(formData: FormData) {
    setIsPending(true);
    const res = await createSchedule(formData);
    setIsPending(false);
    if (res.success) setIsAddModalOpen(false);
    else alert(res.error);
  }

  async function handleUpdate(formData: FormData) {
    if (!editingSchedule) return;
    setIsPending(true);
    const res = await updateSchedule(editingSchedule.id, formData);
    setIsPending(false);
    if (res.success) setEditingSchedule(null);
    else alert(res.error);
  }

  async function handleDelete(id: string) {
    if (confirm("Xóa lịch học này?")) {
      const res = await deleteSchedule(id);
      if (res.error) alert(res.error);
    }
  }

  function openAttendanceModal(schedule: any) {
    const initialData: Record<string, { status: string, notes: string }> = {};
    schedule.class.students.forEach((student: any) => {
      const existing = schedule.attendances?.find((a: any) => a.studentId === student.id);
      let initialStatus = "UNMARKED";
      if (existing && existing.status) {
        if (existing.status === "ABSENT_EXCUSED") initialStatus = "EXCUSED";
        else if (existing.status === "ABSENT_UNEXCUSED") initialStatus = "ABSENT";
        else initialStatus = existing.status;
      }
      initialData[student.id] = {
        status: initialStatus,
        notes: existing?.note || existing?.notes || ""
      };
    });
    setAttendanceData(initialData);
    setActiveScheduleForAttendance(schedule);
  }

  function markAllPresent() {
    if (!activeScheduleForAttendance) return;
    const updated = { ...attendanceData };
    activeScheduleForAttendance.class.students.forEach((student: any) => {
      updated[student.id] = {
        status: "PRESENT",
        notes: updated[student.id]?.notes || ""
      };
    });
    setAttendanceData(updated);
  }

  function markAllUnmarked() {
    if (!activeScheduleForAttendance) return;
    const updated = { ...attendanceData };
    activeScheduleForAttendance.class.students.forEach((student: any) => {
      updated[student.id] = {
        status: "UNMARKED",
        notes: updated[student.id]?.notes || ""
      };
    });
    setAttendanceData(updated);
  }

  async function handleSaveAttendance() {
    if (!activeScheduleForAttendance) return;

    const allUnmarked = Object.values(attendanceData).every(
      (item) => !item.status || item.status === "UNMARKED"
    );

    if (allUnmarked) {
      if (!confirm("Tất cả học viên đều đang ở trạng thái 'Chưa điểm danh'. Bạn có muốn xóa toàn bộ bản ghi điểm danh đã có (đặt lại trạng thái chưa điểm danh) cho ca học này không?")) {
        return;
      }
    }

    setIsPending(true);
    const formattedData = Object.keys(attendanceData).map(studentId => ({
      studentId,
      status: attendanceData[studentId].status,
      notes: attendanceData[studentId].notes
    }));
    
    const res = await submitAttendance(activeScheduleForAttendance.id, formattedData);
    setIsPending(false);
    
    if (res.success) {
      setActiveScheduleForAttendance(null);
    } else {
      alert(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Tìm theo tên lớp, phòng, giáo viên..." 
            className="w-full pl-10 h-10 text-xs font-semibold rounded-2xl bg-card border-2" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
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
            <Plus className="h-4 w-4" /> Xếp lịch học mới
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <CalendarDays className="h-5 w-5 text-primary" /> Xếp lịch học mới
            </DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="grid gap-4 py-3">
            <div className="grid gap-1.5">
              <Label className="text-xs font-bold font-heading">Lớp học *</Label>
              <Select name="classId" required>
                <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn lớp học" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-bold font-heading">Phòng học *</Label>
              <Select name="roomId" required>
                <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn phòng học" /></SelectTrigger>
                <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name} (Sức chứa: {r.capacity})</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Ngày giờ bắt đầu *</Label>
                <Input type="datetime-local" name="date" required className="h-10 text-xs font-semibold" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Thời lượng (phút) *</Label>
                <Input type="number" name="duration" defaultValue="90" required className="h-10 text-xs font-semibold" />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                {isPending ? "Đang lưu..." : "Lưu Lịch Học"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingSchedule} onOpenChange={(open) => !open && setEditingSchedule(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <Edit className="h-5 w-5 text-primary" /> Chỉnh sửa lịch học
            </DialogTitle>
          </DialogHeader>
          {editingSchedule && (
            <form key={editingSchedule.id} action={handleUpdate} className="grid gap-4 py-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Lớp học</Label>
                <Select name="classId" defaultValue={editingSchedule.classId} required>
                  <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Phòng học</Label>
                <Select name="roomId" defaultValue={editingSchedule.roomId} required>
                  <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Chọn phòng" /></SelectTrigger>
                  <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Ngày giờ bắt đầu</Label>
                  <Input type="datetime-local" name="date" defaultValue={toDatetimeLocal(editingSchedule.date)} required className="h-10 text-xs font-semibold" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Thời lượng (phút)</Label>
                  <Input type="number" name="duration" defaultValue={editingSchedule.duration} required className="h-10 text-xs font-semibold" />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Trạng thái ca học</Label>
                <Select name="status" defaultValue={editingSchedule.status || "SCHEDULED"}>
                  <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCHEDULE_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingSchedule(null)}>Hủy</Button>
                <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                  {isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Table */}
      <div className="clay-card overflow-hidden p-0 border-2">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead>Lớp Học</TableHead>
              <TableHead className="w-[220px]">Thời Gian Ca Học</TableHead>
              <TableHead>Phòng Học</TableHead>
              <TableHead>Giáo Viên</TableHead>
              <TableHead>Tình Trạng Điểm Danh</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="w-[210px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSchedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                  Không tìm thấy lịch học nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSchedules.map((s) => {
                const dateObj = new Date(s.date);
                const dayStr = dateObj.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
                const timeStr = dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
                const studentCount = s.class?.students?.length || 0;
                const validAttendances = s.attendances?.filter((a: any) => a.status && a.status !== 'UNMARKED') || [];
                const isMarked = validAttendances.length > 0;
                const presentCount = validAttendances.filter((a: any) => a.status === 'PRESENT').length;

                return (
                  <TableRow key={s.id} className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors">
                    <TableCell>
                      <div className="space-y-1 py-1">
                        <div className="font-bold text-sm text-foreground font-heading">{s.class?.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono font-bold">Mã lớp: {s.class?.code}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-foreground font-heading flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-primary" /> {dayStr}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {timeStr} ({s.duration}p)
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span>{s.room?.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <div className="clay-icon-tile h-7 w-7 bg-muted text-foreground shrink-0 font-bold text-[11px]">
                          {s.class?.teacher ? s.class.teacher.name.charAt(0) : "?"}
                        </div>
                        <div>
                          <div className="font-bold text-foreground font-heading">{s.class?.teacher?.name || "Chưa phân công"}</div>
                          {s.class?.teacher?.email && <div className="text-[10px] text-muted-foreground font-normal">{s.class.teacher.email}</div>}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {isMarked ? (
                        <Badge 
                          variant={presentCount === studentCount ? "green" : presentCount > 0 ? "amber" : "pink"} 
                          className="text-xs px-3 py-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Có mặt: {presentCount}/{studentCount}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs px-3 py-1">
                          Chưa điểm danh ({studentCount} HV)
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge 
                        variant={SCHEDULE_STATUS_MAP[s.status]?.badgeVariant || 'aqua'}
                        className="text-xs px-3 py-1"
                      >
                        {getScheduleStatusLabel(s.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openAttendanceModal(s)}
                          className="clay-btn-outline h-9 text-xs font-bold gap-1.5 px-3.5"
                        >
                          <ClipboardCheck className="h-4 w-4 text-primary" /> Điểm danh
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-primary hover:bg-[#FFF0E6] hover:text-[#D97736]" 
                          onClick={() => setEditingSchedule(s)} 
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50" 
                          onClick={() => handleDelete(s.id)} 
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
        totalItems={totalFilteredSchedules}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="lịch học"
      />

      {/* Attendance Modal */}
      <Dialog open={!!activeScheduleForAttendance} onOpenChange={(open) => !open && setActiveScheduleForAttendance(null)}>
        <DialogContent className="max-w-2xl sm:max-w-[650px]">
          <DialogHeader className="border-b-2 border-border/70 pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
                  <ClipboardCheck className="h-5 w-5 text-primary" /> Điểm danh: {activeScheduleForAttendance?.class?.name}
                </DialogTitle>
                {activeScheduleForAttendance && (
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap font-medium">
                    <span>📅 {new Date(activeScheduleForAttendance.date).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })}</span>
                    <span>•</span>
                    <span>⏰ {new Date(activeScheduleForAttendance.date).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ({activeScheduleForAttendance.duration}p)</span>
                    {activeScheduleForAttendance.room?.name && (
                      <>
                        <span>•</span>
                        <span>Phòng {activeScheduleForAttendance.room.name}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-9 px-2.5 text-muted-foreground hover:text-foreground rounded-xl font-semibold border-2"
                  onClick={markAllUnmarked}
                  title="Đặt lại toàn bộ về Chưa điểm danh"
                >
                  Đặt lại
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-9 px-3 text-primary border-2 border-primary/30 hover:bg-[#FFF0E6] rounded-xl font-bold"
                  onClick={markAllPresent}
                >
                  ✓ Tất cả có mặt
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3 max-h-[60vh] overflow-y-auto">
            {activeScheduleForAttendance && new Date(activeScheduleForAttendance.date) > new Date() && (
              <div className="mb-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5 font-medium">
                <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Lịch học trong tương lai:</strong> Buổi học này chưa diễn ra. Trạng thái học viên mặc định là <strong>Chưa điểm danh</strong>.
                </span>
              </div>
            )}

            {activeScheduleForAttendance?.class?.students?.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6 font-semibold">Lớp học hiện tại chưa có học viên nào.</p>
            ) : (
              <Table>
                <TableHeader className="bg-muted/50 border-b-2 border-border/70">
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Học Viên</TableHead>
                    <TableHead className="w-[190px]">Trạng Thái</TableHead>
                    <TableHead>Ghi Chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeScheduleForAttendance?.class?.students?.map((student: any) => (
                    <TableRow key={student.id} className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80">
                      <TableCell className="font-medium text-xs">
                        <div className="font-bold text-sm text-foreground font-heading">{student.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono font-semibold">{student.code}</div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={attendanceData[student.id]?.status || "UNMARKED"} 
                          onValueChange={(val) => setAttendanceData({
                            ...attendanceData, 
                            [student.id]: { ...(attendanceData[student.id] || {}), status: val, notes: attendanceData[student.id]?.notes || "" }
                          })}
                        >
                          <SelectTrigger className="w-[160px] h-10 text-xs font-bold rounded-xl border-2">
                            <SelectValue placeholder={getAttendanceStatusLabel(attendanceData[student.id]?.status)} />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_STATUS_OPTIONS.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="Ghi chú (VD: Làm bài tập tốt, đến trễ 15p)..." 
                          className="h-10 text-xs font-medium rounded-xl"
                          value={attendanceData[student.id]?.notes || ""}
                          onChange={(e) => setAttendanceData({
                            ...attendanceData, 
                            [student.id]: { ...(attendanceData[student.id] || {}), status: attendanceData[student.id]?.status || "UNMARKED", notes: e.target.value }
                          })}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-border/70">
            <Button variant="outline" size="sm" onClick={() => setActiveScheduleForAttendance(null)}>Hủy</Button>
            <Button size="sm" onClick={handleSaveAttendance} disabled={isPending} className="clay-btn-primary h-10 px-5">
              {isPending ? "Đang lưu..." : "Lưu Kết Quả Điểm Danh"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
