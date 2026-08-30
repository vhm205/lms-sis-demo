import { AppLayout } from "@/components/layout"
import { prisma } from "@/lib/prisma"
import { CoursesClient } from "./courses-client"

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { id: 'desc' }
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khóa học</h1>
          <p className="text-muted-foreground">Quản lý các chương trình đào tạo của trung tâm.</p>
        </div>
        
        <CoursesClient courses={courses} />
      </div>
    </AppLayout>
  )
}
