import { prisma } from "@/lib/prisma";
import { BillingClient } from "./billing-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BillingPage() {
  const [orders, courses, facilities, activityLogs] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        course: true,
        facility: true,
        student: {
          include: { parent: true },
        },
        entitlements: true,
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
          in: [
            "WEBHOOK_BILLING_CONFIRMATION",
            "WEBHOOK_BILLING_AMOUNT_MISMATCH",
            "WEBHOOK_BILLING_PAYMENT_FAILED",
            "BILLING_INVOICE_CREATED",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  return (
    <BillingClient
      initialOrders={orders}
      courses={courses}
      facilities={facilities}
      activityLogs={activityLogs}
    />
  );
}
