import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);

    const body = await request.json();
    const studentIdent =
      body.studentCode || body.studentId || body.code || body.id || body.studentName || body.name || body.student;
    let {
      missedScheduleId,
      targetScheduleId,
      notes,
      missedDate,
      targetDate,
      targetClassCode,
      targetClassName,
      targetClassId,
      className,
      classCode,
      classId,
      reason,
      content,
    } = body;

    const targetClassIdent =
      targetClassCode || targetClassName || targetClassId || className || classCode || classId || "";
    const effectiveNotes = notes || reason || content || "";

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
          parent: true,
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
          parent: true,
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

      if (!missedScheduleId) {
        const anySchedule = await prisma.schedule.findFirst({
          where: {
            class: {
              students: { some: { id: student.id } },
            },
          },
          orderBy: { date: "desc" },
        });
        if (anySchedule) missedScheduleId = anySchedule.id;
      }
    }

    // Auto-resolve targetScheduleId
    if (!targetScheduleId) {
      let targetClass = null;
      if (targetClassIdent) {
        targetClass = await prisma.class.findFirst({
          where: {
            OR: [
              { code: targetClassIdent },
              { id: targetClassIdent },
              { name: { contains: targetClassIdent } },
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
          include: { class: { include: { facility: true } }, room: true },
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

        if (!targetScheduleId && targetClassIdent) {
          const matchClassSch = upcomingSchedules.find(
            (s) => s.class?.name.includes(targetClassIdent) || s.class?.code.includes(targetClassIdent)
          );
          if (matchClassSch) targetScheduleId = matchClassSch.id;
        }

        if (!targetScheduleId && upcomingSchedules.length > 0) {
          targetScheduleId = upcomingSchedules[0].id;
        }
      }
    }

    if (!missedScheduleId || !targetScheduleId) {
      return NextResponse.json(
        { error: "Missing required fields: không xác định được missedScheduleId hoặc targetScheduleId. Vui lòng cung cấp ngày học bù (targetDate) hoặc mã lớp (targetClassCode)." },
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
            note: effectiveNotes || "Xin nghỉ phép và đăng ký học bù qua hệ thống",
          },
        });
      }
    } else if (attendance.status !== "ABSENT" && attendance.status !== "EXCUSED") {
      await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          status: "EXCUSED",
          note: effectiveNotes ? `${attendance.note || ""} (Đã xin phép bù: ${effectiveNotes})` : attendance.note,
        },
      });
    }

    // Check for duplicate request
    const existing = await prisma.makeUpRequest.findFirst({
      where: { studentId: student.id, missedScheduleId },
      include: {
        student: true,
        missedSchedule: { include: { class: true } },
        targetSchedule: { include: { class: { include: { facility: true } }, room: true } },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        isDuplicate: true,
        requestId: existing.id,
        status: existing.status,
        studentName: student.name,
        studentCode: student.code,
        targetClass: existing.targetSchedule?.class?.name,
        targetFacility: existing.targetSchedule?.class?.facility?.name,
        targetDate: existing.targetSchedule?.date,
        targetRoom: existing.targetSchedule?.room?.name,
        message: `Yêu cầu học bù cho học viên ${student.name} (${student.code}) đã được tạo trước đó trên hệ thống (Mã: ${existing.id}, Trạng thái: ${existing.status}).`,
      });
    }

    // Create request
    const req = await prisma.makeUpRequest.create({
      data: {
        studentId: student.id,
        missedScheduleId,
        targetScheduleId,
        notes: effectiveNotes,
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
        source: auth.role === "ADMIN" ? "ADMIN_API" : auth.isParent ? "PARENT_PORTAL" : "AI_AGENT"
      }
    });

    try {
      revalidatePath("/requests");
      revalidatePath("/schedule");
      revalidatePath("/");
    } catch {
      // ignore
    }

    const targetSchedule = await prisma.schedule.findUnique({
      where: { id: targetScheduleId },
      include: { class: { include: { facility: true } }, room: true },
    });

    return NextResponse.json({
      success: true,
      data: req,
      requestId: req.id,
      status: req.status,
      studentName: student.name,
      studentCode: student.code,
      targetClass: targetSchedule?.class?.name,
      targetFacility: targetSchedule?.class?.facility?.name,
      targetDate: targetSchedule?.date,
      targetRoom: targetSchedule?.room?.name,
      message: `Đã tạo yêu cầu học bù thành công cho học viên ${student.name} (${student.code}) vào ${targetSchedule?.class?.name || "lớp học bù mục tiêu"}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
