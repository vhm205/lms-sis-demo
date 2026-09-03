"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClass(formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const teacherId = formData.get("teacherId") as string || undefined;
  const capacity = parseInt(formData.get("capacity") as string) || 20;

  if (!code || !name || !courseId || !facilityId) {
    return { error: "Missing required fields" };
  }

  try {
    await prisma.class.create({
      data: { code, name, courseId, facilityId, teacherId, capacity, status: "UPCOMING" }
    });
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateClass(id: string, formData: FormData) {
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const teacherId = (formData.get("teacherId") as string) || null;
  const capacity = parseInt(formData.get("capacity") as string) || 20;
  const status = (formData.get("status") as string) || "ONGOING";

  if (!code || !name || !courseId || !facilityId) {
    return { error: "Vui lòng nhập đầy đủ các trường bắt buộc" };
  }

  try {
    await prisma.class.update({
      where: { id },
      data: { code, name, courseId, facilityId, teacherId, capacity, status }
    });
    revalidatePath("/classes");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
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

