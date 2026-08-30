"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const duration = parseInt(formData.get("duration") as string) || 0;
  const fee = parseFloat(formData.get("fee") as string) || 0;

  if (!code || !name) return { error: "Missing required fields" };

  try {
    await prisma.course.create({
      data: { code, name, type, duration, fee }
    });
    revalidatePath("/courses");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateCourse(id: string, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const duration = parseInt(formData.get("duration") as string) || 0;
  const fee = parseFloat(formData.get("fee") as string) || 0;

  if (!code || !name) return { error: "Vui lòng nhập Mã và Tên khóa học" };

  try {
    await prisma.course.update({
      where: { id },
      data: { code, name, type, duration, fee }
    });
    revalidatePath("/courses");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.delete({ where: { id } });
    revalidatePath("/courses");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

