import { AppLayout } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "./orders-client";
import { Receipt } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
          <div className="flex items-center gap-2 mb-1.5">
            <div className="clay-icon-tile h-8 w-8 bg-[#F0FDF4] text-[#16A34A] dark:bg-[#142A1D] dark:text-[#86EFAC]">
              <Receipt className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[#16A34A] dark:text-[#86EFAC] uppercase tracking-wider font-heading">Tuyển sinh & Vận hành</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">Đơn đăng ký & Doanh thu</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Quản lý các order ghi danh khóa học, theo dõi tiến độ thu học phí và xuất phiếu thu.
          </p>
        </div>
        
        <OrdersClient orders={orders} courses={courses} facilities={facilities} />
      </div>
    </AppLayout>
  );
}
