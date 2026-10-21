"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { handleBillingWebhook } from "@/lib/billing-simulator";

export async function confirmPayment(orderId: string, paymentMethod = "VIETQR", amount?: number) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { course: true, student: true },
    });

    if (!order) {
      return { success: false, error: "Không tìm thấy đơn hàng" };
    }

    const payAmount = amount !== undefined ? amount : order.amount;
    const transactionId = `tx_pay_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const result = await handleBillingWebhook({
      event: "payment_success",
      order_id: order.id,
      order_code: order.code,
      transaction_id: transactionId,
      amount: payAmount,
      currency: "VND",
      payment_method: paymentMethod,
      source: "BILLING_UI_CONSOLE",
    });

    revalidatePath("/billing");
    revalidatePath("/orders");
    revalidatePath("/entitlements");
    revalidatePath("/sales-hub");
    revalidatePath("/");

    return { success: true, result, transactionId };
  } catch (error: any) {
    return { success: false, error: error.message || "Xác nhận thanh toán thất bại" };
  }
}

export async function processRefund(orderId: string, amount: number, reason = "Yêu cầu hoàn phí của khách hàng") {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { course: true },
    });

    if (!order) {
      return { success: false, error: "Không tìm thấy đơn hàng" };
    }

    const transactionId = `tx_ref_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const result = await handleBillingWebhook({
      event: "refund_processed",
      order_id: order.id,
      order_code: order.code,
      transaction_id: transactionId,
      amount: amount || order.amount,
      notes: reason,
      source: "BILLING_UI_CONSOLE",
    });

    revalidatePath("/billing");
    revalidatePath("/orders");
    revalidatePath("/entitlements");
    revalidatePath("/sales-hub");
    revalidatePath("/");

    return { success: true, result, transactionId };
  } catch (error: any) {
    return { success: false, error: error.message || "Xử lý hoàn tiền thất bại" };
  }
}

export async function createBillingInvoice(formData: FormData) {
  const parentName = (formData.get("parentName") as string)?.trim();
  const parentPhone = (formData.get("parentPhone") as string)?.trim();
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const amountStr = formData.get("amount") as string;
  const amount = parseFloat(amountStr) || 0;
  const notes = (formData.get("notes") as string)?.trim() || "";

  if (!parentName || !parentPhone || !courseId || !facilityId || amount <= 0) {
    return { success: false, error: "Vui lòng nhập đầy đủ các trường bắt buộc và số tiền hợp lệ" };
  }

  const code = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  try {
    // Check if student exists with this parent phone
    let student = await prisma.student.findFirst({
      where: {
        parent: { phone: parentPhone },
      },
    });

    const order = await prisma.order.create({
      data: {
        code,
        studentId: student?.id,
        parentName,
        parentPhone,
        courseId,
        facilityId,
        amount,
        notes,
        status: "PENDING",
      },
      include: {
        course: true,
        facility: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "BILLING_INVOICE_CREATED",
        entityType: "Order",
        entityId: order.id,
        details: JSON.stringify({ code: order.code, amount, parentName }),
        source: "UI",
      },
    });

    revalidatePath("/billing");
    revalidatePath("/orders");
    revalidatePath("/");

    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || "Tạo hóa đơn thất bại" };
  }
}
