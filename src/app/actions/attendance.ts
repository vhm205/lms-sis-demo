"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAttendance(scheduleId: string, attendances: { studentId: string, status: string, notes?: string }[]) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { classId: true }
    });

    if (!schedule) {
      return { error: "Không tìm thấy lịch học" };
    }

    for (const record of attendances) {
      const existing = await prisma.attendance.findFirst({
        where: { scheduleId, studentId: record.studentId }
      });
      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status: record.status, note: record.notes }
        });
      } else {
        await prisma.attendance.create({
          data: {
            scheduleId,
            studentId: record.studentId,
            classId: schedule.classId,
            status: record.status,
            note: record.notes
          }
        });
      }
    }
    revalidatePath("/schedule");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
