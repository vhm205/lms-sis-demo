"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData) {
  const code = (formData.get("code") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || "";
  const duration = parseInt(formData.get("duration") as string) || 0;
  const fee = parseFloat(formData.get("fee") as string) || 0;

  if (!code || !name) return { error: "Vui lòng nhập Mã và Tên khóa học" };

  try {
    const existing = await prisma.course.findUnique({
      where: { code }
    });
    if (existing) {
      return { error: `Mã khóa học "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }

    await prisma.course.create({
      data: { code, name, type, duration, fee }
    });
    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002" || error.message?.includes("UNIQUE constraint failed")) {
      return { error: `Mã khóa học "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }
    return { error: error.message || "Có lỗi xảy ra khi tạo khóa học" };
  }
}

export async function updateCourse(id: string, formData: FormData) {
  const code = (formData.get("code") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const type = (formData.get("type") as string)?.trim() || "";
  const duration = parseInt(formData.get("duration") as string) || 0;
  const fee = parseFloat(formData.get("fee") as string) || 0;

  if (!code || !name) return { error: "Vui lòng nhập Mã và Tên khóa học" };

  try {
    const existing = await prisma.course.findFirst({
      where: {
        code,
        id: { not: id }
      }
    });
    if (existing) {
      return { error: `Mã khóa học "${code}" đã được sử dụng bởi khóa "${existing.name}". Vui lòng chọn mã khác.` };
    }

    await prisma.course.update({
      where: { id },
      data: { code, name, type, duration, fee }
    });
    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002" || error.message?.includes("UNIQUE constraint failed")) {
      return { error: `Mã khóa học "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }
    return { error: error.message || "Có lỗi xảy ra khi cập nhật khóa học" };
  }
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.delete({ where: { id } });
    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

