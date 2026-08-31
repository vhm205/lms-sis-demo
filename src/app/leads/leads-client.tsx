"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createLead, updateLead, updateLeadStatus, deleteLead } from "../actions/lead";
import { useFacility } from "@/components/facility-provider";
import { RefreshButton } from "@/components/refresh-button";
import { DataPagination } from "@/components/ui/data-pagination";
import { usePagination } from "@/hooks/use-pagination";
import { LEAD_STATUS_OPTIONS, getLeadStatusLabel } from "@/lib/constants";
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  UserPlus, 
  Phone, 
  Building2, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  PhoneCall, 
  Clock 
} from "lucide-react";

export function LeadsClient({ leads, courses, facilities }: { leads: any[], courses: any[], facilities: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { selectedFacilityId, selectedFacility, setSelectedFacilityId, facilities: ctxFacilities, getFacilityName } = useFacility();
  const availableFacilities = ctxFacilities.length > 0 ? ctxFacilities : facilities;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  const matchFacility = (l: any) => {
    if (selectedFacilityId === "all") return true;
    if (l.facilityId && l.facilityId === selectedFacilityId) return true;
    if (l.facility?.id && l.facility.id === selectedFacilityId) return true;
    if (selectedFacility && l.facility?.name === selectedFacility.name) return true;
    if (selectedFacilityId.includes("cau-giay") && (l.facility?.name?.includes("Cầu Giấy") || l.facilityId?.includes("cau-giay"))) return true;
    if (selectedFacilityId.includes("binh-thanh") && (l.facility?.name?.includes("Bình Thạnh") || l.facilityId?.includes("binh-thanh"))) return true;
    if (selectedFacilityId.includes("hai-chau") && (l.facility?.name?.includes("Hải Châu") || l.facilityId?.includes("hai-chau"))) return true;
    return false;
  };

  const filtered = leads.filter(l => {
    const matchSearch = 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.phone.includes(searchTerm);
    const matchStatus = selectedStatus === "all" || l.status === selectedStatus;
    return matchSearch && matchStatus && matchFacility(l);
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedItems: paginatedLeads,
    totalItems: totalFilteredLeads,
  } = usePagination(filtered, 20);

  const leadsInFacility = leads.filter(matchFacility);

  const newCount = leadsInFacility.filter(l => l.status === "NEW").length;
  const consultingCount = leadsInFacility.filter(l => l.status === "CONSULTING" || l.status === "CONTACTED").length;
  const enrolledCount = leadsInFacility.filter(l => l.status === "ENROLLED").length;

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
    if (confirm("Bạn có chắc muốn xóa khách hàng tiềm năng này?")) {
      const res = await deleteLead(id);
      if (res.error) alert(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* CRM Pipeline Stats Toolbar */}
      <div className="grid gap-3.5 sm:grid-cols-3">
        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-bold font-heading">Khách hàng mới tiếp nhận</span>
            <div className="text-2xl font-black font-heading text-sky-600 dark:text-sky-400">{newCount}</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#E6F8FB] text-[#0284C7] shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-bold font-heading">Đang tư vấn / Chăm sóc</span>
            <div className="text-2xl font-black font-heading text-[#D97736]">{consultingCount}</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#FFF0E6] text-[#D97736] shadow-sm">
            <PhoneCall className="h-6 w-6" />
          </div>
        </div>

        <div className="clay-card p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-bold font-heading">Đã chốt đăng ký thành công</span>
            <div className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400">{enrolledCount}</div>
          </div>
          <div className="clay-icon-tile h-12 w-12 bg-[#F0FDF4] text-[#16A34A] shadow-sm">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Tìm theo họ tên, SĐT phụ huynh..." 
              className="w-full pl-10 h-10 text-xs font-semibold rounded-2xl bg-card border-2" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || "all")}>
            <SelectTrigger className="w-[160px] h-10 text-xs">
              <SelectValue placeholder="Trạng thái CRM" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả giai đoạn</SelectItem>
              {LEAD_STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
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
            <Plus className="h-4 w-4" /> Thêm khách tiềm năng
          </Button>
        </div>
      </div>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <UserPlus className="h-5 w-5 text-primary" /> Thêm khách hàng tiềm năng
            </DialogTitle>
          </DialogHeader>
          <form action={handleAdd} className="grid gap-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Họ và tên *</Label>
                <Input name="name" placeholder="Họ tên phụ huynh / HV" required className="h-10 text-xs font-semibold" />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Số điện thoại *</Label>
                <Input name="phone" placeholder="0912..." required className="h-10 text-xs font-mono font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Khóa học quan tâm</Label>
                <Select name="courseId">
                  <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Tùy chọn" /></SelectTrigger>
                  <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Cơ sở muốn học</Label>
                <Select name="facilityId">
                  <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Tùy chọn" /></SelectTrigger>
                  <SelectContent>{facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs font-bold font-heading">Ghi chú nhu cầu & mong muốn</Label>
              <Input name="notes" placeholder="VD: Muốn học ca tối, mục tiêu IELTS 6.5..." className="h-10 text-xs font-medium" />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Hủy</Button>
              <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                {isPending ? "Đang lưu..." : "Lưu Khách Hàng"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold flex items-center gap-2 font-heading">
              <Edit className="h-5 w-5 text-primary" /> Chỉnh sửa thông tin khách hàng
            </DialogTitle>
          </DialogHeader>
          {editingLead && (
            <form action={handleUpdate} className="grid gap-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Họ và tên</Label>
                  <Input name="name" defaultValue={editingLead.name} required className="h-10 text-xs font-semibold" />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Số điện thoại</Label>
                  <Input name="phone" defaultValue={editingLead.phone} required className="h-10 text-xs font-mono font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Khóa học quan tâm</Label>
                  <Select name="courseId" defaultValue={editingLead.courseId || "none"}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Tùy chọn" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn</SelectItem>
                      {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-bold font-heading">Cơ sở muốn học</Label>
                  <Select name="facilityId" defaultValue={editingLead.facilityId || "none"}>
                    <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Tùy chọn" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Không chọn</SelectItem>
                      {facilities.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Trạng thái CRM</Label>
                <Select name="status" defaultValue={editingLead.status || "NEW"}>
                  <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs font-bold font-heading">Ghi chú</Label>
                <Input name="notes" defaultValue={editingLead.notes || ""} className="h-10 text-xs font-medium" />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingLead(null)}>Hủy</Button>
                <Button type="submit" size="sm" disabled={isPending} className="clay-btn-primary">
                  {isPending ? "Đang cập nhật..." : "Cập nhật"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Leads Table */}
      <div className="clay-card overflow-hidden p-0 border-2">
        <Table>
          <TableHeader className="bg-muted/50 border-b-2 border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead>Khách Hàng</TableHead>
              <TableHead>Số Điện Thoại</TableHead>
              <TableHead>Khóa Học Quan Tâm</TableHead>
              <TableHead>Nguồn</TableHead>
              <TableHead>Ghi Chú Nhu Cầu</TableHead>
              <TableHead className="w-[190px]">Giai Đoạn CRM</TableHead>
              <TableHead className="w-[110px] text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center text-xs text-muted-foreground font-semibold">
                  Không tìm thấy khách hàng tiềm năng nào phù hợp.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-[#FAF6F0]/80 dark:hover:bg-[#28221D]/80 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3 py-1">
                      <div className="clay-icon-tile h-10 w-10 bg-[#FFF0E6] text-[#D97736] font-bold text-xs shrink-0 shadow-2xs">
                        {lead.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground font-heading">{lead.name}</div>
                        {lead.age && <div className="text-[11px] text-muted-foreground font-medium">{lead.age} tuổi</div>}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="font-mono text-xs font-bold text-primary flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {lead.phone}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-foreground font-heading">{lead.course?.name || "Chưa chọn"}</div>
                      {lead.course?.type && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold font-mono">
                          {lead.course.type}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-bold">
                      {lead.source || "Website"}
                    </Badge>
                  </TableCell>

                  <TableCell className="max-w-[200px]">
                    <span className="text-xs text-muted-foreground font-medium truncate block leading-relaxed" title={lead.notes}>
                      {lead.notes || "-"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <Select defaultValue={lead.status} onValueChange={(val) => handleStatusChange(lead.id, val)}>
                      <SelectTrigger className="w-[170px] h-10 text-xs font-bold rounded-xl border-2">
                        <SelectValue placeholder={getLeadStatusLabel(lead.status)} />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl text-primary hover:bg-[#FFF0E6] hover:text-[#D97736]" 
                        onClick={() => setEditingLead(lead)} 
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50" 
                        onClick={() => handleDelete(lead.id)} 
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
        totalItems={totalFilteredLeads}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="khách tiềm năng"
      />
    </div>
  );
}
