import { prisma } from "@/lib/prisma";
import { RequestsClient } from "./requests-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RequestsPage() {
  const [supportRequests, makeUpRequests, users, students, upcomingSchedules] = await Promise.all([
    prisma.supportRequest.findMany({
      include: {
        student: {
          include: { facility: true, parent: true }
        },
        assignee: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.makeUpRequest.findMany({
      include: {
        student: {
          include: { facility: true, parent: true }
        },
        missedSchedule: {
          include: {
            class: true,
            room: true
          }
        },
        targetSchedule: {
          include: {
            class: true,
            room: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findMany({
      select: { id: true, name: true, role: true, email: true, facilityId: true },
      orderBy: { name: 'asc' }
    }),
    prisma.student.findMany({
      where: { status: 'ACTIVE' },
      include: {
        facility: true,
        parent: true,
        classes: {
          include: {
            schedules: {
              orderBy: { date: 'desc' },
              take: 10,
              include: { class: true, room: true }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.schedule.findMany({
      where: {
        date: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      },
      include: {
        class: true,
        room: true
      },
      orderBy: { date: 'asc' },
      take: 60
    })
  ]);

  return (
    <RequestsClient 
      supportRequests={supportRequests} 
      makeUpRequests={makeUpRequests}
      users={users}
      students={students}
      upcomingSchedules={upcomingSchedules}
    />
  );
}
