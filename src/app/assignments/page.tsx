import { AppLayout } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { AssignmentsClient } from "./assignments-client";

export default async function AssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    include: {
      student: {
        include: { facility: true }
      }
    },
    orderBy: { date: 'desc' }
  });

  return (
    <AppLayout>
      <AssignmentsClient assignments={assignments} />
    </AppLayout>
  );
}
