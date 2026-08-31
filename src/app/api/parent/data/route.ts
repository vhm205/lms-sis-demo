import { NextResponse } from 'next/server'
import { getParentFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const parent = await getParentFromRequest(request)

    if (!parent) {
      return NextResponse.json(
        { error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const requestedStudentId = searchParams.get('studentId')

    // Find all students for this parent
    const students = await prisma.student.findMany({
      where: { parentId: parent.id },
      include: {
        facility: true,
        classes: {
          include: {
            course: true,
            teacher: true
          }
        }
      }
    })

    if (students.length === 0) {
      return NextResponse.json({
        data: {
          parent,
          students: [],
          selectedStudent: null,
          attendances: [],
          assignments: [],
          schedules: [],
          orders: [],
          supportRequests: [],
          stats: { attendanceRate: 100, avgScore: 0, totalLessons: 0, completedLessons: 0 }
        }
      })
    }

    // Determine target student
    const activeStudent = requestedStudentId
      ? students.find((s) => s.id === requestedStudentId) || students[0]
      : students[0]

    // Fetch attendances for active student
    const attendances = await prisma.attendance.findMany({
      where: { studentId: activeStudent.id },
      include: {
        schedule: {
          include: {
            room: true,
            class: {
              include: { course: true, teacher: true }
            }
          }
        }
      },
      orderBy: { schedule: { date: 'desc' } },
      take: 20
    })

    // Fetch assignments / test scores
    const assignments = await prisma.assignment.findMany({
      where: { studentId: activeStudent.id },
      orderBy: { date: 'desc' },
      take: 20
    })

    // Fetch class IDs of active student
    const classIds = activeStudent.classes.map((c) => c.id)

    // Fetch schedules (upcoming and past)
    const schedules = await prisma.schedule.findMany({
      where: {
        classId: { in: classIds }
      },
      include: {
        room: {
          include: { facility: true }
        },
        class: {
          include: {
            course: true,
            teacher: true
          }
        },
        attendances: {
          where: { studentId: activeStudent.id }
        }
      },
      orderBy: { date: 'asc' },
      take: 30
    })

    // Fetch orders / tuition for parent or student
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { studentId: activeStudent.id },
          { parentPhone: parent.phone }
        ]
      },
      include: {
        course: true,
        facility: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Fetch support / leave requests
    const supportRequests = await prisma.supportRequest.findMany({
      where: { studentId: activeStudent.id },
      include: {
        assignee: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate stats
    const totalAttendances = attendances.length
    const presentCount = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length
    const attendanceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 100

    const gradedAssignments = assignments.filter((a) => a.score !== null && a.maxScore && a.maxScore > 0)
    const avgScore = gradedAssignments.length > 0
      ? (
          gradedAssignments.reduce((sum, a) => sum + (Number(a.score) / Number(a.maxScore)) * 10, 0) /
          gradedAssignments.length
        ).toFixed(1)
      : '9.0'

    return NextResponse.json({
      data: {
        parent: {
          id: parent.id,
          name: parent.name,
          phone: parent.phone,
          email: parent.email
        },
        students,
        selectedStudent: activeStudent,
        attendances,
        assignments,
        schedules,
        orders,
        supportRequests,
        stats: {
          attendanceRate,
          avgScore,
          totalAttendances,
          completedLessons: presentCount,
          activeClassesCount: activeStudent.classes.length
        }
      }
    })
  } catch (error: any) {
    console.error('[API /api/parent/data] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
