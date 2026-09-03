import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getParentFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const parent = await getParentFromRequest(request)

    if (!parent) {
      return NextResponse.json(
        { error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { studentId, type, content, priority } = body

    if (!studentId || !content) {
      return NextResponse.json(
        { error: 'Vui lòng chọn học sinh và nhập nội dung yêu cầu' },
        { status: 400 }
      )
    }

    // Verify student belongs to this parent
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        parentId: parent.id
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Học sinh không thuộc quyền quản lý của phụ huynh này' },
        { status: 403 }
      )
    }

    const newRequest = await prisma.supportRequest.create({
      data: {
        studentId: student.id,
        type: type || 'LEAVE', // LEAVE, INFO, SUPPORT, COMPLAINT, CALL_BACK
        content: content.trim(),
        priority: priority || 'NORMAL',
        status: 'NEW',
        notes: `Tạo từ Cổng Phụ huynh PWA bởi ${parent.name} (${parent.phone})`
      }
    })

    // Also log activity
    await prisma.activityLog.create({
      data: {
        action: 'PARENT_CREATE_SUPPORT_REQUEST',
        entityType: 'SupportRequest',
        entityId: newRequest.id,
        source: 'PWA_PARENT',
        details: JSON.stringify({
          parentName: parent.name,
          studentName: student.name,
          type: newRequest.type,
          content: newRequest.content
        })
      }
    })

    try {
      revalidatePath('/requests')
      revalidatePath('/parent/tuition-requests')
      revalidatePath('/')
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'Gửi yêu cầu thành công! Giáo viên và tư vấn viên sẽ phản hồi sớm nhất.',
      data: newRequest
    })
  } catch (error: any) {
    console.error('[API /api/parent/requests/create] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
