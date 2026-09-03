import { AppLayout } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { ClassesClient } from "./classes-client";
import { GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClassesPage() {
  const [classes, courses, facilities, teachers] = await Promise.all([
    prisma.class.findMany({
      include: { course: true, teacher: true, facility: true, students: true },
      orderBy: { id: 'desc' }
    }),
    prisma.course.findMany({ where: { status: 'ACTIVE' } }),
    prisma.facility.findMany(),
    prisma.user.findMany({ where: { role: 'TEACHER' } })
  ]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="clay-icon-tile h-8 w-8 bg-[#FFF0E6] text-[#D97736] dark:bg-[#352114] dark:text-[#FBAA78]">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[#D97736] dark:text-[#FBAA78] uppercase tracking-wider font-heading">Học vụ & Đào tạo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">Quản lý Lớp học</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Danh sách các lớp đang mở, sĩ số, giáo viên phụ trách và theo dõi sức chứa.
          </p>
        </div>
        
        <ClassesClient classes={classes} courses={courses} facilities={facilities} teachers={teachers} />
      </div>
    </AppLayout>
  );
}
