import { AppLayout } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { CampaignsClient } from "./campaigns-client";
import { Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CampaignsPage() {
  const [campaigns, courses, facilities] = await Promise.all([
    prisma.campaign.findMany({
      include: {
        facility: true,
        items: {
          include: { course: true },
          orderBy: [{ featured: "desc" }, { orderIndex: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.course.findMany({ where: { status: "ACTIVE" } }),
    prisma.facility.findMany(),
  ]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="clay-icon-tile h-8 w-8 bg-[#FFF7ED] text-[#EA580C] dark:bg-[#381F13] dark:text-[#FB923C]">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold text-[#EA580C] dark:text-[#FB923C] uppercase tracking-wider font-heading">
              Tuyển sinh & Vận hành
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-foreground">
                Chiến dịch & Sự kiện Khuyến Mãi
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                Quản lý các chương trình ưu đãi, flash sale và public ra API / MCP Product Carousel cho Orchexa AI Agent.
              </p>
            </div>
          </div>
        </div>

        <CampaignsClient campaigns={campaigns} courses={courses} facilities={facilities} />
      </div>
    </AppLayout>
  );
}
