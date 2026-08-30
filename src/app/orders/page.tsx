import { AppLayout } from "@/components/layout"
import { prisma } from "@/lib/prisma"
import { OrdersClient } from "./orders-client"

export default async function OrdersPage() {
  const [orders, courses, facilities] = await Promise.all([
    prisma.order.findMany({
      include: { course: true, facility: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.course.findMany({ where: { status: 'ACTIVE' } }),
    prisma.facility.findMany()
  ]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn đăng ký</h1>
          <p className="text-muted-foreground">Quản lý các order chốt đăng ký khóa học từ phụ huynh.</p>
        </div>
        
        <OrdersClient orders={orders} courses={courses} facilities={facilities} />
      </div>
    </AppLayout>
  )
}
