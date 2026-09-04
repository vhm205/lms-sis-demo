import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CoursesClient } from "./courses-client";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { id: 'desc' }
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="clay-icon-tile h-8 w-8 bg-[#FFFBEB] text-[#D97706] dark:bg-[#2B2011] dark:text-[#FCD34D]">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="text-xs font-extrabold text-[#D97706] dark:text-[#FCD34D] uppercase tracking-wider font-heading">Học vụ & Đào tạo</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">Chương trình & Khóa học</h1>
        <p className="text-sm text-muted-foreground mt-0.5 font-medium">
          Quản lý danh mục các chương trình đào tạo, học phí, số buổi học của trung tâm.
        </p>
      </div>
      
      <Suspense fallback={null}>
        <CoursesClient courses={courses} />
      </Suspense>
    </div>
  );
}
