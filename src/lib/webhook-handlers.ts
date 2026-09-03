import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface OrchexaLeadWebhookPayload {
  customer_name?: string;
  phone: string;
  email?: string;
  notes?: string;
  conversation_id?: string;
  agent_id?: string;
  agent_name?: string;
  channel?: string;
  timestamp?: string;
  dedup_key?: string;
  student_name?: string;
  student_class?: string;
  course_id?: string;
  facility_id?: string;
}

export interface OrchexaOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrchexaOrderWebhookPayload {
  order_id?: string;
  customer_name?: string;
  phone: string;
  items?: OrchexaOrderItem[];
  total?: number;
  notes?: string;
  conversation_id?: string;
  agent_id?: string;
  agent_name?: string;
  channel?: string;
  timestamp?: string;
  dedup_key?: string;
  course_id?: string;
  facility_id?: string;
}

/**
 * Handles incoming lead_created webhook from Orchexa Event Trigger
 */
export async function handleOrchexaLeadCreated(payload: OrchexaLeadWebhookPayload) {
  const {
    customer_name,
    phone,
    email,
    notes,
    conversation_id,
    agent_id,
    agent_name,
    channel,
    timestamp,
    dedup_key,
    student_name,
    student_class,
    course_id,
    facility_id,
  } = payload;

  if (!phone) {
    throw new Error("Missing required field 'phone' in webhook payload.");
  }

  // 1. Check deduplication if dedup_key provided
  if (dedup_key) {
    const existingLog = await prisma.activityLog.findFirst({
      where: {
        action: "WEBHOOK_LEAD_CREATED",
        details: { contains: dedup_key },
      },
    });
    if (existingLog) {
      return {
        success: true,
        isDuplicate: true,
        message: "Duplicate webhook event skipped based on dedup_key.",
        entityId: existingLog.entityId,
        dedup_key,
      };
    }
  }

  // 2. Resolve default or specified course & facility
  let targetCourseId = course_id;
  if (!targetCourseId) {
    const defaultCourse = await prisma.course.findFirst({
      where: { status: "ACTIVE" },
    });
    targetCourseId = defaultCourse?.id;
  }

  let targetFacilityId = facility_id;
  if (!targetFacilityId) {
    const defaultFacility = await prisma.facility.findFirst();
    targetFacilityId = defaultFacility?.id;
  }

  // 3. Compile rich notes for CRM
  const notesParts: string[] = [];
  if (notes) notesParts.push(notes);
  if (email) notesParts.push(`Email: ${email}`);
  if (student_name) notesParts.push(`Học viên: ${student_name}`);
  if (student_class) notesParts.push(`Lớp/Khóa: ${student_class}`);
  if (channel) notesParts.push(`Kênh: ${channel}`);
  if (agent_name) notesParts.push(`AI Agent: ${agent_name} (${agent_id || "N/A"})`);
  if (conversation_id) notesParts.push(`Conv: ${conversation_id}`);

  const compiledNotes = `[Orchexa Webhook] ${notesParts.join(" | ")}`;

  // 4. Create Lead in DB
  const lead = await prisma.lead.create({
    data: {
      name: customer_name || student_name || "Khách hàng Orchexa",
      phone: phone.trim(),
      courseId: targetCourseId,
      facilityId: targetFacilityId,
      source: channel ? `ORCHEXA_${channel.toUpperCase()}` : "ORCHEXA_AI_WEBHOOK",
      notes: compiledNotes,
      status: "NEW",
    },
  });

  // 5. Create ActivityLog
  await prisma.activityLog.create({
    data: {
      action: "WEBHOOK_LEAD_CREATED",
      entityType: "Lead",
      entityId: lead.id,
      details: JSON.stringify({
        ...payload,
        receivedAt: new Date().toISOString(),
      }),
      source: "AI_AGENT",
    },
  });

  try {
    revalidatePath("/leads");
    revalidatePath("/");
  } catch {
    // ignore
  }

  return {
    success: true,
    message: "Đã tiếp nhận và tạo khách hàng tiềm năng (Lead) thành công từ Orchexa Webhook.",
    lead: {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      source: lead.source,
      status: lead.status,
    },
    dedup_key: dedup_key || null,
  };
}

