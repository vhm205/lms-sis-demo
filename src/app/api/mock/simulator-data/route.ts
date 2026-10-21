import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listAllEntitlements } from "@/lib/entitlement";

export async function GET() {
  try {
    const [orders, students, entitlements] = await Promise.all([
      prisma.order.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          course: { select: { id: true, code: true, name: true, duration: true } },
          student: { select: { id: true, code: true, name: true, phone: true } },
          facility: { select: { id: true, name: true } },
        },
      }),
      prisma.student.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          parent: { select: { id: true, name: true, phone: true } },
          facility: { select: { id: true, name: true } },
          classes: { select: { id: true, code: true, name: true } },
        },
      }),
      listAllEntitlements(100),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      students,
      entitlements,
      counts: {
        orders: orders.length,
        students: students.length,
        entitlements: entitlements.length,
      },
    });
  } catch (error: any) {
    console.error("[Simulator Data Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load simulator data" },
      { status: 500 }
    );
  }
}
