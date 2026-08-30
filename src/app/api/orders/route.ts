import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const orders = await prisma.order.findMany({
      include: { course: true, facility: true }
    });
    return NextResponse.json({ data: orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parentName, parentPhone, courseId, facilityId, amount, notes } = body;

    if (!parentName || !parentPhone || !courseId || !facilityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const code = `ORD-${Date.now().toString().slice(-6)}`;
    const order = await prisma.order.create({
      data: {
        code,
        parentName,
        parentPhone,
        courseId,
        facilityId,
        amount: parseFloat(amount) || 0,
        notes: notes || "",
        status: "PENDING"
      }
    });

    await prisma.activityLog.create({
      data: {
        action: "CREATE_ORDER",
        entityType: "Order",
        entityId: order.id,
        details: JSON.stringify(body),
        source: "API"
      }
    });

    return NextResponse.json({ data: order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
