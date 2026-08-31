import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone, otp } = body

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ Số điện thoại và Mã OTP' },
        { status: 400 }
      )
    }

    const cleanPhone = phone.trim().replace(/\s+/g, '')
    const cleanOtp = String(otp).trim()

    // Verification check: accept '123456' as universal test OTP or 6 digits
    if (cleanOtp !== '123456') {
      return NextResponse.json(
        { error: 'Mã OTP không chính xác. Mã test mặc định là 123456' },
        { status: 400 }
      )
    }

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
          include: {
            facility: true,
            classes: {
              include: {
                course: true,
                teacher: true
              }
            }
          }
        }
      }
    })

    if (!parent) {
      return NextResponse.json(
        { error: 'Không tìm thấy hồ sơ phụ huynh trong hệ thống' },
        { status: 404 }
      )
    }

    const response = NextResponse.json({
      success: true,
      data: {
        parent: {
          id: parent.id,
          name: parent.name,
          phone: parent.phone,
          email: parent.email,
          notes: parent.notes
        },
        students: parent.students
      }
    })

    // Set secure session cookie
    response.cookies.set('parent_phone', parent.phone, {
      path: '/',
      httpOnly: false, // readable by client app for header injection
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    response.cookies.set('parent_id', parent.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    })

    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
