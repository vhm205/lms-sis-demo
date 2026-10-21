import { prisma } from "@/lib/prisma";
import { SalesHubClient } from "./sales-hub-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SalesHubPage() {
  const [leads, courses, facilities, orders, entitlements, activityLogs] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { updatedAt: "desc" },
      include: { course: true, facility: true },
    }),
    prisma.course.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
    prisma.facility.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { course: true, facility: true, student: true },
    }),
    prisma.entitlement.findMany({
      orderBy: { updatedAt: "desc" },
      include: { student: true, course: true },
    }),
    prisma.activityLog.findMany({
      where: {
        action: {
          in: [
            "DEAL_STAGE_UPDATED",
            "DEAL_OPPORTUNITY_CREATED",
            "WEBHOOK_BILLING_CONFIRMATION",
            "LMS_PROGRESS_RECORDED",
            "ENTITLEMENT_ISSUED",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <SalesHubClient
      initialLeads={leads}
      courses={courses}
      facilities={facilities}
      orders={orders}
      entitlements={entitlements}
      activityLogs={activityLogs}
    />
  );
}