/**
 * Handles incoming order_created webhook from Orchexa Event Trigger
 */
export async function handleOrchexaOrderCreated(payload: OrchexaOrderWebhookPayload) {
  const {
    order_id,
    customer_name,
    phone,
    items,
    total,
    notes,
    conversation_id,
    agent_id,
    agent_name,
    channel,
    timestamp,
    dedup_key,
    course_id,
    facility_id,
  } = payload;

  if (!phone) {
    throw new Error("Missing required field 'phone' in webhook payload.");
  }

  // 1. Check deduplication
  if (dedup_key) {
    const existingLog = await prisma.activityLog.findFirst({
      where: {
        action: "WEBHOOK_ORDER_CREATED",
        details: { contains: dedup_key },
      },
    });
    if (existingLog) {
      return {
        success: true,
        isDuplicate: true,
        message: "Duplicate webhook event skipped based on dedup_key.",
        entityId: existingLog.entityId,
        dedup_key,
      };
    }
  }

  // 2. Resolve default or specified course & facility
  let targetCourseId = course_id;
  if (!targetCourseId) {
    const defaultCourse = await prisma.course.findFirst({
      where: { status: "ACTIVE" },
    });
    targetCourseId = defaultCourse?.id;
  }

  let targetFacilityId = facility_id;
  if (!targetFacilityId) {
    const defaultFacility = await prisma.facility.findFirst();
    targetFacilityId = defaultFacility?.id;
  }

  if (!targetCourseId || !targetFacilityId) {
    throw new Error("Cannot resolve Course or Facility for Order creation.");
  }

  // 3. Compile items text and notes
  let itemsText = "";
  if (items && Array.isArray(items) && items.length > 0) {
    itemsText = items
      .map((it) => `${it.name} (x${it.quantity}) - ${Number(it.price).toLocaleString("vi-VN")}đ`)
      .join(", ");
  }

  const notesParts: string[] = [];
  if (notes) notesParts.push(notes);
  if (itemsText) notesParts.push(`Sản phẩm/Khóa: ${itemsText}`);
  if (channel) notesParts.push(`Kênh: ${channel}`);
  if (agent_name) notesParts.push(`AI Agent: ${agent_name} (${agent_id || "N/A"})`);
  if (conversation_id) notesParts.push(`Conv: ${conversation_id}`);

  const compiledNotes = `[Orchexa Webhook] ${notesParts.join(" | ")}`;

  // 4. Generate unique order code with collision avoidance
  let code = order_id
    ? `ORD-${order_id.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase()}`
    : `ORD-${Date.now().toString().slice(-6)}`;

  const existingWithCode = await prisma.order.findUnique({ where: { code } });
  if (existingWithCode) {
    code = `${code}-${Math.floor(100 + Math.random() * 900)}`;
  }

  // Calculate amount
  let calculatedAmount = typeof total === "number" ? total : parseFloat(String(total)) || 0;
  if (calculatedAmount === 0 && items && items.length > 0) {
    calculatedAmount = items.reduce((acc, it) => acc + (it.quantity || 1) * (it.price || 0), 0);
  }

  // 5. Create Order in DB
  const order = await prisma.order.create({
    data: {
      code,
      parentName: customer_name || "Khách hàng Orchexa",
      parentPhone: phone.trim(),
      courseId: targetCourseId,
      facilityId: targetFacilityId,
      amount: calculatedAmount,
      notes: compiledNotes,
      status: "PENDING",
    },
  });

  // 6. Create ActivityLog
  await prisma.activityLog.create({
    data: {
      action: "WEBHOOK_ORDER_CREATED",
      entityType: "Order",
      entityId: order.id,
      details: JSON.stringify({
        ...payload,
        receivedAt: new Date().toISOString(),
      }),
      source: "AI_AGENT",
    },
  });

  try {
    revalidatePath("/orders");
    revalidatePath("/");
  } catch {
    // ignore
  }

  return {
    success: true,
    message: "Đã tiếp nhận và tạo đơn hàng (Order) thành công từ Orchexa Webhook.",
    order: {
      id: order.id,
      code: order.code,
      parentName: order.parentName,
      parentPhone: order.parentPhone,
      amount: order.amount,
      status: order.status,
    },
    dedup_key: dedup_key || null,
  };
}
