"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createStudent(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const code = (formData.get("code") as string)?.trim();
  const facilityId = formData.get("facilityId") as string;
  const parentName = (formData.get("parentName") as string)?.trim();
  const parentPhone = (formData.get("parentPhone") as string)?.trim();

  // Simple validation
  if (!name || !code || !facilityId) {
    return { error: "Vui lòng nhập đầy đủ các trường bắt buộc (Mã HV, Họ tên, Cơ sở)" };
  }

  try {
    const existing = await prisma.student.findUnique({
      where: { code }
    });
    if (existing) {
      return { error: `Mã học viên "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }

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
        phone: phone || null,
        facilityId,
        ...(parent && { parentId: parent.id })
      }
    });

    revalidatePath("/students");
    revalidatePath("/");
    return { success: true, student };
  } catch (error: any) {
    if (error.code === "P2002" || error.message?.includes("UNIQUE constraint failed")) {
      return { error: `Mã học viên "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }
    return { error: error.message || "Có lỗi xảy ra khi tạo học viên" };
  }
}

export async function updateStudent(id: string, formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const code = (formData.get("code") as string)?.trim();
  const facilityId = formData.get("facilityId") as string;
  const parentName = (formData.get("parentName") as string)?.trim();
  const parentPhone = (formData.get("parentPhone") as string)?.trim();
  const status = (formData.get("status") as string) || "ACTIVE";

  // Simple validation
  if (!name || !code || !facilityId) {
    return { error: "Vui lòng điền đủ các trường bắt buộc (Mã HV, Họ tên, Cơ sở)" };
  }

  try {
    const existing = await prisma.student.findFirst({
      where: {
        code,
        id: { not: id }
      }
    });
    if (existing) {
      return { error: `Mã học viên "${code}" đã được sử dụng bởi học viên "${existing.name}". Vui lòng chọn mã khác.` };
    }

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
    if (error.code === "P2002" || error.message?.includes("UNIQUE constraint failed")) {
      return { error: `Mã học viên "${code}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` };
    }
    return { error: error.message || "Có lỗi xảy ra khi cập nhật học viên" };
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

