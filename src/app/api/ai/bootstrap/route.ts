import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getParentFromRequest } from '@/lib/auth'
import { createOrchexaSession } from '@/lib/orchexa'

export async function POST(req: Request) {
  try {
    // 1. Identify parent/user from request
    let parent = await getParentFromRequest(req)

    // Fallback for demo sandbox if no specific header is passed in browser
    if (!parent) {
      const defaultParent = await prisma.parent.findFirst({
        include: {
          students: {
            include: {
              facility: true,
              classes: {
                include: {
                  course: true,
                  teacher: true,
                },
              },
            },
          },
        },
      })
      if (defaultParent) {
        parent = defaultParent
      }
    }

    const userId = parent ? `parent_${parent.id}` : 'user_anonymous'
    const tenantId = 'educenter_vn_sandbox'

    // 2. Fetch rich CRM profile for the customer/parent
    let customerProfile: Record<string, unknown> | undefined

    if (parent) {
      const students = await prisma.student.findMany({
        where: { parentId: parent.id },
        include: {
          facility: true,
          classes: {
            include: {
              course: true,
              teacher: true,
            },
          },
          attendances: {
            include: {
              schedule: {
                include: { room: true },
              },
            },
            orderBy: { schedule: { date: 'desc' } },
            take: 5,
          },
          assignments: {
            orderBy: { date: 'desc' },
            take: 5,
          },
          supportRequests: {
            where: { status: { not: 'CLOSED' } },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      })

      const studentIds = students.map((s) => s.id)
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { studentId: { in: studentIds } },
            { parentPhone: parent.phone },
          ],
        },
        include: {
          course: true,
          facility: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      customerProfile = {
        display_name: parent.name,
        phone: parent.phone,
        email: parent.email || undefined,
        role: 'parent',
        children_count: students.length,
        children: students.map((s) => ({
          student_id: s.id,
          code: s.code,
          name: s.name,
          facility: s.facility.name,
          classes: s.classes.map((c) => ({
            class_id: c.id,
            class_name: c.name,
            course_name: c.course.name,
            teacher_name: c.teacher?.name || 'Chưa phân công',
          })),
          recent_attendances: s.attendances.map((a) => ({
            date: a.schedule.date,
            status: a.status,
            note: a.note || '',
            room: a.schedule.room.name,
          })),
          recent_assignments: s.assignments.map((asg) => ({
            title: asg.title,
            score: asg.score,
            max_score: asg.maxScore,
            status: asg.status,
            teacher_note: asg.teacherNote || '',
          })),
        })),
        recent_orders: orders.map((o) => ({
          order_code: o.code,
          course: o.course.name,
          amount: o.amount,
          status: o.status,
        })),
        notes: parent.notes || undefined,
      }
    }

    const url = new URL(req.url)
    let requestedStudentId = url.searchParams.get('studentId')
    try {
      const body = await req.clone().json().catch(() => ({}))
      if (body && body.studentId) requestedStudentId = body.studentId
    } catch {
      // noop
    }

    const referer = req.headers.get('referer') || undefined
    const isPwa = referer?.includes('/parent') || false

    const initialContext: Record<string, unknown> = {
      locale: 'vi',
      page: {
        url: referer,
        title: isPwa ? 'EduCenter Parent - Cổng Phụ huynh & Sổ liên lạc' : 'EduCenter VN - Hệ thống quản lý trung tâm đào tạo',
        type: isPwa ? 'parent_pwa_portal' : 'lms_sis_portal',
      },
    }

    if (requestedStudentId && customerProfile) {
      initialContext.active_student_id = requestedStudentId
    }

    if (customerProfile) {
      initialContext.customer = customerProfile
    }

    // 3. Create HMAC-signed session on Orchexa
    const session = await createOrchexaSession(userId, tenantId, {
      resumeLast: true,
      initialContext,
    })

    return NextResponse.json(session)
  } catch (error: any) {
    console.error('[API /api/ai/bootstrap] Error creating Orchexa session:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to create Orchexa session',
        code: 'ORCHEXA_SESSION_ERROR',
      },
      { status: 500 }
    )
  }
}
