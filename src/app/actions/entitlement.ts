"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { provisionTrialAccount, handleLmsProgressWebhook } from "@/lib/lms-simulator";
import { renewEntitlement, forceExpireEntitlement } from "@/lib/entitlement";

export async function createTrialAccountAction(data: {
  name: string;
  phone: string;
  courseId: string;
  facilityId: string;
  trialDays: number;
  notes?: string;
}) {
  try {
    const result = await provisionTrialAccount({
      name: data.name,
      phone: data.phone,
      courseId: data.courseId,
      facilityId: data.facilityId,
      trialDays: data.trialDays,
      notes: data.notes,
    });

    revalidatePath("/entitlements");
    revalidatePath("/students");
    revalidatePath("/leads");
    revalidatePath("/sales-hub");
    revalidatePath("/");

    return { ...result };
  } catch (error: any) {
    return { success: false, error: error.message || "Cấp quyền học thử thất bại" };
  }
}

export async function triggerLmsProgressAction(data: {
  studentId: string;
  event: "lms.first_login" | "lms.lesson_completed" | "lms.progress_updated";
  lessonTitle?: string;
  progressPercent?: number;
}) {
  try {
    const result = await handleLmsProgressWebhook({
      event: data.event,
      learner_id: data.studentId,
      lesson_title: data.lessonTitle,
      progress_percent: data.progressPercent,
      timestamp: new Date().toISOString(),
      dedup_key: `manual_lms_${data.studentId}_${Date.now()}`,
    });

    revalidatePath("/entitlements");
    revalidatePath("/students");
    revalidatePath("/sales-hub");
    revalidatePath("/");

    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message || "Ghi nhận tiến độ LMS thất bại" };
  }
}

export async function renewStudentEntitlementAction(id: string, additionalDays: number = 30) {
  try {
    const result = await renewEntitlement(id, additionalDays);

    revalidatePath("/entitlements");
    revalidatePath("/students");
    revalidatePath("/sales-hub");
    revalidatePath("/");

    return { success: true, entitlement: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Gia hạn quyền học thất bại" };
  }
}

export async function expireStudentEntitlementAction(id: string) {
  try {
    const result = await forceExpireEntitlement(id);

    revalidatePath("/entitlements");
    revalidatePath("/students");
    revalidatePath("/sales-hub");
    revalidatePath("/");

    return { success: true, entitlement: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Thu hồi quyền học thất bại" };
  }
}
