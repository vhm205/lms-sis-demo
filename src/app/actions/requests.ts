"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function refreshRequestsAction(): Promise<void> {
  try {
    revalidatePath("/requests");
    revalidatePath("/dashboard");
    revalidatePath("/");
  } catch (error) {
    console.error("Failed to revalidate requests path:", error);
  }
}

// 1. Update status of Support Request (quick action or dropdown)
export async function updateSupportRequestStatus(id: string, status: string, notes?: string) {
  try {
    const updateData: { status: string; notes?: string } = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updated = await prisma.supportRequest.update({
      where: { id },
      data: updateData,
    });

    await prisma.activityLog.create({
      data: {
        action: "UPDATE_SUPPORT_STATUS",
        entityType: "SupportRequest",
        entityId: id,
        details: JSON.stringify({ status, notes }),
        source: "UI",
      },
    });

    revalidatePath("/requests");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update support request status:", error);
    return { error: error.message || "Cập nhật trạng thái thất bại" };
  }
}

// 2. Full update of Support Request
export async function updateSupportRequest(
  id: string,
  data: {
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    notes?: string;
    content?: string;
    type?: string;
  }
) {
  try {
    const updated = await prisma.supportRequest.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.priority ? { priority: data.priority } : {}),
        ...(data.assigneeId !== undefined ? { assigneeId: data.assigneeId || null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.content ? { content: data.content } : {}),
        ...(data.type ? { type: data.type } : {}),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "UPDATE_SUPPORT_REQUEST",
        entityType: "SupportRequest",
        entityId: id,
        details: JSON.stringify(data),
        source: "UI",
      },
    });

    revalidatePath("/requests");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update support request:", error);
    return { error: error.message || "Cập nhật yêu cầu thất bại" };
  }
}

// 3. Create Support Request
export async function createSupportRequest(data: {
  studentId: string;
  type: string;
  content: string;
  priority?: string;
  assigneeId?: string | null;
  notes?: string;
}) {
  try {
    if (!data.studentId || !data.type || !data.content) {
      return { error: "Vui lòng điền đầy đủ học viên, loại yêu cầu và nội dung" };
    }

    const created = await prisma.supportRequest.create({
      data: {
        studentId: data.studentId,
        type: data.type,
        content: data.content,
        priority: data.priority || "NORMAL",
        assigneeId: data.assigneeId || null,
        notes: data.notes || null,
        status: "NEW",
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE_SUPPORT_REQUEST",
        entityType: "SupportRequest",
        entityId: created.id,
        details: JSON.stringify(data),
        source: "UI",
      },
    });

    revalidatePath("/requests");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: created };
  } catch (error: any) {
    console.error("Failed to create support request:", error);
    return { error: error.message || "Tạo yêu cầu hỗ trợ thất bại" };
  }
}

// 4. Delete Support Request
export async function deleteSupportRequest(id: string) {
  try {
    await prisma.supportRequest.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "DELETE_SUPPORT_REQUEST",
        entityType: "SupportRequest",
        entityId: id,
        source: "UI",
      },
    });

    revalidatePath("/requests");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete support request:", error);
    return { error: error.message || "Xóa yêu cầu hỗ trợ thất bại" };
  }
}

// 5. Update Make-up Request status (Approve / Reject / Pending)
export async function updateMakeUpRequestStatus(id: string, status: string, notes?: string) {
  try {
    const req = await prisma.makeUpRequest.findUnique({
      where: { id },
      include: {
        targetSchedule: true,
        missedSchedule: true,
      },
    });

    if (!req) {
      return { error: "Không tìm thấy yêu cầu học bù" };
    }

    // If approved, ensure student has an attendance slot in target schedule
    if (status === "APPROVED" && req.targetScheduleId) {
      const targetSchedule = req.targetSchedule || (await prisma.schedule.findUnique({
        where: { id: req.targetScheduleId },
      }));

      if (targetSchedule) {
        await prisma.attendance.upsert({
          where: {
            scheduleId_studentId: {
              scheduleId: req.targetScheduleId,
              studentId: req.studentId,
            },
          },
          update: {
            note: notes ? `Học bù: ${notes}` : "Học bù (Đã duyệt xếp lớp)",
          },
          create: {
            scheduleId: req.targetScheduleId,
            studentId: req.studentId,
            classId: targetSchedule.classId,
            status: "UNMARKED",
            note: notes ? `Học bù: ${notes}` : "Học bù (Đã duyệt xếp lớp)",
          },
        });
      }
    }

    const updated = await prisma.makeUpRequest.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "UPDATE_MAKEUP_STATUS",
        entityType: "MakeUpRequest",
        entityId: id,
        details: JSON.stringify({ status, notes }),
        source: "UI",
      },
    });

    revalidatePath("/requests");
    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update make-up request status:", error);
    return { error: error.message || "Cập nhật yêu cầu học bù thất bại" };
  }
}

