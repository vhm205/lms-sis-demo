import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getParentFromRequest } from '@/lib/auth'
import { createOrchexaSession } from '@/lib/orchexa'

export async function POST(req: Request) {
  try {
    const url = new URL(req.url)
    let body: Record<string, any> = {}
    try {
      body = await req.clone().json().catch(() => ({}))
    } catch {
      // noop
    }

    const referer = req.headers.get('referer') || ''
    const headerPortal = req.headers.get('x-portal')
    const headerChannel = req.headers.get('x-channel')
    const hasParentHeader = Boolean(req.headers.get('x-parent-id') || req.headers.get('x-parent-phone'))

    // 1. Determine Portal & Channel: PWA (Parent Portal) vs CRM (Admin / LMS-SIS Portal)
    const isPwa =
      headerPortal === 'pwa' ||
      body?.portal === 'pwa' ||
      url.searchParams.get('portal') === 'pwa' ||
      hasParentHeader ||
      referer.includes('/parent')

    const channel =
      headerChannel ||
      body?.channel ||
      url.searchParams.get('channel') ||
      (isPwa ? 'mobile_app' : 'crm_web')

    const tenantId = 'educenter_vn_sandbox'

    let requestedStudentId = url.searchParams.get('studentId') || body?.studentId

    if (isPwa) {
      // ==========================================
      // Case A: PARENT / PWA PORTAL (mobile_app)
      // ==========================================
      let parent = await getParentFromRequest(req)

      // Fallback for demo sandbox if accessing /parent without explicit credentials
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

      const userId = parent ? `parent_${parent.id}` : 'parent_guest'

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
          portal: 'Parent PWA Portal',
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

      const initialContext: Record<string, unknown> = {
        locale: 'vi',
        portal: 'pwa',
        channel,
        page: {
          url: referer || '/parent',
          title: 'EduCenter Parent - Cổng Phụ huynh & Sổ liên lạc',
          type: 'parent_pwa_portal',
        },
      }

      if (requestedStudentId && customerProfile) {
        initialContext.active_student_id = requestedStudentId
      }

      if (customerProfile) {
        initialContext.customer = customerProfile
      }

      const session = await createOrchexaSession(userId, tenantId, {
        channel,
        resumeLast: true,
        initialContext,
      })

      return NextResponse.json(session)
    }

    // ==========================================
    // Case B: ADMIN / CRM PORTAL (crm_web)
    // ==========================================
    const adminUser =
      (await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        include: { facility: true },
      })) ||
      (await prisma.user.findFirst({
        include: { facility: true },
      }))

    const userId = adminUser ? `admin_${adminUser.id}` : 'admin_educenter_vn'

    const adminProfile = {
      display_name: adminUser?.name || 'Ban Quản Trị EduCenter',
      email: adminUser?.email || 'admin@educenter.vn',
      phone: '0901234567',
      role: 'admin',
      portal: 'LMS-SIS Cổng Quản Trị',
      company: 'EduCenter VN',
      designation: adminUser?.role || 'ADMIN',
      facility: adminUser?.facility?.name || 'Toàn hệ thống EduCenter',
    }

    const initialContext: Record<string, unknown> = {
      locale: 'vi',
      portal: 'crm_web',
      channel,
      page: {
        url: referer || '/',
        title: 'EduCenter VN - Hệ thống quản lý trung tâm đào tạo & LMS-SIS',
        type: 'lms_sis_portal',
      },
      customer: adminProfile,
    }

    const session = await createOrchexaSession(userId, tenantId, {
      channel,
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
