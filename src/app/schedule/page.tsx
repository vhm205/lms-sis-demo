import { AppLayout } from "@/components/layout"
import { prisma } from "@/lib/prisma"
import { ScheduleClient } from "./schedule-client"

export default async function SchedulePage() {
  const [schedules, classes, rooms, teachers] = await Promise.all([
    prisma.schedule.findMany({
      include: { 
        class: { include: { students: true, teacher: true } }, 
        room: true, 
        attendances: true 
      },
      orderBy: { date: 'asc' }
    }),
    prisma.class.findMany({ where: { status: 'ONGOING' } }),
    prisma.room.findMany(),
    prisma.user.findMany({ where: { role: 'TEACHER' } })
  ]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch học & Điểm danh</h1>
          <p className="text-muted-foreground">Quản lý lịch học, xếp phòng và điểm danh học viên.</p>
        </div>
        
        <ScheduleClient schedules={schedules} classes={classes} rooms={rooms} teachers={teachers} />
      </div>
    </AppLayout>
  )
}
