"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStudent(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const code = formData.get("code") as string;
  const facilityId = formData.get("facilityId") as string;
  const parentName = formData.get("parentName") as string;
  const parentPhone = formData.get("parentPhone") as string;

  // Simple validation
  if (!name || !code || !facilityId) {
    return { error: "Missing required fields" };
  }

  try {
    // Check or create parent
    let parent = null;
    if (parentPhone) {
      parent = await prisma.parent.findUnique({ where: { phone: parentPhone } });
      if (!parent && parentName) {
        parent = await prisma.parent.create({
          data: { name: parentName, phone: parentPhone }
        });
      }
    }

    const student = await prisma.student.create({
      data: {
        name,
        code,
        phone,
        facilityId,
        ...(parent && { parentId: parent.id })
      }
    });

    revalidatePath("/students");
    revalidatePath("/");
    return { success: true, student };
  } catch (error: any) {
    console.error("Error creating student:", error);
    return { error: error.message || "Failed to create student" };
  }
}

export async function updateStudent(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const code = formData.get("code") as string;
  const facilityId = formData.get("facilityId") as string;
  const parentName = formData.get("parentName") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const status = (formData.get("status") as string) || "ACTIVE";

  // Simple validation
  if (!name || !code || !facilityId) {
    return { error: "Vui lòng điền đủ các trường bắt buộc (Mã HV, Họ tên, Cơ sở)" };
  }

  try {
    // Check or update parent
    let parent = null;
    if (parentPhone) {
      parent = await prisma.parent.findUnique({ where: { phone: parentPhone } });
      if (!parent && parentName) {
        parent = await prisma.parent.create({
          data: { name: parentName, phone: parentPhone }
        });
      } else if (parent && parentName && parent.name !== parentName) {
        parent = await prisma.parent.update({
          where: { id: parent.id },
          data: { name: parentName }
        });
      }
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        name,
        code,
        phone: phone || null,
        facilityId,
        status,
        parentId: parent ? parent.id : null
      }
    });

    revalidatePath("/students");
    revalidatePath("/");
    return { success: true, student };
  } catch (error: any) {
    console.error("Error updating student:", error);
    return { error: error.message || "Failed to update student" };
  }
}

export async function deleteStudent(id: string) {
  try {
    await prisma.student.delete({ where: { id } });
    revalidatePath("/students");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete student" };
  }
}

