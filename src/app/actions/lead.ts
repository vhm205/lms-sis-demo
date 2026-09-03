"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLead(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const rawCourseId = formData.get("courseId") as string;
  const courseId = (!rawCourseId || rawCourseId === "none") ? undefined : rawCourseId;
  const rawFacilityId = formData.get("facilityId") as string;
  const facilityId = (!rawFacilityId || rawFacilityId === "none") ? undefined : rawFacilityId;
  const notes = (formData.get("notes") as string)?.trim() || undefined;

  if (!name || !phone) {
    return { error: "Vui lòng nhập tên và SĐT khách hàng" };
  }

  try {
    await prisma.lead.create({
      data: { name, phone, courseId, facilityId, notes, status: "NEW" }
    });
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Có lỗi xảy ra khi tạo khách hàng" };
  }
}

export async function updateLeadStatus(id: string, status: string) {
  try {
    await prisma.lead.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update lead" };
  }
}

export async function updateLead(id: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const rawCourseId = formData.get("courseId") as string;
  const courseId = (!rawCourseId || rawCourseId === "none") ? null : rawCourseId;
  const rawFacilityId = formData.get("facilityId") as string;
  const facilityId = (!rawFacilityId || rawFacilityId === "none") ? null : rawFacilityId;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const status = (formData.get("status") as string) || "NEW";

  if (!name || !phone) {
    return { error: "Vui lòng nhập tên và SĐT" };
  }

  try {
    await prisma.lead.update({
      where: { id },
      data: { name, phone, courseId, facilityId, notes, status }
    });
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update lead" };
  }
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({ where: { id } });
    revalidatePath("/leads");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete lead" };
  }
}

