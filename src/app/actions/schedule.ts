"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSchedule(formData: FormData) {
  const classId = formData.get("classId") as string;
  const roomId = formData.get("roomId") as string;
  const dateStr = formData.get("date") as string;
  const duration = parseInt(formData.get("duration") as string) || 90;

  if (!classId || !roomId || !dateStr) {
    return { error: "Missing required fields" };
  }

  try {
    await prisma.schedule.create({
      data: { classId, roomId, date: new Date(dateStr), duration, status: "SCHEDULED" }
    });
    revalidatePath("/schedule");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateSchedule(id: string, formData: FormData) {
  const classId = formData.get("classId") as string;
  const roomId = formData.get("roomId") as string;
  const dateStr = formData.get("date") as string;
  const duration = parseInt(formData.get("duration") as string) || 90;
  const status = (formData.get("status") as string) || "SCHEDULED";

  if (!classId || !roomId || !dateStr) {
    return { error: "Vui lòng nhập đầy đủ các trường bắt buộc" };
  }

  try {
    await prisma.schedule.update({
      where: { id },
      data: { classId, roomId, date: new Date(dateStr), duration, status }
    });
    revalidatePath("/schedule");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteSchedule(id: string) {
  try {
    await prisma.schedule.delete({ where: { id } });
    revalidatePath("/schedule");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

