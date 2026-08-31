import { AppLayout } from "@/components/layout";
import { prisma } from "@/lib/prisma";
import { RequestsClient } from "./requests-client";

export default async function RequestsPage() {
  const [supportRequests, makeUpRequests] = await Promise.all([
    prisma.supportRequest.findMany({
      include: {
        student: {
          include: { facility: true }
        },
        assignee: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.makeUpRequest.findMany({
      include: {
        student: {
          include: { facility: true }
        },
        missedSchedule: {
          include: {
            class: true,
            room: true
          }
        },
        targetSchedule: {
          include: {
            class: true,
            room: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <AppLayout>
      <RequestsClient supportRequests={supportRequests} makeUpRequests={makeUpRequests} />
    </AppLayout>
  );
}
