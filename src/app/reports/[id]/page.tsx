import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string; reportId?: string; print?: string }>;
}

export default async function ReportAliasPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const queryString = new URLSearchParams(sp as Record<string, string>).toString();
  redirect(`/reports/preview/${id}${queryString ? `?${queryString}` : ""}`);
}
