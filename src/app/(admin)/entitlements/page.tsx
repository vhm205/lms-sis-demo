import { prisma } from "@/lib/prisma";
import { EntitlementsClient } from "./entitlements-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EntitlementsPage() {
  const [entitlements, students, courses, facilities, activityLogs] = await Promise.all([
    prisma.entitlement.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        student: {
          include: {
            facility: true,
            parent: true,
            assignments: {
              orderBy: { date: "desc" },
              take: 5,
            },
          },
        },
        course: true,
        order: true,
      },
    }),
    prisma.student.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        facility: true,
        parent: true,
        entitlements: {
          include: { course: true },
        },
      },
    }),
    prisma.course.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
    prisma.facility.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.activityLog.findMany({
      where: {
        action: {
          in: ["LMS_PROGRESS_RECORDED", "ENTITLEMENT_ISSUED", "ENTITLEMENT_RENEWED", "ENTITLEMENT_EXPIRED_MANUAL"],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  return (
    <EntitlementsClient
      initialEntitlements={entitlements}
      students={students}
      courses={courses}
      facilities={facilities}
      activityLogs={activityLogs}
    />
  );
}
