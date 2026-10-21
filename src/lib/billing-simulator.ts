import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { issueEntitlement } from "@/lib/entitlement";

export interface BillingWebhookPayload {
  event: "payment_success" | "payment_failed" | "refund_processed";
  order_code: string;
  order_id?: string;
  transaction_id: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  paid_at?: string;
  dedup_key?: string;
  source?: string;
  notes?: string;
}

export async function handleBillingWebhook(payload: BillingWebhookPayload) {
  const {
    event,
    order_code,
    order_id,
    transaction_id,
    amount,
    currency = "VND",
    payment_method = "BANK_TRANSFER",
    paid_at = new Date().toISOString(),
    dedup_key,
    source = "BILLING_MOCK",
    notes,
  } = payload;

  if (!order_code && !order_id) {
    throw new Error("Missing 'order_code' or 'order_id' in billing webhook payload.");
  }

  // 1. Check Idempotency via dedup_key or transaction_id
  const effectiveDedupKey = dedup_key || `billing_${transaction_id}_${event}`;
  const existingLog = await prisma.activityLog.findFirst({
    where: {
      action: "WEBHOOK_BILLING_CONFIRMATION",
      details: { contains: effectiveDedupKey },
    },
  });

  if (existingLog) {
    return {
      success: true,
      isDuplicate: true,
      message: `Sự kiện thanh toán trùng lặp (dedup_key: ${effectiveDedupKey}). Bỏ qua xử lý lặp.`,
      entityId: existingLog.entityId,
      dedup_key: effectiveDedupKey,
    };
  }

  // 2. Find Order
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(order_code ? [{ code: order_code }] : []),
        ...(order_id ? [{ id: order_id }] : []),
      ],
    },
    include: {
      course: true,
      student: true,
    },
  });

  if (!order) {
    await prisma.activityLog.create({
      data: {
        action: "WEBHOOK_BILLING_ERROR",
        entityType: "Order",
        entityId: order_code || order_id || "UNKNOWN",
        details: JSON.stringify({
          error: "Order not found",
          payload,
          effectiveDedupKey,
        }),
        source: "BILLING_MOCK",
      },
    });
    throw new Error(`Không tìm thấy đơn hàng với mã: ${order_code || order_id}`);
  }

  // 3. Process events
  if (event === "payment_success") {
    // Check amount match
    const amountDifference = Math.abs(order.amount - amount);
    if (amountDifference > 1) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          notes: `${order.notes || ""} | [CẢNH BÁO LỆCH TIỀN: Đơn ${order.amount}đ vs Webhook ${amount}đ]`,
        },
      });

      await prisma.activityLog.create({
        data: {
          action: "WEBHOOK_BILLING_AMOUNT_MISMATCH",
          entityType: "Order",
          entityId: order.id,
          details: JSON.stringify({
            orderAmount: order.amount,
            paidAmount: amount,
            transaction_id,
            effectiveDedupKey,
          }),
          source: "BILLING_MOCK",
        },
      });

      return {
        success: false,
        status: "PAYMENT_MISMATCH",
        message: `Số tiền thanh toán (${amount}đ) không khớp với giá trị đơn hàng (${order.amount}đ). Đã chuyển sang chờ đối soát.`,
        orderId: order.id,
      };
    }

    // Update Order to PAID
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        notes: `${order.notes || ""} | [Đã xác nhận thanh toán qua ${payment_method} - GD: ${transaction_id}]`,
      },
    });

    // Resolve Student to issue Entitlement
    let targetStudentId: string | null | undefined = order.studentId;
    if (!targetStudentId) {
      // Find or link a student with matching parent phone
      const student = await prisma.student.findFirst({
        where: {
          parent: { phone: order.parentPhone },
        },
      });
      targetStudentId = student?.id;
    }

    let issuedEntitlement = null;
    if (targetStudentId) {
      issuedEntitlement = await issueEntitlement({
        studentId: targetStudentId,
        courseId: order.courseId,
        orderId: order.id,
        type: "OFFICIAL",
        durationDays: order.course.duration ? Math.max(90, order.course.duration * 3) : 90,
        source: "BILLING_MOCK",
        notes: `Kích hoạt tự động từ Đơn hàng ${order.code} (GD: ${transaction_id})`,
      });
    }

    // Record ActivityLog
    await prisma.activityLog.create({
      data: {
        action: "WEBHOOK_BILLING_CONFIRMATION",
        entityType: "Order",
        entityId: order.id,
        details: JSON.stringify({
          event,
          transaction_id,
          amount,
          currency,
          payment_method,
          paid_at,
          dedup_key: effectiveDedupKey,
          entitlementId: issuedEntitlement?.id || null,
        }),
        source: "BILLING_MOCK",
      },
    });

    try {
      revalidatePath("/orders");
      revalidatePath("/developer");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Đã xác nhận thanh toán thành công cho đơn hàng ${order.code}. Trạng thái đã chuyển sang PAID.`,
      order: {
        id: updatedOrder.id,
        code: updatedOrder.code,
        status: updatedOrder.status,
        amount: updatedOrder.amount,
      },
      entitlement: issuedEntitlement
        ? {
            id: issuedEntitlement.id,
            status: issuedEntitlement.status,
            expiresAt: issuedEntitlement.expiresAt,
          }
        : null,
      dedup_key: effectiveDedupKey,
    };
  } else if (event === "refund_processed") {
    // Process refund
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        notes: `${order.notes || ""} | [Đã hoàn tiền GD: ${transaction_id} - Số tiền: ${amount}đ]`,
      },
    });

    // Revoke entitlements linked to this order
    await prisma.entitlement.updateMany({
      where: { orderId: order.id },
      data: {
        status: "REVOKED",
        notes: `Bị thu hồi do hoàn tiền đơn hàng ${order.code}`,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "WEBHOOK_BILLING_CONFIRMATION",
        entityType: "Order",
        entityId: order.id,
        details: JSON.stringify({
          event,
          transaction_id,
          amount,
          dedup_key: effectiveDedupKey,
        }),
        source: "BILLING_MOCK",
      },
    });

    return {
      success: true,
      message: `Đã xử lý hoàn tiền cho đơn hàng ${order.code}. Trạng thái chuyển sang CANCELLED và thu hồi Entitlement.`,
      orderId: order.id,
      dedup_key: effectiveDedupKey,
    };
  } else {
    // payment_failed
    await prisma.activityLog.create({
      data: {
        action: "WEBHOOK_BILLING_PAYMENT_FAILED",
        entityType: "Order",
        entityId: order.id,
        details: JSON.stringify({
          event,
          transaction_id,
          notes,
          dedup_key: effectiveDedupKey,
        }),
        source: "BILLING_MOCK",
      },
    });

    return {
      success: true,
      message: `Đã ghi nhận giao dịch thanh toán thất bại cho đơn hàng ${order.code}. Đơn hàng giữ nguyên trạng thái PENDING.`,
      orderId: order.id,
      dedup_key: effectiveDedupKey,
    };
  }
}
