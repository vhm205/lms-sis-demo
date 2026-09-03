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
    const studentIdent =
      body.studentCode || body.studentId || body.code || body.id || body.studentName || body.name;
    let { missedScheduleId, targetScheduleId, notes, missedDate, targetDate, targetClassCode } = body;

    let student = null;
    if (studentIdent) {
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { code: studentIdent },
            { id: studentIdent },
            { name: { contains: studentIdent } },
          ],
        },
        include: {
          classes: {
            include: {
              schedules: { orderBy: { date: "desc" } },
            },
          },
          attendances: {
            include: { schedule: true },
            orderBy: { schedule: { date: "desc" } },
          },
        },
      });
    }

    if (!student && auth.isParent && auth.parent) {
      student = await prisma.student.findFirst({
        where: { parentId: auth.parent.id },
        include: {
          classes: {
            include: {
              schedules: { orderBy: { date: "desc" } },
            },
          },
          attendances: {
            include: { schedule: true },
            orderBy: { schedule: { date: "desc" } },
          },
        },
      });
    }

    if (!student) {
      return NextResponse.json(
        { error: `Không tìm thấy học viên với thông tin: ${studentIdent || "chưa cung cấp"}`, code: "STUDENT_NOT_FOUND" },
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

    // Auto-resolve missedScheduleId
    if (!missedScheduleId) {
      if (missedDate) {
        const matchAtt = student.attendances.find((a) => {
          const aDate = a.schedule?.date?.toISOString().slice(0, 10) || "";
          return aDate.includes(missedDate) || missedDate.includes(aDate);
        });
        if (matchAtt) {
          missedScheduleId = matchAtt.scheduleId;
        } else {
          for (const cls of student.classes) {
            const matchSch = cls.schedules.find((s) => {
              const sDate = s.date.toISOString().slice(0, 10);
              return sDate.includes(missedDate) || missedDate.includes(sDate);
            });
            if (matchSch) {
              missedScheduleId = matchSch.id;
              break;
            }
          }
        }
      }

      if (!missedScheduleId) {
        const absentAtt = student.attendances.find(
          (a) => a.status === "ABSENT" || a.status === "EXCUSED"
        );
        if (absentAtt) missedScheduleId = absentAtt.scheduleId;
      }

      if (!missedScheduleId) {
        for (const cls of student.classes) {
          if (cls.schedules.length > 0) {
            missedScheduleId = cls.schedules[0].id;
            break;
          }
        }
      }
    }

    // Auto-resolve targetScheduleId
    if (!targetScheduleId) {
      let targetClass = null;
      if (targetClassCode) {
        targetClass = await prisma.class.findFirst({
          where: {
            OR: [
              { code: targetClassCode },
              { id: targetClassCode },
              { name: { contains: targetClassCode } },
            ],
          },
          include: { schedules: { orderBy: { date: "asc" } } },
        });
      }

      if (targetClass && targetClass.schedules.length > 0) {
        if (targetDate) {
          const matchSch = targetClass.schedules.find((s) => {
            const sDate = s.date.toISOString().slice(0, 10);
            return sDate.includes(targetDate) || targetDate.includes(sDate);
          });
          if (matchSch) targetScheduleId = matchSch.id;
        }
        if (!targetScheduleId) {
          const slot = targetClass.schedules.find((s) => s.status === "SCHEDULED") || targetClass.schedules[0];
          targetScheduleId = slot.id;
        }
      } else {
        const upcomingSchedules = await prisma.schedule.findMany({
          where: { status: "SCHEDULED" },
          include: { class: true },
          orderBy: { date: "asc" },
          take: 20,
        });

        if (targetDate) {
          const matchSch = upcomingSchedules.find((s) => {
            const sDate = s.date.toISOString().slice(0, 10);
            return sDate.includes(targetDate) || targetDate.includes(sDate);
          });
          if (matchSch) targetScheduleId = matchSch.id;
        }

        if (!targetScheduleId && upcomingSchedules.length > 0) {
          targetScheduleId = upcomingSchedules[0].id;
        }
      }
    }

    if (!missedScheduleId || !targetScheduleId) {
      return NextResponse.json(
        { error: "Missing required fields: không xác định được missedScheduleId hoặc targetScheduleId" },
        { status: 400 }
      );
    }

    // Check attendance status & auto-record EXCUSED if needed
    const attendance = await prisma.attendance.findUnique({
      where: { scheduleId_studentId: { scheduleId: missedScheduleId, studentId: student.id } },
    });

    if (!attendance) {
      const missedSchedule = await prisma.schedule.findUnique({
        where: { id: missedScheduleId },
        select: { id: true, classId: true },
      });
      const classId = missedSchedule?.classId || student.classes[0]?.id || "";
      if (classId) {
        await prisma.attendance.create({
          data: {
            scheduleId: missedScheduleId,
            studentId: student.id,
            classId,
            status: "EXCUSED",
            note: notes || "Xin nghỉ phép và đăng ký học bù qua hệ thống",
          },
        });
      }
    } else if (attendance.status !== "ABSENT" && attendance.status !== "EXCUSED") {
      await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          status: "EXCUSED",
          note: notes ? `${attendance.note || ""} (Đã xin phép bù: ${notes})` : attendance.note,
        },
      });
    }

    // Check for duplicate request
    const existing = await prisma.makeUpRequest.findFirst({
      where: { studentId: student.id, missedScheduleId },
    });

    if (existing) {
      return NextResponse.json({
        data: existing,
        isDuplicate: true,
        message: `Đã có yêu cầu học bù cho buổi nghỉ này (Mã: ${existing.id}, Trạng thái: ${existing.status}).`,
      });
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
        details: JSON.stringify({ ...body, resolvedMissedScheduleId: missedScheduleId, resolvedTargetScheduleId: targetScheduleId }),
        source: "API"
      }
    });

    try {
      revalidatePath("/requests");
      revalidatePath("/schedule");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ data: req });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
