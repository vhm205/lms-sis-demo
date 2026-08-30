import { AppLayout } from "@/components/layout"
import { prisma } from "@/lib/prisma"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function RequestsPage() {
  const [supportRequests, makeUpRequests] = await Promise.all([
    prisma.supportRequest.findMany({
      include: { student: true, assignee: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.makeUpRequest.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' }
    })
  ])

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yêu cầu hỗ trợ & Học bù</h1>
          <p className="text-muted-foreground">Xử lý các yêu cầu từ học viên và phụ huynh.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Support requests */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Yêu cầu chung</h2>
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học viên</TableHead>
                    <TableHead>Loại / Nội dung</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.student.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="mb-1">{req.type}</Badge>
                        <p className="text-sm">{req.content}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.status === 'NEW' ? 'destructive' : 'secondary'}>
                          {req.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Makeup requests */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">Yêu cầu học bù</h2>
            <div className="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Học viên</TableHead>
                    <TableHead>Lịch học</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {makeUpRequests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.student.name}</TableCell>
                      <TableCell className="text-sm">
                        Buổi nghỉ: {req.missedScheduleId} <br/>
                        Học bù: {req.targetScheduleId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.status === 'PENDING' ? 'destructive' : 'secondary'}>
                          {req.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