// 6. Full update Make-up Request
export async function updateMakeUpRequest(
  id: string,
  data: {
    status?: string;
    targetScheduleId?: string;
    notes?: string;
  }
) {
  try {
    const existing = await prisma.makeUpRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Không tìm thấy yêu cầu học bù" };
    }

    const targetScheduleId = data.targetScheduleId || existing.targetScheduleId;
    const status = data.status || existing.status;

    if (status === "APPROVED" && targetScheduleId) {
      const targetSchedule = await prisma.schedule.findUnique({
        where: { id: targetScheduleId },
      });

      if (targetSchedule) {
        await prisma.attendance.upsert({
          where: {
            scheduleId_studentId: {
              scheduleId: targetScheduleId,
              studentId: existing.studentId,
            },
          },
          update: {
            note: data.notes ? `Học bù: ${data.notes}` : "Học bù (Đã duyệt xếp lớp)",
          },
          create: {
            scheduleId: targetScheduleId,
            studentId: existing.studentId,
            classId: targetSchedule.classId,
            status: "UNMARKED",
            note: data.notes ? `Học bù: ${data.notes}` : "Học bù (Đã duyệt xếp lớp)",
          },
        });
      }
    }

    const updated = await prisma.makeUpRequest.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.targetScheduleId ? { targetScheduleId: data.targetScheduleId } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "UPDATE_MAKEUP_REQUEST",
        entityType: "MakeUpRequest",
        entityId: id,
        details: JSON.stringify(data),
        source: "UI",
      },
    });

    revalidatePath("/requests");
    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update make-up request:", error);
    return { error: error.message || "Cập nhật yêu cầu học bù thất bại" };
  }
}

// 7. Create Make-up Request
export async function createMakeUpRequest(data: {
  studentId: string;
  missedScheduleId: string;
  targetScheduleId: string;
  notes?: string;
  status?: string;
}) {
  try {
    if (!data.studentId || !data.missedScheduleId || !data.targetScheduleId) {
      return { error: "Vui lòng chọn học viên, ca nghỉ và ca học bù" };
    }

    const status = data.status || "PENDING";

    const created = await prisma.makeUpRequest.create({
      data: {
        studentId: data.studentId,
        missedScheduleId: data.missedScheduleId,
        targetScheduleId: data.targetScheduleId,
        notes: data.notes || "",
        status,
      },
    });

    if (status === "APPROVED") {
      const targetSchedule = await prisma.schedule.findUnique({
        where: { id: data.targetScheduleId },
      });
      if (targetSchedule) {
        await prisma.attendance.upsert({
          where: {
            scheduleId_studentId: {
              scheduleId: data.targetScheduleId,
              studentId: data.studentId,
            },
          },
          update: {
            note: data.notes ? `Học bù: ${data.notes}` : "Học bù (Đã duyệt xếp lớp)",
          },
          create: {
            scheduleId: data.targetScheduleId,
            studentId: data.studentId,
            classId: targetSchedule.classId,
            status: "UNMARKED",
            note: data.notes ? `Học bù: ${data.notes}` : "Học bù (Đã duyệt xếp lớp)",
          },
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        action: "CREATE_MAKEUP_REQUEST",
        entityType: "MakeUpRequest",
        entityId: created.id,
        details: JSON.stringify(data),
        source: "UI",
      },
    });

    revalidatePath("/requests");
    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true, data: created };
  } catch (error: any) {
    console.error("Failed to create make-up request:", error);
    return { error: error.message || "Tạo yêu cầu học bù thất bại" };
  }
}

// 8. Delete Make-up Request
export async function deleteMakeUpRequest(id: string) {
  try {
    await prisma.makeUpRequest.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "DELETE_MAKEUP_REQUEST",
        entityType: "MakeUpRequest",
        entityId: id,
        source: "UI",
      },
    });

    revalidatePath("/requests");
    revalidatePath("/schedule");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete make-up request:", error);
    return { error: error.message || "Xóa yêu cầu học bù thất bại" };
  }
}
