import { prisma } from "@/lib/prisma";

export interface IssueEntitlementParams {
  studentId: string;
  courseId: string;
  orderId?: string;
  type?: "TRIAL" | "OFFICIAL" | "RENEWAL";
  durationDays?: number;
  source?: string;
  notes?: string;
}

/**
 * Issues or updates an entitlement for a student and course
 */
export async function issueEntitlement(params: IssueEntitlementParams) {
  const {
    studentId,
    courseId,
    orderId,
    type = "OFFICIAL",
    durationDays = type === "TRIAL" ? 7 : 90,
    source = "BILLING_MOCK",
    notes,
  } = params;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // Check if an existing ACTIVE entitlement exists for this student and course
  const existing = await prisma.entitlement.findFirst({
    where: {
      studentId,
      courseId,
      status: "ACTIVE",
    },
  });

  if (existing) {
    // If renewing or upgrading from TRIAL
    const newExpiresAt =
      existing.expiresAt > now
        ? new Date(existing.expiresAt.getTime() + durationDays * 24 * 60 * 60 * 1000)
        : expiresAt;

    const updated = await prisma.entitlement.update({
      where: { id: existing.id },
      data: {
        type,
        status: "ACTIVE",
        expiresAt: newExpiresAt,
        orderId: orderId || existing.orderId,
        source,
        notes: notes ? `${existing.notes || ""} | ${notes}` : existing.notes,
      },
      include: {
        student: true,
        course: true,
        order: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "ENTITLEMENT_RENEWED",
        entityType: "Entitlement",
        entityId: updated.id,
        details: JSON.stringify({
          studentId,
          courseId,
          type,
          newExpiresAt,
          source,
        }),
        source: "SYSTEM",
      },
    });

    return updated;
  }

  // Create new Entitlement
  const entitlement = await prisma.entitlement.create({
    data: {
      studentId,
      courseId,
      orderId,
      type,
      status: "ACTIVE",
      startsAt: now,
      expiresAt,
      source,
      notes,
    },
    include: {
      student: true,
      course: true,
      order: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "ENTITLEMENT_ISSUED",
      entityType: "Entitlement",
      entityId: entitlement.id,
      details: JSON.stringify({
        studentId,
        courseId,
        type,
        expiresAt,
        source,
      }),
      source: "SYSTEM",
    },
  });

  return entitlement;
}

/**
 * Get all entitlements for a specific student with remaining days computation
 */
export async function getStudentEntitlements(studentId: string) {
  const entitlements = await prisma.entitlement.findMany({
    where: { studentId },
    include: {
      course: true,
      order: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  return entitlements.map((ent) => {
    const diffMs = new Date(ent.expiresAt).getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const isExpired = ent.status === "EXPIRED" || diffMs <= 0;
    const isExpiringSoon = !isExpired && daysRemaining <= 7;

    return {
      ...ent,
      daysRemaining,
      isExpired,
      isExpiringSoon,
    };
  });
}

/**
 * Get all entitlements for simulator admin table
 */
export async function listAllEntitlements(limit: number = 50) {
  const entitlements = await prisma.entitlement.findMany({
    take: limit,
    include: {
      student: true,
      course: true,
      order: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const now = new Date();

  return entitlements.map((ent) => {
    const diffMs = new Date(ent.expiresAt).getTime() - now.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const isExpired = ent.status === "EXPIRED" || diffMs <= 0;
    const isExpiringSoon = !isExpired && daysRemaining <= 7;

    return {
      ...ent,
      daysRemaining,
      isExpired,
      isExpiringSoon,
    };
  });
}

/**
 * Force expire an entitlement (simulator action)
 */
export async function forceExpireEntitlement(id: string) {
  const updated = await prisma.entitlement.update({
    where: { id },
    data: {
      status: "EXPIRED",
      expiresAt: new Date(),
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "ENTITLEMENT_EXPIRED_MANUAL",
      entityType: "Entitlement",
      entityId: id,
      details: JSON.stringify({ expiredAt: new Date().toISOString() }),
      source: "UI",
    },
  });

  return updated;
}

/**
 * Renew an entitlement by adding days
 */
export async function renewEntitlement(id: string, additionalDays: number = 30) {
  const existing = await prisma.entitlement.findUnique({ where: { id } });
  if (!existing) throw new Error("Entitlement not found");

  const now = new Date();
  const baseTime = existing.expiresAt > now ? existing.expiresAt.getTime() : now.getTime();
  const newExpiresAt = new Date(baseTime + additionalDays * 24 * 60 * 60 * 1000);

  const updated = await prisma.entitlement.update({
    where: { id },
    data: {
      status: "ACTIVE",
      type: "RENEWAL",
      expiresAt: newExpiresAt,
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "ENTITLEMENT_RENEWED",
      entityType: "Entitlement",
      entityId: id,
      details: JSON.stringify({ additionalDays, newExpiresAt }),
      source: "UI",
    },
  });

  return updated;
}
