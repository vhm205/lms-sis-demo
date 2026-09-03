"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitAttendance(scheduleId: string, attendances: { studentId: string, status: string, notes?: string }[]) {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      select: { classId: true, status: true, date: true }
    });

    if (!schedule) {
      return { error: "Không tìm thấy lịch học" };
    }

    for (const record of attendances) {
      // If UNMARKED or empty, remove existing attendance record so it reflects unmarked
      if (!record.status || record.status === "UNMARKED") {
        const existing = await prisma.attendance.findFirst({
          where: { scheduleId, studentId: record.studentId }
        });
        if (existing) {
          await prisma.attendance.delete({ where: { id: existing.id } });
        }
        continue;
      }

      await prisma.attendance.upsert({
        where: {
          scheduleId_studentId: {
            scheduleId,
            studentId: record.studentId
          }
        },
        update: {
          status: record.status,
          note: record.notes
        },
        create: {
          scheduleId,
          studentId: record.studentId,
          classId: schedule.classId,
          status: record.status,
          note: record.notes
        }
      });
    }

    // Check remaining attendances
    const totalMarked = await prisma.attendance.count({
      where: { scheduleId }
    });

    // If attendance has been recorded and schedule was SCHEDULED, update to COMPLETED
    if (totalMarked > 0 && schedule.status === "SCHEDULED") {
      await prisma.schedule.update({
        where: { id: scheduleId },
        data: { status: "COMPLETED" }
      });
    }

    revalidatePath("/schedule");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
