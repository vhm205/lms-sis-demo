"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData) {
  const parentName = (formData.get("parentName") as string)?.trim();
  const parentPhone = (formData.get("parentPhone") as string)?.trim();
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr) || 0;
  const notes = (formData.get("notes") as string)?.trim() || "";

  if (!parentName || !parentPhone || !courseId || !facilityId) {
    return { error: "Vui lòng nhập đầy đủ các trường bắt buộc" };
  }

  const code = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  try {
    const order = await prisma.order.create({
      data: {
        code,
        parentName,
        parentPhone,
        courseId,
        facilityId,
        amount,
        notes,
        status: "PENDING"
      }
    });

    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true, order };
  } catch (error: any) {
    if (error.code === "P2002" || error.message?.includes("UNIQUE constraint failed")) {
      return { error: "Mã đơn hàng bị trùng lặp, vui lòng thử lại." };
    }
    return { error: error.message || "Có lỗi xảy ra khi tạo đơn hàng" };
  }
}

export async function updateOrder(id: string, formData: FormData) {
  const parentName = (formData.get("parentName") as string)?.trim();
  const parentPhone = (formData.get("parentPhone") as string)?.trim();
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr) || 0;
  const notes = (formData.get("notes") as string)?.trim() || "";
  const status = (formData.get("status") as string) || "PENDING";

  if (!parentName || !parentPhone || !courseId || !facilityId) {
    return { error: "Vui lòng nhập đầy đủ các trường bắt buộc" };
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        parentName,
        parentPhone,
        courseId,
        facilityId,
        amount,
        notes,
        status
      }
    });

    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true, order };
  } catch (error: any) {
    return { error: error.message || "Có lỗi xảy ra khi cập nhật đơn hàng" };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    await prisma.order.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update order" };
  }
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath("/orders");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete order" };
  }
}

