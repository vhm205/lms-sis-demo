import { prisma } from "@/lib/prisma";
import { issueEntitlement } from "@/lib/entitlement";
import { revalidatePath } from "next/cache";

export interface LmsProgressWebhookPayload {
  event: "lms.first_login" | "lms.lesson_completed" | "lms.progress_updated";
  learner_id: string; // studentId or student code (e.g. HV0001)
  course_id?: string;
  lesson_id?: string;
  lesson_title?: string;
  progress_percent?: number;
  external_reference?: string;
  timestamp?: string;
  dedup_key?: string;
}

export interface ProvisionTrialParams {
  name: string;
  phone: string;
  courseId?: string;
  facilityId?: string;
  trialDays?: number;
  notes?: string;
}

export async function handleLmsProgressWebhook(payload: LmsProgressWebhookPayload) {
  const {
    event,
    learner_id,
    course_id,
    lesson_id,
    lesson_title,
    progress_percent = 100,
    external_reference = `ref_${Date.now()}`,
    timestamp = new Date().toISOString(),
    dedup_key,
  } = payload;

  if (!learner_id) {
    throw new Error("Missing required field 'learner_id' in LMS webhook payload.");
  }

  // 1. Idempotency check
  const effectiveDedupKey = dedup_key || `lms_${learner_id}_${event}_${lesson_id || external_reference}`;
  const existingLog = await prisma.activityLog.findFirst({
    where: {
      action: "LMS_PROGRESS_RECORDED",
      details: { contains: effectiveDedupKey },
    },
  });

  if (existingLog) {
    return {
      success: true,
      isDuplicate: true,
      message: `Sự kiện tiến độ LMS trùng lặp (dedup_key: ${effectiveDedupKey}). Bỏ qua xử lý lặp.`,
      entityId: existingLog.entityId,
      dedup_key: effectiveDedupKey,
    };
  }

  // 2. Resolve Student
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { id: learner_id },
        { code: learner_id },
        { phone: learner_id },
      ],
    },
    include: {
      classes: true,
      entitlements: true,
    },
  });

  if (!student) {
    // Audit unmapped event
    await prisma.activityLog.create({
      data: {
        action: "LMS_UNMAPPED_STUDENT_EVENT",
        entityType: "Student",
        entityId: learner_id,
        details: JSON.stringify({
          payload,
          effectiveDedupKey,
          message: "Student not found in SIS",
        }),
        source: "LMS_MOCK",
      },
    });

    throw new Error(`Không tìm thấy học viên với mã/ID/SĐT: ${learner_id}`);
  }

  // 3. Process events
  let activitySummary = "";

  if (event === "lms.first_login") {
    activitySummary = `Học viên đăng nhập hệ thống LMS lần đầu lúc ${new Date(timestamp).toLocaleString("vi-VN")}. Mốc Bắt đầu học (KPI) đã được ghi nhận.`;
  } else if (event === "lms.lesson_completed") {
    activitySummary = `Hoàn thành bài học: ${lesson_title || lesson_id || "Bài học số 1"} (${progress_percent}%).`;

    // Optionally create an Assignment record to reflect LMS progress
    await prisma.assignment.create({
      data: {
        title: `[LMS] ${lesson_title || "Bài học trực tuyến"}`,
        studentId: student.id,
        score: (progress_percent / 10),
        maxScore: 10,
        status: "COMPLETED",
        teacherNote: `Xác nhận tự động từ LMS Mock qua Webhook (${external_reference})`,
        date: new Date(timestamp),
      },
    });
  } else {
    activitySummary = `Cập nhật tiến độ học tập: ${progress_percent}%`;
  }

  // Record verified ActivityLog
  const log = await prisma.activityLog.create({
    data: {
      action: "LMS_PROGRESS_RECORDED",
      entityType: "Student",
      entityId: student.id,
      details: JSON.stringify({
        event,
        learner_id,
        course_id,
        lesson_id,
        lesson_title,
        progress_percent,
        external_reference,
        timestamp,
        dedup_key: effectiveDedupKey,
        summary: activitySummary,
      }),
      source: "LMS_MOCK",
    },
  });

  try {
    revalidatePath("/students");
    revalidatePath("/developer");
    revalidatePath("/");
  } catch {
    // ignore
  }

  return {
    success: true,
    message: activitySummary,
    student: {
      id: student.id,
      code: student.code,
      name: student.name,
    },
    event,
    external_reference,
    dedup_key: effectiveDedupKey,
    logId: log.id,
  };
}

/**
 * Provision a trial account for a lead / student
 */
export async function provisionTrialAccount(params: ProvisionTrialParams) {
  const {
    name,
    phone,
    courseId,
    facilityId,
    trialDays = 7,
    notes,
  } = params;

  if (!phone || !name) {
    throw new Error("Missing 'name' or 'phone' for trial provisioning.");
  }

  // 1. Resolve Course & Facility
  let targetCourseId = courseId;
  if (!targetCourseId) {
    const course = await prisma.course.findFirst({ where: { status: "ACTIVE" } });
    targetCourseId = course?.id;
  }

  let targetFacilityId = facilityId;
  if (!targetFacilityId) {
    const facility = await prisma.facility.findFirst();
    targetFacilityId = facility?.id;
  }

  if (!targetCourseId || !targetFacilityId) {
    throw new Error("Cannot resolve Course or Facility for trial provisioning.");
  }

  // 2. Find or create Parent
  let parent = await prisma.parent.findUnique({
    where: { phone: phone.trim() },
  });

  if (!parent) {
    parent = await prisma.parent.create({
      data: {
        name,
        phone: phone.trim(),
        notes: notes || "Khởi tạo từ luồng đăng ký học thử",
      },
    });
  }

  // 3. Find or create Student
  let student = await prisma.student.findFirst({
    where: {
      name,
      parentId: parent.id,
    },
  });

  if (!student) {
    const count = await prisma.student.count();
    const studentCode = `HV${(count + 1).toString().padStart(4, "0")}`;

    student = await prisma.student.create({
      data: {
        code: studentCode,
        name,
        phone: phone.trim(),
        parentId: parent.id,
        facilityId: targetFacilityId,
        status: "ACTIVE",
      },
    });
  }

  // 4. Issue TRIAL Entitlement
  const entitlement = await issueEntitlement({
    studentId: student.id,
    courseId: targetCourseId,
    type: "TRIAL",
    durationDays: trialDays,
    source: "LMS_TRIAL_PROVISIONING",
    notes: `Cấp quyền học thử ${trialDays} ngày cho học viên ${student.name}`,
  });

  // 5. Update matching Lead if exists
  await prisma.lead.updateMany({
    where: { phone: phone.trim() },
    data: {
      status: "TRIAL_DONE",
      notes: `[LMS Mock] Đã cấp quyền dùng thử ${trialDays} ngày (Entitlement: ${entitlement.id})`,
    },
  });

  const trialToken = `trial_tok_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const accessUrl = `https://lms-mock.educenter.vn/access?token=${trialToken}&student=${student.code}`;

  return {
    success: true,
    message: `Đã cấp quyền học thử ${trialDays} ngày thành công cho học viên ${student.name}.`,
    learner_id: student.id,
    student_code: student.code,
    username: student.code,
    temp_password: `Trial@${Date.now().toString().slice(-4)}`,
    trial_token: trialToken,
    access_url: accessUrl,
    starts_at: entitlement.startsAt.toISOString(),
    expires_at: entitlement.expiresAt.toISOString(),
    status: "TRIAL_PROVISIONED" as const,
  };
}
