import { AppLayout } from "@/components/layout"
import { prisma } from "@/lib/prisma"
import { StudentsClient } from "./students-client"

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      parent: true,
      facility: true,
      classes: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  
  const facilities = await prisma.facility.findMany();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Học viên</h1>
          <p className="text-muted-foreground">Danh sách học viên của trung tâm và thao tác quản lý.</p>
        </div>
        
        <StudentsClient students={students} facilities={facilities} />
      </div>
    </AppLayout>
  )
}
