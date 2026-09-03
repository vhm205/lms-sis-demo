import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await getAuthContext(request);

    if (auth.role === "ANONYMOUS") {
      return NextResponse.json(
        {
          error: "Unauthorized: Yêu cầu quyền Quản trị viên (Admin API Key) hoặc Đăng nhập Phụ huynh để xem đơn hàng.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityIdent =
      searchParams.get("facilityName") ||
      searchParams.get("facilityCode") ||
      searchParams.get("facilityId") ||
      searchParams.get("facility");
    const courseIdent =
      searchParams.get("courseCode") ||
      searchParams.get("code") ||
      searchParams.get("courseId");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (facilityIdent) {
      const facility = await prisma.facility.findFirst({
        where: { OR: [{ id: facilityIdent }, { name: { contains: facilityIdent } }] },
      });
      if (facility) whereClause.facilityId = facility.id;
    }
    if (courseIdent) {
      const course = await prisma.course.findFirst({
        where: { OR: [{ code: courseIdent }, { id: courseIdent }, { name: { contains: courseIdent } }] },
      });
      if (course) whereClause.courseId = course.id;
    }
    if (status && status !== "ALL") whereClause.status = status;

    if (auth.isParent && auth.parent) {
      const childIds = auth.parent.students.map((s) => s.id);
      whereClause.OR = [
        { parentPhone: auth.parent.phone },
        { studentId: { in: childIds } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: { course: true, facility: true, student: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      role: auth.role,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthContext(request);
    const body = await request.json();
    let { parentName, parentPhone, amount, notes } = body;
    const courseIdent = body.courseCode || body.courseId || body.code;
    const facilityIdent = body.facilityName || body.facilityCode || body.facilityId || body.facility;
    const studentIdent = body.studentCode || body.studentId;

    // If parent is authenticated, bind their info
    if (auth.isParent && auth.parent) {
      parentName = auth.parent.name;
      parentPhone = auth.parent.phone;
    }

    if (!courseIdent) {
      return NextResponse.json(
        { error: "Missing required field 'courseCode' (hoặc 'courseId')", code: "MISSING_COURSE" },
        { status: 400 }
      );
    }

    // Resolve course by code, ID, or name
    const course = await prisma.course.findFirst({
      where: { OR: [{ code: courseIdent }, { id: courseIdent }, { name: { contains: courseIdent } }] },
    });
    if (!course) {
      return NextResponse.json(
        { error: `Khóa học không tìm thấy với mã/ID: ${courseIdent}`, code: "COURSE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Resolve facility by code, ID, or name
    let facility = null;
    if (facilityIdent) {
      facility = await prisma.facility.findFirst({
        where: { OR: [{ id: facilityIdent }, { name: { contains: facilityIdent } }] },
      });
    }
    if (!facility) {
      facility = await prisma.facility.findFirst();
    }
    if (!facility) {
      return NextResponse.json(
        { error: "Không tìm thấy cơ sở học phù hợp", code: "FACILITY_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Resolve student if studentCode or studentId provided
    let resolvedStudentId = null;
    if (studentIdent) {
      const student = await prisma.student.findFirst({
        where: { OR: [{ code: studentIdent }, { id: studentIdent }] },
      });
      if (student) resolvedStudentId = student.id;
    }

    if (!parentName) parentName = "Phụ huynh (Đăng ký trực tuyến)";
    if (!parentPhone) parentPhone = "0900000000";

    const parsedAmount = typeof amount === "number" ? amount : parseFloat(String(amount)) || course.fee || 0;
    const code = `ORD-${Date.now().toString().slice(-6)}`;
    const order = await prisma.order.create({
      data: {
        code,
        studentId: resolvedStudentId,
        parentName,
        parentPhone,
        courseId: course.id,
        facilityId: facility.id,
        amount: parsedAmount,
        notes: notes || "",
        status: "PENDING",
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE_ORDER",
        entityType: "Order",
        entityId: order.id,
        details: JSON.stringify(body),
        source: auth.role === "ADMIN" ? "API_ADMIN" : auth.isParent ? "API_PARENT" : "API_PUBLIC",
      },
    });

    try {
      revalidatePath("/orders");
      revalidatePath("/");
    } catch {
      // ignore
    }

    return NextResponse.json({ data: order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
