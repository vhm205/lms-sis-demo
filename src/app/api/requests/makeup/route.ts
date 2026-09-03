import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);

    if (auth.role === "ANONYMOUS") {
      return NextResponse.json(
        {
          error: "Unauthorized: Yêu cầu quyền Quản trị viên (Admin API Key) hoặc Phụ huynh đã xác thực để đăng ký học bù.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const studentIdent = body.studentCode || body.studentId || body.code;
    const { missedScheduleId, targetScheduleId, notes } = body;

    if (!studentIdent || !missedScheduleId || !targetScheduleId) {
      return NextResponse.json(
        { error: "Missing required fields (studentCode/studentId, missedScheduleId, targetScheduleId)" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findFirst({
      where: { OR: [{ code: studentIdent }, { id: studentIdent }] },
    });

    if (!student) {
      return NextResponse.json(
        { error: `Không tìm thấy học viên với mã/ID: ${studentIdent}`, code: "STUDENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    if (auth.isParent && auth.parent) {
      if (student.parentId !== auth.parent.id) {
        return NextResponse.json(
          {
            error: "Forbidden: Bạn không có quyền gửi yêu cầu cho học sinh này.",
            code: "FORBIDDEN_PARENT_ACCESS",
          },
          { status: 403 }
        );
      }
    }

    // Check attendance status
    const attendance = await prisma.attendance.findUnique({
      where: { scheduleId_studentId: { scheduleId: missedScheduleId, studentId: student.id } },
    });

    if (!attendance || (attendance.status !== "ABSENT" && attendance.status !== "EXCUSED")) {
      return NextResponse.json(
        {
          error: "Không đủ điều kiện học bù. Học viên không vắng mặt buổi này.",
          code: "INVALID_ATTENDANCE_STATUS",
        },
        { status: 400 }
      );
    }

    // Check for duplicate request
    const existing = await prisma.makeUpRequest.findFirst({
      where: { studentId: student.id, missedScheduleId },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Đã có yêu cầu học bù cho buổi nghỉ này.",
          code: "DUPLICATE_REQUEST",
        },
        { status: 400 }
      );
    }

    // Create request
    const req = await prisma.makeUpRequest.create({
      data: {
        studentId: student.id,
        missedScheduleId,
        targetScheduleId,
        notes: notes || "",
        status: "PENDING",
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "CREATE_MAKEUP_REQUEST",
        entityType: "MakeUpRequest",
        entityId: req.id,
        details: JSON.stringify(body),
        source: "API"
      }
    });

    try {
      revalidatePath("/requests");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ data: req });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
