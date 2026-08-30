"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, ClipboardCheck, Edit } from "lucide-react";
import { createSchedule, updateSchedule, deleteSchedule } from "../actions/schedule";
import { submitAttendance } from "../actions/attendance";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const [activeScheduleForAttendance, setActiveScheduleForAttendance] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string, notes: string }>>({});

  const filtered = schedules.filter(s => s.class?.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
      const existing = schedule.attendances.find((a: any) => a.studentId === student.id);
      initialData[student.id] = {
        status: existing ? existing.status : "PRESENT",
        notes: existing?.notes || ""
      };
    });
    setAttendanceData(initialData);
    setActiveScheduleForAttendance(schedule);
  }

  async function handleSaveAttendance() {
    if (!activeScheduleForAttendance) return;
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
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Tìm tên lớp..." className="w-full pl-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        
        <Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Xếp lịch học</Button>
        
        {/* Add Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Thêm lịch học</DialogTitle></DialogHeader>
            <form action={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Lớp học</Label>
                <Select name="classId" required>
                  <SelectTrigger><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Phòng học</Label>
                <Select name="roomId" required>
                  <SelectTrigger><SelectValue placeholder="Chọn phòng" /></SelectTrigger>
                  <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><Label>Ngày giờ bắt đầu</Label><Input type="datetime-local" name="date" required /></div>
                <div className="grid gap-2"><Label>Thời lượng (phút)</Label><Input type="number" name="duration" defaultValue="90" required /></div>
              </div>
              <Button type="submit" disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu"}</Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={!!editingSchedule} onOpenChange={(open) => !open && setEditingSchedule(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Chỉnh sửa lịch học</DialogTitle></DialogHeader>
            {editingSchedule && (
              <form action={handleUpdate} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Lớp học</Label>
                  <Select name="classId" defaultValue={editingSchedule.classId} required>
                    <SelectTrigger><SelectValue placeholder="Chọn lớp" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Phòng học</Label>
                  <Select name="roomId" defaultValue={editingSchedule.roomId} required>
                    <SelectTrigger><SelectValue placeholder="Chọn phòng" /></SelectTrigger>
                    <SelectContent>{rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Ngày giờ bắt đầu</Label>
                    <Input type="datetime-local" name="date" defaultValue={toDatetimeLocal(editingSchedule.date)} required />
                  </div>
                  <div className="grid gap-2">
                    <Label>Thời lượng (phút)</Label>
                    <Input type="number" name="duration" defaultValue={editingSchedule.duration} required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select name="status" defaultValue={editingSchedule.status || "SCHEDULED"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">SCHEDULED (Đã lên lịch)</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED (Đã diễn ra)</SelectItem>
                      <SelectItem value="CANCELLED">CANCELLED (Đã hủy)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingSchedule(null)}>Hủy</Button>
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
              <TableHead>Thời Gian</TableHead>
              <TableHead>Lớp Học</TableHead>
              <TableHead>Phòng</TableHead>
              <TableHead>Giáo Viên</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="w-[180px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{new Date(s.date).toLocaleDateString('vi-VN')}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(s.date).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})} - 
                    {new Date(new Date(s.date).getTime() + s.duration * 60000).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                  </div>
                </TableCell>
                <TableCell>{s.class?.name}</TableCell>
                <TableCell>{s.room?.name}</TableCell>
                <TableCell>{s.class?.teacher?.name || "Chưa phân công"}</TableCell>
                <TableCell>
                  <Badge variant={s.status === 'COMPLETED' ? 'default' : s.status === 'UPCOMING' || s.status === 'SCHEDULED' ? 'outline' : 'destructive'}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="outline" size="sm" onClick={() => openAttendanceModal(s)}>
                      <ClipboardCheck className="h-4 w-4 mr-1" /> Điểm danh
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setEditingSchedule(s)} title="Chỉnh sửa">
                      <Edit className="h-4 w-4 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} title="Xóa">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Attendance Modal */}
      <Dialog open={!!activeScheduleForAttendance} onOpenChange={(open) => !open && setActiveScheduleForAttendance(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Điểm danh lớp: {activeScheduleForAttendance?.class?.name}</DialogTitle></DialogHeader>
          <div className="py-4">
            {activeScheduleForAttendance?.class?.students?.length === 0 ? (
              <p>Lớp chưa có học viên.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Học viên</TableHead><TableHead>Trạng thái</TableHead><TableHead>Ghi chú</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {activeScheduleForAttendance?.class?.students?.map((student: any) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name} <br/><span className="text-xs text-muted-foreground">{student.code}</span></TableCell>
                      <TableCell>
                        <Select 
                          value={attendanceData[student.id]?.status || "PRESENT"} 
                          onValueChange={(val) => setAttendanceData({...attendanceData, [student.id]: {...attendanceData[student.id], status: val}})}
                        >
                          <SelectTrigger className="w-[120px] h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PRESENT">Có mặt</SelectItem>
                            <SelectItem value="ABSENT_EXCUSED">Vắng có phép</SelectItem>
                            <SelectItem value="ABSENT_UNEXCUSED">Vắng K.phép</SelectItem>
                            <SelectItem value="LATE">Đi trễ</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          placeholder="Ghi chú..." 
                          className="h-8"
                          value={attendanceData[student.id]?.notes || ""}
                          onChange={(e) => setAttendanceData({...attendanceData, [student.id]: {...attendanceData[student.id], notes: e.target.value}})}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setActiveScheduleForAttendance(null)}>Hủy</Button>
            <Button onClick={handleSaveAttendance} disabled={isPending}>{isPending ? "Đang lưu..." : "Lưu Điểm Danh"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

