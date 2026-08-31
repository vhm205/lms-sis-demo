export const LEAD_STATUS_MAP: Record<string, { label: string; color: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  NEW: { label: "Mới tiếp nhận", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", badgeVariant: "aqua" },
  CONTACTED: { label: "Đã liên hệ", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", badgeVariant: "secondary" },
  CONSULTING: { label: "Đang tư vấn", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", badgeVariant: "amber" },
  TRIAL_BOOKED: { label: "Đã đặt lịch thử", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", badgeVariant: "orange" },
  TRIAL_DONE: { label: "Đã học thử", color: "bg-teal-500/10 text-teal-600 border-teal-500/20", badgeVariant: "aqua" },
  ENROLLED: { label: "Đã đăng ký (Chốt)", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", badgeVariant: "green" },
  UNSUITABLE: { label: "Chưa phù hợp", color: "bg-muted text-muted-foreground border-border", badgeVariant: "outline" },
  UNREACHABLE: { label: "Không liên lạc được", color: "bg-rose-500/10 text-rose-600 border-rose-500/20", badgeVariant: "pink" },
};

export const LEAD_STATUS_OPTIONS = [
  { value: "NEW", label: "Mới tiếp nhận", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "CONTACTED", label: "Đã liên hệ", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "CONSULTING", label: "Đang tư vấn", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "TRIAL_BOOKED", label: "Đã đặt lịch thử", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  { value: "TRIAL_DONE", label: "Đã học thử", color: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  { value: "ENROLLED", label: "Đã đăng ký (Chốt)", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: "UNSUITABLE", label: "Chưa phù hợp", color: "bg-muted text-muted-foreground border-border" },
  { value: "UNREACHABLE", label: "Không liên lạc được", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
];

export function getLeadStatusLabel(status?: string): string {
  if (!status) return "Chưa xác định";
  return LEAD_STATUS_MAP[status]?.label || status;
}

export const ORDER_STATUS_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  PENDING: { label: "Chưa thanh toán", badgeVariant: "amber" },
  PAID: { label: "Đã thanh toán", badgeVariant: "green" },
  CANCELLED: { label: "Đã hủy", badgeVariant: "outline" },
};

export const ORDER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chưa thanh toán" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export function getOrderStatusLabel(status?: string): string {
  if (!status) return "Chưa xác định";
  return ORDER_STATUS_MAP[status]?.label || status;
}

export const STUDENT_STATUS_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  ACTIVE: { label: "Đang học", badgeVariant: "green" },
  INACTIVE: { label: "Tạm nghỉ / Bảo lưu", badgeVariant: "outline" },
};

export const STUDENT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Đang theo học" },
  { value: "INACTIVE", label: "Tạm nghỉ / Bảo lưu" },
];

export function getStudentStatusLabel(status?: string): string {
  if (!status) return "Chưa xác định";
  return STUDENT_STATUS_MAP[status]?.label || status;
}

export const CLASS_STATUS_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  ONGOING: { label: "Đang diễn ra", badgeVariant: "green" },
  UPCOMING: { label: "Sắp mở", badgeVariant: "aqua" },
  COMPLETED: { label: "Đã kết thúc", badgeVariant: "outline" },
  PAUSED: { label: "Tạm dừng", badgeVariant: "amber" },
};

export const CLASS_STATUS_OPTIONS = [
  { value: "ONGOING", label: "Đang diễn ra" },
  { value: "UPCOMING", label: "Sắp mở" },
  { value: "COMPLETED", label: "Đã kết thúc" },
  { value: "PAUSED", label: "Tạm dừng" },
];

export function getClassStatusLabel(status?: string): string {
  if (!status) return "Chưa xác định";
  return CLASS_STATUS_MAP[status]?.label || status;
}

export const SCHEDULE_STATUS_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  SCHEDULED: { label: "Đã lên lịch", badgeVariant: "aqua" },
  COMPLETED: { label: "Đã diễn ra", badgeVariant: "outline" },
  CANCELLED: { label: "Đã hủy", badgeVariant: "pink" },
};

export const SCHEDULE_STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Đã lên lịch" },
  { value: "COMPLETED", label: "Đã diễn ra" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export function getScheduleStatusLabel(status?: string): string {
  if (!status) return "Chưa xác định";
  return SCHEDULE_STATUS_MAP[status]?.label || status;
}

export const ATTENDANCE_STATUS_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  PRESENT: { label: "Có mặt", badgeVariant: "green" },
  EXCUSED: { label: "Vắng có phép", badgeVariant: "amber" },
  ABSENT_EXCUSED: { label: "Vắng có phép", badgeVariant: "amber" },
  ABSENT: { label: "Vắng mặt", badgeVariant: "pink" },
  ABSENT_UNEXCUSED: { label: "Vắng không phép", badgeVariant: "pink" },
  LATE: { label: "Đi muộn", badgeVariant: "orange" },
};

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: "PRESENT", label: "🟢 Có mặt" },
  { value: "ABSENT_EXCUSED", label: "🟡 Vắng có phép" },
  { value: "ABSENT_UNEXCUSED", label: "🔴 Vắng không phép" },
  { value: "LATE", label: "⏰ Đi muộn" },
];

