import { AppLayout } from "@/components/layout"
import { prisma } from "@/lib/prisma"
import { LeadsClient } from "./leads-client"

export default async function LeadsPage() {
  const [leads, courses, facilities] = await Promise.all([
    prisma.lead.findMany({
      include: { course: true, facility: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.course.findMany(),
    prisma.facility.findMany()
  ]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khách hàng tiềm năng</h1>
          <p className="text-muted-foreground">Quản lý CRM tuyển sinh đơn giản. Có thể cập nhật trạng thái trực tiếp.</p>
        </div>
        
        <LeadsClient leads={leads} courses={courses} facilities={facilities} />
      </div>
    </AppLayout>
  )
}
