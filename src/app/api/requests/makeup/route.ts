import { NextResponse } from "next/server";
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
    const { studentId, missedScheduleId, targetScheduleId, notes } = body;

    if (!studentId || !missedScheduleId || !targetScheduleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (auth.isParent && auth.parent) {
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student || student.parentId !== auth.parent.id) {
        return NextResponse.json({
          error: "Forbidden: Bạn không có quyền gửi yêu cầu cho học sinh này.",
          code: "FORBIDDEN_PARENT_ACCESS"
        }, { status: 403 });
      }
    }

    // Check attendance status
    const attendance = await prisma.attendance.findUnique({
      where: { scheduleId_studentId: { scheduleId: missedScheduleId, studentId } }
    });

    if (!attendance || (attendance.status !== 'ABSENT' && attendance.status !== 'EXCUSED')) {
      return NextResponse.json({ 
        error: "Không đủ điều kiện học bù. Học viên không vắng mặt buổi này.",
        code: "INVALID_ATTENDANCE_STATUS"
      }, { status: 400 });
    }

    // Check for duplicate request
    const existing = await prisma.makeUpRequest.findFirst({
      where: { studentId, missedScheduleId }
    });

    if (existing) {
      return NextResponse.json({ 
        error: "Đã có yêu cầu học bù cho buổi nghỉ này.",
        code: "DUPLICATE_REQUEST"
      }, { status: 400 });
    }

    // Create request
    const req = await prisma.makeUpRequest.create({
      data: {
        studentId,
        missedScheduleId,
        targetScheduleId,
        notes: notes || "",
        status: "PENDING"
      }
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

    return NextResponse.json({ data: req });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
