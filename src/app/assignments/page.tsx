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

export default async function AssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    include: { student: true },
    orderBy: { date: 'desc' }
  })

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kết quả học tập</h1>
          <p className="text-muted-foreground">Bài tập và điểm số của học viên.</p>
        </div>
        
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Học viên</TableHead>
                <TableHead>Bài tập</TableHead>
                <TableHead>Điểm</TableHead>
                <TableHead>Nhận xét</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.student.name}</TableCell>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.score !== null ? `${assignment.score}/${assignment.maxScore}` : "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{assignment.teacherNote || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={assignment.status === 'COMPLETED' ? 'default' : 'destructive'}>
                      {assignment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  )
}
