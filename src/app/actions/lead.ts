"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLead(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const courseId = formData.get("courseId") as string || undefined;
  const facilityId = formData.get("facilityId") as string || undefined;
  const notes = formData.get("notes") as string || undefined;

  if (!name || !phone) {
    return { error: "Missing name or phone" };
  }

  try {
    await prisma.lead.create({
      data: { name, phone, courseId, facilityId, notes, status: "NEW" }
    });
    revalidatePath("/leads");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function updateLeadStatus(id: string, status: string) {
  try {
    await prisma.lead.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/leads");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update lead" };
  }
}

export async function updateLead(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const courseId = (formData.get("courseId") as string) || null;
  const facilityId = (formData.get("facilityId") as string) || null;
  const notes = (formData.get("notes") as string) || null;
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
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update lead" };
  }
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({ where: { id } });
    revalidatePath("/leads");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete lead" };
  }
}

