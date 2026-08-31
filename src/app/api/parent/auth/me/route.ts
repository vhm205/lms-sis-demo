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

    const students = await prisma.student.findMany({
      where: { parentId: parent.id },
      include: {
        facility: true,
        classes: {
          include: {
            course: true,
            teacher: true
          }
        },
        attendances: {
          include: {
            schedule: {
              include: { room: true }
            }
          },
          orderBy: { schedule: { date: 'desc' } },
          take: 5
        },
        assignments: {
          orderBy: { date: 'desc' },
          take: 5
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        parent: {
          id: parent.id,
          name: parent.name,
          phone: parent.phone,
          email: parent.email,
          notes: parent.notes
        },
        students
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
