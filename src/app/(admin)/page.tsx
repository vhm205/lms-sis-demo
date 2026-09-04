import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [
    students,
    classes,
    leads,
    supportRequests,
    makeUpRequests,
    orders,
    schedules
  ] = await Promise.all([
    prisma.student.findMany({
      include: { facility: true }
    }),
    prisma.class.findMany({
      include: { course: true, teacher: true, facility: true, students: true }
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      include: { course: true, facility: true }
    }),
    prisma.supportRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: { facility: true }
        }
      }
    }),
    prisma.makeUpRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: { facility: true }
        }
      }
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { course: true, facility: true }
    }),
    prisma.schedule.findMany({
      orderBy: { date: 'asc' },
      include: {
        class: {
          include: { teacher: true, students: true, facility: true }
        },
        room: {
          include: { facility: true }
        },
        attendances: true
      }
    })
  ]);

  return (
    <DashboardClient
      students={students}
      classes={classes}
      leads={leads}
      supportRequests={supportRequests}
      makeUpRequests={makeUpRequests}
      orders={orders}
      schedules={schedules}
    />
  );
}
