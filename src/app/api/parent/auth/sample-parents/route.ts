import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Find parents who have 1 or more students with classes
    const parents = await prisma.parent.findMany({
      where: {
        students: {
          some: {
            classes: {
              some: {}
            }
          }
        }
      },
      include: {
        students: {
          include: {
            classes: {
              include: {
                course: true
              }
            },
            facility: true
          }
        }
      },
      take: 6
    })

    const sampleParents = parents.map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      childrenCount: p.students.length,
      childrenNames: p.students.map((s) => s.name).join(', '),
      childrenSummary: p.students.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        facility: s.facility?.name,
        courses: s.classes.map((c) => c.course.name)
      }))
    }))

    return NextResponse.json({
      success: true,
      data: sampleParents
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
