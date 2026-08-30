"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(formData: FormData) {
  const parentName = formData.get("parentName") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr) || 0;
  const notes = formData.get("notes") as string;

  if (!parentName || !parentPhone || !courseId || !facilityId) {
    return { error: "Missing required fields" };
  }

  const code = `ORD-${Date.now().toString().slice(-6)}`;

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
    return { success: true, order };
  } catch (error: any) {
    return { error: error.message || "Failed to create order" };
  }
}

export async function updateOrder(id: string, formData: FormData) {
  const parentName = formData.get("parentName") as string;
  const parentPhone = formData.get("parentPhone") as string;
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr) || 0;
  const notes = formData.get("notes") as string;
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
        notes: notes || "",
        status
      }
    });

    revalidatePath("/orders");
    return { success: true, order };
  } catch (error: any) {
    return { error: error.message || "Failed to update order" };
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    await prisma.order.update({
      where: { id },
      data: { status }
    });
    revalidatePath("/orders");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update order" };
  }
}

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });
    revalidatePath("/orders");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete order" };
  }
}

