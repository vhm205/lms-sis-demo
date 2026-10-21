"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateDealStage(leadId: string, status: string) {
  try {
    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status },
      include: { course: true, facility: true },
    });

    await prisma.activityLog.create({
      data: {
        action: "DEAL_STAGE_UPDATED",
        entityType: "Lead",
        entityId: leadId,
        details: JSON.stringify({
          newStatus: status,
          customerName: updated.name,
        }),
        source: "SALES_HUB_UI",
      },
    });

    revalidatePath("/sales-hub");
    revalidatePath("/leads");
    revalidatePath("/");

    return { success: true, lead: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Cập nhật giai đoạn cơ hội thất bại" };
  }
}

export async function createOpportunityAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const courseId = formData.get("courseId") as string;
  const facilityId = formData.get("facilityId") as string;
  const notes = (formData.get("notes") as string)?.trim() || "";
  const status = (formData.get("status") as string) || "NEW";

  if (!name || !phone) {
    return { success: false, error: "Vui lòng nhập tên và số điện thoại khách hàng" };
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        phone,
        courseId: courseId && courseId !== "none" ? courseId : null,
        facilityId: facilityId && facilityId !== "none" ? facilityId : null,
        notes,
        status,
      },
      include: { course: true, facility: true },
    });

    await prisma.activityLog.create({
      data: {
        action: "DEAL_OPPORTUNITY_CREATED",
        entityType: "Lead",
        entityId: lead.id,
        details: JSON.stringify({
          customerName: name,
          phone,
          status,
        }),
        source: "SALES_HUB_UI",
      },
    });

    revalidatePath("/sales-hub");
    revalidatePath("/leads");
    revalidatePath("/");

    return { success: true, lead };
  } catch (error: any) {
    return { success: false, error: error.message || "Tạo cơ hội bán hàng thất bại" };
  }
}
