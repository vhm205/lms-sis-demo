import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() || "";

  if (!query) {
    return NextResponse.json({
      students: [],
      classes: [],
      courses: [],
      leads: [],
      orders: [],
    });
  }

  try {
    const auth = await getAuthContext(request);

    // Build scoped queries based on role
    const studentWhere: any = {
      OR: [
        { name: { contains: query } },
        { code: { contains: query } },
        { phone: { contains: query } },
        { parent: { name: { contains: query } } },
        { parent: { phone: { contains: query } } },
      ],
    };

    if (auth.isParent && auth.parent) {
      studentWhere.parentId = auth.parent.id;
    }

    const orderWhere: any = {
      OR: [
        { code: { contains: query } },
        { parentName: { contains: query } },
        { parentPhone: { contains: query } },
      ],
    };

    if (auth.isParent && auth.parent) {
      orderWhere.parentPhone = auth.parent.phone;
    }

    const [students, classes, courses, leads, orders] = await Promise.all([
      // 1. Search Students (Only for Admin or Parent with scoped child)
      auth.role !== "ANONYMOUS"
        ? prisma.student.findMany({
            where: studentWhere,
            include: {
              facility: true,
              parent: true,
              classes: true,
            },
            take: 6,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),

      // 2. Search Classes (Public/All)
      prisma.class.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { code: { contains: query } },
          ],
        },
        include: {
          course: true,
          facility: true,
          teacher: true,
          students: true,
        },
        take: 6,
      }),

      // 3. Search Courses (Public/All)
      prisma.course.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { code: { contains: query } },
            { type: { contains: query } },
          ],
        },
        take: 6,
      }),

      // 4. Search Leads (Only Admin)
      auth.isAdmin
        ? prisma.lead.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { phone: { contains: query } },
              ],
            },
            include: {
              course: true,
              facility: true,
            },
            take: 6,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),

      // 5. Search Orders (Admin: all, Parent: own orders, Anon: empty)
      auth.role !== "ANONYMOUS"
        ? prisma.order.findMany({
            where: orderWhere,
            include: {
              course: true,
              facility: true,
            },
            take: 6,
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        code: s.code,
        phone: s.phone,
        parentName: s.parent?.name,
        parentPhone: s.parent?.phone,
        facilityName: s.facility?.name,
        status: s.status,
        classes: s.classes.map((c) => c.code),
      })),
      classes: classes.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        courseName: c.course?.name,
        teacherName: c.teacher?.name,
        facilityName: c.facility?.name,
        capacity: c.capacity,
        studentCount: c.students.length,
      })),
      courses: courses.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        type: c.type,
        duration: c.duration,
        fee: c.fee,
      })),
      leads: leads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        courseName: l.course?.name,
        facilityName: l.facility?.name,
        status: l.status,
      })),
      orders: orders.map((o) => ({
        id: o.id,
        code: o.code,
        parentName: o.parentName,
        parentPhone: o.parentPhone,
        courseName: o.course?.name,
        facilityName: o.facility?.name,
        amount: o.amount,
        status: o.status,
      })),
    });
  } catch (error: any) {
    console.error("Global search error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
