import { NextResponse } from "next/server";
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
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (facilityId) whereClause.facilityId = facilityId;
    if (status) whereClause.status = status;

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
    let { parentName, parentPhone, courseId, facilityId, amount, notes, studentId } = body;

    // If parent is authenticated, bind their info
    if (auth.isParent && auth.parent) {
      parentName = auth.parent.name;
      parentPhone = auth.parent.phone;
    }

    if (!parentName || !parentPhone || !courseId || !facilityId) {
      return NextResponse.json({ error: "Missing required fields (parentName, parentPhone, courseId, facilityId)" }, { status: 400 });
    }

    const code = `ORD-${Date.now().toString().slice(-6)}`;
    const order = await prisma.order.create({
      data: {
        code,
        studentId: studentId || null,
        parentName,
        parentPhone,
        courseId,
        facilityId,
        amount: parseFloat(amount) || 0,
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

    return NextResponse.json({ data: order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
