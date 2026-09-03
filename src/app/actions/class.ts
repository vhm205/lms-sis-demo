"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClass(formData: FormData) {
  const code = (formData.get("code") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const rawTeacherId = formData.get("teacherId") as string;
  const teacherId = (!rawTeacherId || rawTeacherId === "none") ? undefined : rawTeacherId;
  const capacity = parseInt(formData.get("capacity") as string) || 20;

  if (!code || !name || !courseId || !facilityId) {
    return { error: "Vui lòng nhập đầy đủ các trường bắt buộc" };
  }

  try {
    const existing = await prisma.class.findUnique({
      where: { code }
    });
    if (existing) {
      return { error: `Mã lớp "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }

    await prisma.class.create({
      data: { code, name, courseId, facilityId, teacherId, capacity, status: "UPCOMING" }
    });
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002" || error.message?.includes("UNIQUE constraint failed")) {
      return { error: `Mã lớp "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }
    return { error: error.message || "Có lỗi xảy ra khi tạo lớp học" };
  }
}

export async function updateClass(id: string, formData: FormData) {
  const code = (formData.get("code") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const rawTeacherId = formData.get("teacherId") as string;
  const teacherId = (!rawTeacherId || rawTeacherId === "none") ? null : rawTeacherId;
  const capacity = parseInt(formData.get("capacity") as string) || 20;
  const status = (formData.get("status") as string) || "ONGOING";

  if (!code || !name || !courseId || !facilityId) {
    return { error: "Vui lòng nhập đầy đủ các trường bắt buộc" };
  }

  try {
    const existing = await prisma.class.findFirst({
      where: {
        code,
        id: { not: id }
      }
    });
    if (existing) {
      return { error: `Mã lớp "${code}" đã được sử dụng bởi lớp "${existing.name}". Vui lòng chọn mã khác.` };
    }

    await prisma.class.update({
      where: { id },
      data: { code, name, courseId, facilityId, teacherId, capacity, status }
    });
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002" || error.message?.includes("UNIQUE constraint failed")) {
      return { error: `Mã lớp "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }
    return { error: error.message || "Có lỗi xảy ra khi cập nhật lớp học" };
  }
}

export async function deleteClass(id: string) {
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

