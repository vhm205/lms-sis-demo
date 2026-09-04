import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthContext } from "@/lib/auth";

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (
    searchParams.get("q") ||
    searchParams.get("query") ||
    searchParams.get("keyword") ||
    searchParams.get("search") ||
    ""
  ).trim();

  if (!query) {
    return NextResponse.json({
      students: [],
      classes: [],
      courses: [],
      schedules: [],
      leads: [],
      orders: [],
    });
  }

  try {
    const auth = await getAuthContext(request);
    const normQ = removeDiacritics(query);

    // Scoped where conditions if authenticated as parent
    const studentWhere = auth.isParent && auth.parent ? { parentId: auth.parent.id } : undefined;
    const orderWhere = auth.isParent && auth.parent ? { parentPhone: auth.parent.phone } : undefined;

    const [allStudents, allClasses, allCourses, allSchedules, allLeads, allOrders] = await Promise.all([
      // 1. Search Students
      prisma.student.findMany({
        where: studentWhere,
        include: {
          facility: true,
          parent: true,
          classes: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      // 2. Search Classes
      prisma.class.findMany({
        include: {
          course: true,
          facility: true,
          teacher: true,
          students: true,
        },
        orderBy: { name: "asc" },
      }),

      // 3. Search Courses
      prisma.course.findMany({
        orderBy: { name: "asc" },
      }),

      // 4. Search Schedules
      prisma.schedule.findMany({
        include: {
          class: {
            include: {
              course: true,
              facility: true,
              teacher: true,
              students: true,
            },
          },
          room: {
            include: {
              facility: true,
            },
          },
          attendances: true,
        },
        orderBy: { date: "asc" },
      }),

      // 5. Search Leads (Only non-parent)
      !auth.isParent
        ? prisma.lead.findMany({
            include: {
              course: true,
              facility: true,
            },
            orderBy: { createdAt: "desc" },
          })
        : Promise.resolve([]),

      // 6. Search Orders
      prisma.order.findMany({
        where: orderWhere,
        include: {
          course: true,
          facility: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // In-memory accent-insensitive and case-insensitive matching
    const filteredStudents = allStudents.filter((s) => {
      const name = removeDiacritics(s.name);
      const code = removeDiacritics(s.code);
      const phone = s.phone ? removeDiacritics(s.phone) : "";
      const parentName = s.parent?.name ? removeDiacritics(s.parent.name) : "";
      const parentPhone = s.parent?.phone ? removeDiacritics(s.parent.phone) : "";
      const facility = s.facility?.name ? removeDiacritics(s.facility.name) : "";
      const classNames = s.classes.map((c) => removeDiacritics(c.name + " " + c.code)).join(" ");

      return (
        name.includes(normQ) ||
        code.includes(normQ) ||
        phone.includes(normQ) ||
        parentName.includes(normQ) ||
        parentPhone.includes(normQ) ||
        facility.includes(normQ) ||
        classNames.includes(normQ)
      );
    }).slice(0, 6);

    const filteredClasses = allClasses.filter((c) => {
      const name = removeDiacritics(c.name);
      const code = removeDiacritics(c.code);
      const course = c.course?.name ? removeDiacritics(c.course.name) : "";
      const teacher = c.teacher?.name ? removeDiacritics(c.teacher.name) : "";
      const facility = c.facility?.name ? removeDiacritics(c.facility.name) : "";

      return (
        name.includes(normQ) ||
        code.includes(normQ) ||
        course.includes(normQ) ||
        teacher.includes(normQ) ||
        facility.includes(normQ)
      );
    }).slice(0, 6);

    const filteredCourses = allCourses.filter((c) => {
      const name = removeDiacritics(c.name);
      const code = removeDiacritics(c.code);
      const type = c.type ? removeDiacritics(c.type) : "";

      return (
        name.includes(normQ) ||
        code.includes(normQ) ||
        type.includes(normQ)
      );
    }).slice(0, 6);

    const filteredSchedules = allSchedules.filter((sc) => {
      // Scope to child's class if parent
      if (auth.isParent && auth.parent) {
        const hasChildInClass = sc.class.students.some((st) => st.parentId === auth.parent?.id);
        if (!hasChildInClass) return false;
      }

      const className = removeDiacritics(sc.class.name);
      const classCode = removeDiacritics(sc.class.code);
      const courseName = sc.class.course?.name ? removeDiacritics(sc.class.course.name) : "";
      const teacherName = sc.class.teacher?.name ? removeDiacritics(sc.class.teacher.name) : "";
      const roomName = removeDiacritics(sc.room.name);
      const facilityName = removeDiacritics(sc.class.facility?.name || sc.room.facility?.name || "");
      const students = sc.class.students.map((st) => removeDiacritics(st.name + " " + st.code)).join(" ");

      const dateObj = new Date(sc.date);
      const dateVi = removeDiacritics(
        dateObj.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" })
      );
      const timeVi = removeDiacritics(
        dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      );

      return (
        className.includes(normQ) ||
        classCode.includes(normQ) ||
        courseName.includes(normQ) ||
        teacherName.includes(normQ) ||
        roomName.includes(normQ) ||
        facilityName.includes(normQ) ||
        students.includes(normQ) ||
        dateVi.includes(normQ) ||
        timeVi.includes(normQ)
      );
    }).slice(0, 6);

    const filteredLeads = allLeads.filter((l) => {
      const name = removeDiacritics(l.name);
      const phone = removeDiacritics(l.phone);
      const course = l.course?.name ? removeDiacritics(l.course.name) : "";
      const facility = l.facility?.name ? removeDiacritics(l.facility.name) : "";

      return (
        name.includes(normQ) ||
        phone.includes(normQ) ||
        course.includes(normQ) ||
        facility.includes(normQ)
      );
    }).slice(0, 6);

    const filteredOrders = allOrders.filter((o) => {
      const code = removeDiacritics(o.code);
      const parentName = removeDiacritics(o.parentName);
      const parentPhone = removeDiacritics(o.parentPhone);
      const course = o.course?.name ? removeDiacritics(o.course.name) : "";
      const facility = o.facility?.name ? removeDiacritics(o.facility.name) : "";

      return (
        code.includes(normQ) ||
        parentName.includes(normQ) ||
        parentPhone.includes(normQ) ||
        course.includes(normQ) ||
        facility.includes(normQ)
      );
    }).slice(0, 6);

    return NextResponse.json({
      students: filteredStudents.map((s) => ({
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
      classes: filteredClasses.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        courseName: c.course?.name,
        teacherName: c.teacher?.name,
        facilityName: c.facility?.name,
        capacity: c.capacity,
        studentCount: c.students.length,
      })),
      courses: filteredCourses.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        type: c.type,
        duration: c.duration,
        fee: c.fee,
      })),
      schedules: filteredSchedules.map((sc) => ({
        id: sc.id,
        classId: sc.classId,
        className: sc.class.name,
        classCode: sc.class.code,
        courseName: sc.class.course?.name,
        teacherName: sc.class.teacher?.name,
        roomName: sc.room.name,
        facilityName: sc.class.facility?.name || sc.room.facility?.name,
        date: sc.date.toISOString(),
        duration: sc.duration,
        status: sc.status,
        studentCount: sc.class.students.length,
      })),
      leads: filteredLeads.map((l) => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        courseName: l.course?.name,
        facilityName: l.facility?.name,
        status: l.status,
      })),
      orders: filteredOrders.map((o) => ({
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
