import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone } = body

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Vui lòng nhập số điện thoại hợp lệ' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '')

    // Check if parent exists
    const parent = await prisma.parent.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: cleanPhone.replace(/^0/, '+84') },
          { phone: cleanPhone.replace(/^\+84/, '0') }
        ]
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    if (!parent) {
      return NextResponse.json(
        {
          error: 'Số điện thoại chưa được đăng ký trong hệ thống phụ huynh của EduCenter. Vui lòng liên hệ trung tâm hoặc chọn một trong các số mẫu demo.',
          code: 'PARENT_NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // In demo environment, OTP is always 123456
    return NextResponse.json({
      success: true,
      message: 'Mã OTP xác thực đã được gửi tới số điện thoại (Mã test mặc định: 123456)',
      phone: cleanPhone,
      parentName: parent.name,
      studentsCount: parent.students.length,
      demoOtpHint: '123456'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
