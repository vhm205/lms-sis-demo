import { PrismaClient } from '@prisma/client'

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')
  
  // Clear existing data
  await prisma.activityLog.deleteMany()
  await prisma.transferRequest.deleteMany()
  await prisma.makeUpRequest.deleteMany()
  await prisma.supportRequest.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.student.deleteMany()
  await prisma.parent.deleteMany()
  await prisma.class.deleteMany()
  await prisma.course.deleteMany()
  await prisma.room.deleteMany()
  await prisma.user.deleteMany()
  await prisma.facility.deleteMany()

  // 1. Facilities
  const facilityHN = await prisma.facility.create({
    data: { name: 'Cơ sở Cầu Giấy', address: '123 Xuân Thủy, Cầu Giấy, Hà Nội' }
  })
  const facilityHCM = await prisma.facility.create({
    data: { name: 'Cơ sở Bình Thạnh', address: '456 Điện Biên Phủ, Bình Thạnh, TP.HCM' }
  })
  const facilityDN = await prisma.facility.create({
    data: { name: 'Cơ sở Hải Châu', address: '789 Nguyễn Văn Linh, Hải Châu, Đà Nẵng' }
  })

  // 2. Rooms
  const rooms = await Promise.all([
    prisma.room.create({ data: { name: 'Phòng 101', capacity: 20, facilityId: facilityHN.id } }),
    prisma.room.create({ data: { name: 'Phòng 102', capacity: 20, facilityId: facilityHN.id } }),
    prisma.room.create({ data: { name: 'Phòng 201', capacity: 15, facilityId: facilityHCM.id } }),
    prisma.room.create({ data: { name: 'Phòng 301', capacity: 25, facilityId: facilityDN.id } }),
  ])

  // 3. Users (Roles)
  await prisma.user.create({ data: { name: 'Nguyễn Văn Admin', email: 'admin@demo.com', role: 'ADMIN' } })
  const teacher1 = await prisma.user.create({ data: { name: 'Trần Thị Giáo Viên 1', email: 'teacher1@demo.com', role: 'TEACHER', facilityId: facilityHN.id } })
  const teacher2 = await prisma.user.create({ data: { name: 'Lê Văn Giáo Viên 2', email: 'teacher2@demo.com', role: 'TEACHER', facilityId: facilityHCM.id } })
  await prisma.user.create({ data: { name: 'Phạm Thị Tư Vấn', email: 'sales@demo.com', role: 'SALES', facilityId: facilityHN.id } })
  const cs1 = await prisma.user.create({ data: { name: 'Hoàng Văn CS', email: 'cs@demo.com', role: 'CS', facilityId: facilityHN.id } })

  // 4. Courses
  const courseEnglish = await prisma.course.create({
    data: { code: 'ENG-KID-01', name: 'Tiếng Anh Thiếu Nhi Mầm Non', type: 'Tiếng Anh thiếu nhi', targetAge: '4-6', duration: 24, fee: 3000000 }
  })
  const courseIELTS = await prisma.course.create({
    data: { code: 'IELTS-INT', name: 'Luyện thi IELTS Intermediate', type: 'Luyện thi IELTS', targetAge: '15+', duration: 36, fee: 8000000 }
  })
  const courseMath = await prisma.course.create({
    data: { code: 'MATH-TUDUY', name: 'Toán Tư Duy Tiểu Học', type: 'Toán tư duy', targetAge: '7-10', duration: 20, fee: 2500000 }
  })

  // 5. Classes
  const class1 = await prisma.class.create({
    data: {
      code: 'ENG-HN-01', name: 'Lớp Tiếng Anh Kids Cầu Giấy 1', courseId: courseEnglish.id, teacherId: teacher1.id, facilityId: facilityHN.id, capacity: 15
    }
  })
  const class2 = await prisma.class.create({
    data: {
      code: 'IELTS-HCM-01', name: 'Lớp IELTS Tối 2-4-6 Bình Thạnh', courseId: courseIELTS.id, teacherId: teacher2.id, facilityId: facilityHCM.id, capacity: 10
    }
  })

  // 6. Parents & Students
  const parent1 = await prisma.parent.create({
    data: { name: 'Nguyễn Văn Phụ Huynh A', phone: '0901234567', notes: 'Liên hệ qua Zalo' }
  })
  const parent2 = await prisma.parent.create({
    data: { name: 'Trần Thị Phụ Huynh B', phone: '0912345678' }
  })

  const student1 = await prisma.student.create({
    data: { code: 'HV0001', name: 'Nguyễn Văn Bé Minh', dob: new Date('2018-05-15'), parentId: parent1.id, facilityId: facilityHN.id, classes: { connect: { id: class1.id } } }
  })
  const student2 = await prisma.student.create({
    data: { code: 'HV0002', name: 'Nguyễn Thị Bé Lan', dob: new Date('2019-02-10'), parentId: parent1.id, facilityId: facilityHN.id, classes: { connect: { id: class1.id } } }
  })
  const student3 = await prisma.student.create({
    data: { code: 'HV0003', name: 'Trần Văn IELTS', dob: new Date('2005-08-20'), phone: '0987654321', parentId: parent2.id, facilityId: facilityHCM.id, classes: { connect: { id: class2.id } } }
  })

  // 7. Schedules & Attendances
  const schedule1 = await prisma.schedule.create({
    data: { classId: class1.id, roomId: rooms[0].id, date: new Date('2024-10-01T08:00:00Z'), duration: 90, status: 'COMPLETED' }
  })
  const schedule2 = await prisma.schedule.create({
    data: { classId: class1.id, roomId: rooms[0].id, date: new Date('2024-10-03T08:00:00Z'), duration: 90, status: 'COMPLETED' }
  })
  const schedule3 = await prisma.schedule.create({
    data: { classId: class1.id, roomId: rooms[0].id, date: new Date('2024-10-08T08:00:00Z'), duration: 90, status: 'SCHEDULED' }
  })

  await prisma.attendance.create({ data: { scheduleId: schedule1.id, studentId: student1.id, classId: class1.id, status: 'PRESENT' } })
  await prisma.attendance.create({ data: { scheduleId: schedule1.id, studentId: student2.id, classId: class1.id, status: 'ABSENT', note: 'Ốm' } })
  await prisma.attendance.create({ data: { scheduleId: schedule2.id, studentId: student1.id, classId: class1.id, status: 'ABSENT', note: 'Việc gia đình' } })
  await prisma.attendance.create({ data: { scheduleId: schedule2.id, studentId: student2.id, classId: class1.id, status: 'PRESENT' } })

  // 8. Assignments
  await prisma.assignment.create({
    data: { title: 'Bài tập Unit 1', studentId: student3.id, score: 7.5, maxScore: 10, status: 'COMPLETED', teacherNote: 'Cần chú ý ngữ pháp' }
  })

  // 9. Leads
  await prisma.lead.create({
    data: { name: 'Phụ huynh khách mới', phone: '0933334444', courseId: courseMath.id, facilityId: facilityDN.id, status: 'NEW' }
  })
  await prisma.lead.create({
    data: { name: 'Sinh viên hỏi IELTS', phone: '0944445555', courseId: courseIELTS.id, facilityId: facilityHCM.id, status: 'CONSULTING', notes: 'Hẹn gọi lại vào cuối tuần' }
  })

  // 10. Requests
  await prisma.supportRequest.create({
    data: { studentId: student1.id, type: 'INFO', content: 'Phụ huynh hỏi lịch nghỉ lễ', status: 'NEW' }
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