export function getAttendanceStatusLabel(status?: string): string {
  if (!status) return "Chưa điểm danh";
  return ATTENDANCE_STATUS_MAP[status]?.label || status;
}

export const SUPPORT_TYPE_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  LEAVE: { label: "Xin nghỉ phép", badgeVariant: "amber" },
  INFO: { label: "Hỏi thông tin", badgeVariant: "aqua" },
  SUPPORT: { label: "Hỗ trợ học vụ", badgeVariant: "secondary" },
  COMPLAINT: { label: "Khiếu nại / Góp ý", badgeVariant: "pink" },
  CALL_BACK: { label: "Yêu cầu gọi lại", badgeVariant: "orange" },
};

export const SUPPORT_TYPE_OPTIONS = [
  { value: "LEAVE", label: "Xin nghỉ phép" },
  { value: "INFO", label: "Hỏi thông tin" },
  { value: "SUPPORT", label: "Hỗ trợ học vụ" },
  { value: "COMPLAINT", label: "Khiếu nại / Góp ý" },
  { value: "CALL_BACK", label: "Yêu cầu gọi lại" },
];

export function getSupportTypeLabel(type?: string): string {
  if (!type) return "Hỗ trợ chung";
  return SUPPORT_TYPE_MAP[type]?.label || type;
}

export const SUPPORT_STATUS_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  NEW: { label: "Mới tiếp nhận", badgeVariant: "pink" },
  IN_PROGRESS: { label: "Đang xử lý", badgeVariant: "amber" },
  PENDING: { label: "Chờ phản hồi", badgeVariant: "aqua" },
  RESOLVED: { label: "Đã giải quyết", badgeVariant: "green" },
  REJECTED: { label: "Từ chối", badgeVariant: "outline" },
  CLOSED: { label: "Đã đóng", badgeVariant: "outline" },
};

export const SUPPORT_STATUS_OPTIONS = [
  { value: "NEW", label: "Mới tiếp nhận" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "PENDING", label: "Chờ phản hồi" },
  { value: "RESOLVED", label: "Đã giải quyết" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CLOSED", label: "Đã đóng" },
];

export function getSupportStatusLabel(status?: string): string {
  if (!status) return "Chưa xác định";
  return SUPPORT_STATUS_MAP[status]?.label || status;
}

export const REQUEST_STATUS_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  PENDING: { label: "Chờ duyệt", badgeVariant: "amber" },
  APPROVED: { label: "Đã duyệt", badgeVariant: "green" },
  REJECTED: { label: "Từ chối", badgeVariant: "outline" },
};

export const REQUEST_STATUS_OPTIONS = [
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
];

export function getRequestStatusLabel(status?: string): string {
  if (!status) return "Chưa xác định";
  return REQUEST_STATUS_MAP[status]?.label || status;
}

export const ASSIGNMENT_STATUS_MAP: Record<string, { label: string; badgeVariant: "default" | "secondary" | "outline" | "green" | "aqua" | "pink" | "amber" | "orange" }> = {
  COMPLETED: { label: "Đã nộp bài", badgeVariant: "green" },
  PENDING: { label: "Chờ làm bài", badgeVariant: "pink" },
  LATE: { label: "Nộp muộn", badgeVariant: "amber" },
};

export const ASSIGNMENT_STATUS_OPTIONS = [
  { value: "COMPLETED", label: "Đã nộp bài" },
  { value: "PENDING", label: "Chờ làm bài" },
  { value: "LATE", label: "Nộp muộn" },
];

export function getAssignmentStatusLabel(status?: string): string {
  if (!status) return "Chưa nộp";
  return ASSIGNMENT_STATUS_MAP[status]?.label || status;
}
