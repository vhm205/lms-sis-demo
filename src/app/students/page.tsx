import { AppLayout } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "./students-client";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      parent: true,
      facility: true,
      classes: true,
    },
    orderBy: { createdAt: 'desc' }
  });
  
  const facilities = await prisma.facility.findMany();

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="clay-icon-tile h-8 w-8 bg-[#E6F8FB] text-[#0284C7] dark:bg-[#0E2E3B] dark:text-[#38BDF8]">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[#0284C7] dark:text-[#38BDF8] uppercase tracking-wider font-heading">Học vụ & Đào tạo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">Quản lý Học viên</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">
            Danh sách hồ sơ học viên, thông tin phụ huynh, lớp học và tình trạng chuyên cần.
          </p>
        </div>
        
        <StudentsClient students={students} facilities={facilities} />
      </div>
    </AppLayout>
  );
}
