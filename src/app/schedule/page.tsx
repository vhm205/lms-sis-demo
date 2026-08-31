import { AppLayout } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { ScheduleClient } from "./schedule-client";
import { CalendarDays } from "lucide-react";

export default async function SchedulePage() {
  const [schedules, classes, rooms, teachers] = await Promise.all([
    prisma.schedule.findMany({
      include: { 
        class: { include: { students: true, teacher: true, facility: true } }, 
        room: { include: { facility: true } }, 
        attendances: true 
      },
      orderBy: { date: 'asc' }
    }),
    prisma.class.findMany({ where: { status: 'ONGOING' }, include: { facility: true } }),
    prisma.room.findMany({ include: { facility: true } }),
    prisma.user.findMany({ where: { role: 'TEACHER' } })
  ]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="clay-icon-tile h-8 w-8 bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78]">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[#D97736] dark:text-[#FBAA78] uppercase tracking-wider font-heading">Học vụ & Đào tạo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">Lịch học & Điểm danh</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Quản lý xếp lịch học, phòng học, phân công giáo viên và thao tác điểm danh nhanh.
          </p>
        </div>
        
        <ScheduleClient schedules={schedules} classes={classes} rooms={rooms} teachers={teachers} />
      </div>
    </AppLayout>
  );
}
