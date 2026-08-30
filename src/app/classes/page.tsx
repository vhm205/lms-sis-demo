import { AppLayout } from "@/components/layout"
import { prisma } from "@/lib/prisma"
import { ClassesClient } from "./classes-client"

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
          <h1 className="text-3xl font-bold tracking-tight">Lớp học</h1>
          <p className="text-muted-foreground">Danh sách các lớp đang mở tại trung tâm.</p>
        </div>
        
        <ClassesClient classes={classes} courses={courses} facilities={facilities} teachers={teachers} />
      </div>
    </AppLayout>
  )
}
