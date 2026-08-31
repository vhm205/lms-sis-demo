import { AppLayout } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { LeadsClient } from "./leads-client";
import { UserPlus } from "lucide-react";

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
          <div className="flex items-center gap-2 mb-1.5">
            <div className="clay-icon-tile h-8 w-8 bg-[#FFFBEB] text-[#D97706] dark:bg-[#2B2011] dark:text-[#FCD34D]">
              <UserPlus className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[#D97706] dark:text-[#FCD34D] uppercase tracking-wider font-heading">Tuyển sinh & CRM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">Khách hàng tiềm năng (Leads)</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Quản lý phễu tư vấn tuyển sinh, theo dõi trạng thái liên hệ và chuyển đổi học viên.
          </p>
        </div>
        
        <LeadsClient leads={leads} courses={courses} facilities={facilities} />
      </div>
    </AppLayout>
  );
}
