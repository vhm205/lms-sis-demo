import { NextRequest, NextResponse } from "next/server";
import { handleLmsProgressWebhook, LmsProgressWebhookPayload } from "@/lib/lms-simulator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const payload: LmsProgressWebhookPayload = {
      event: body.event || "lms.first_login",
      learner_id: body.learner_id || body.learnerId || body.student_code || body.studentCode || body.student_id || body.studentId,
      course_id: body.course_id || body.courseId,
      lesson_id: body.lesson_id || body.lessonId,
      lesson_title: body.lesson_title || body.lessonTitle,
      progress_percent: typeof body.progress_percent === "number" ? body.progress_percent : 100,
      external_reference: body.external_reference || body.externalReference || `lms_ref_${Date.now()}`,
      timestamp: body.timestamp || new Date().toISOString(),
      dedup_key: body.dedup_key || body.dedupKey,
    };

    const result = await handleLmsProgressWebhook(payload);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("[LMS Progress Webhook Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error during LMS progress webhook processing",
      },
      { status: 500 }
    );
  }
}
