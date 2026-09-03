import { prisma } from './src/lib/prisma'

async function main() {
  console.log('🚀 Starting streamlined database seed tailored for CSKH Testing Scenarios...')
  const startTime = Date.now()

  // 1. Clear existing data in correct dependency order
  console.log('Cleaning old data...')
  await prisma.activityLog.deleteMany()
  await prisma.campaignItem.deleteMany()
  await prisma.campaign.deleteMany()
  await prisma.transferRequest.deleteMany()
  await prisma.makeUpRequest.deleteMany()
  await prisma.supportRequest.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.order.deleteMany()
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

  // 2. Facilities (Aligned with Scenarios: Cầu Giấy, Bình Thạnh, Quận 7)
  console.log('Creating 3 target facilities...')
  const facilityHN = await prisma.facility.create({
    data: {
      id: 'facility-cau-giay',
      name: 'Cơ sở Cầu Giấy',
      address: '123 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội'
    }
  })

  const facilityBT = await prisma.facility.create({
    data: {
      id: 'facility-binh-thanh',
      name: 'Cơ sở Bình Thạnh',
      address: '456 Điện Biên Phủ, Phường 25, Bình Thạnh, TP.HCM'
    }
  })

  const facilityQ7 = await prisma.facility.create({
    data: {
      id: 'facility-quan-7',
      name: 'Cơ sở Quận 7',
      address: '789 Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM'
    }
  })

  // 3. Rooms
  console.log('Creating rooms...')
  const roomHN101 = await prisma.room.create({ data: { name: 'Phòng HN-101 (Smart Lab)', capacity: 20, facilityId: facilityHN.id } })
  const roomHN102 = await prisma.room.create({ data: { name: 'Phòng HN-102 (Kids Active)', capacity: 18, facilityId: facilityHN.id } })

  const roomBT101 = await prisma.room.create({ data: { name: 'Phòng BT-101 (Movers Class)', capacity: 18, facilityId: facilityBT.id } })
  const roomBT102 = await prisma.room.create({ data: { name: 'Phòng BT-102 (Flyers Studio)', capacity: 20, facilityId: facilityBT.id } })
  const roomBT201 = await prisma.room.create({ data: { name: 'Phòng BT-201 (MBA Executive)', capacity: 25, facilityId: facilityBT.id } })

  const roomQ7101 = await prisma.room.create({ data: { name: 'Phòng Q7-101 (Creative Junior)', capacity: 18, facilityId: facilityQ7.id } })
  const roomQ7102 = await prisma.room.create({ data: { name: 'Phòng Q7-102 (Language Hub)', capacity: 20, facilityId: facilityQ7.id } })

  // 4. Users (Admin, Manager, Teachers, Sales & CS)
  console.log('Creating system users...')
  const adminUser = await prisma.user.create({
    data: { name: 'Nguyễn Văn Admin', email: 'admin@educenter.vn', role: 'ADMIN' }
  })
  const managerUser = await prisma.user.create({
    data: { name: 'Hoàng Minh Giám Đốc', email: 'manager@educenter.vn', role: 'MANAGER' }
  })

  const teacherMaiAnh = await prisma.user.create({
    data: { name: 'Trần Thị Mai Anh', email: 'teacher.maianh@educenter.vn', role: 'TEACHER', facilityId: facilityHN.id }
  })
  const teacherLong = await prisma.user.create({
    data: { name: 'Lê Văn Hoàng Long', email: 'teacher.long@educenter.vn', role: 'TEACHER', facilityId: facilityBT.id }
  })
  const teacherNga = await prisma.user.create({
    data: { name: 'Phạm Quỳnh Nga', email: 'teacher.nga@educenter.vn', role: 'TEACHER', facilityId: facilityQ7.id }
  })
  const teacherDavid = await prisma.user.create({
    data: { name: 'TS. David Miller', email: 'david.miller@educenter.vn', role: 'TEACHER', facilityId: facilityBT.id }
  })

  await prisma.user.create({
    data: { name: 'Vũ Đức Thịnh Sales', email: 'sales.hcm@educenter.vn', role: 'SALES', facilityId: facilityBT.id }
  })
  const csChau = await prisma.user.create({
    data: { name: 'Đỗ Thị Minh Châu CSKH', email: 'cs2@educenter.vn', role: 'CS', facilityId: facilityBT.id }
  })

  // 5. Courses (5 Focus Courses covering all scenarios)
  console.log('Creating 5 core courses...')
  const courseMBABase = await prisma.course.create({
    data: {
      code: 'MBA-FOUNDATION',
      name: 'Thạc sĩ Quản trị Kinh doanh - Giai đoạn Cơ sở (MBA Foundation)',
      type: 'Đào tạo Sau Đại học (MBA)',
      targetAge: '23+',
      level: 'Foundation',
      duration: 24,
      fee: 25000000,
      description: 'Nền tảng Quản trị chiến lược, Tài chính doanh nghiệp và Hành vi tổ chức.'
    }
  })

  const courseMBAAdv = await prisma.course.create({
    data: {
      code: 'MBA-ADVANCED-MGMT',
      name: 'MBA Chuyên ngành Quản trị Chiến lược & Đổi mới (MBA Advanced)',
      type: 'Đào tạo Sau Đại học (MBA)',
      targetAge: '23+',
      level: 'Advanced',
      duration: 30,
      fee: 32000000,
      description: 'Chuyên sâu về Lãnh đạo chuyển đổi số, Quản trị chuỗi cung ứng và Khởi nghiệp đổi mới sáng tạo.'
    }
  })

  const courseMovers = await prisma.course.create({
    data: {
      code: 'ENG-CAM-MOVERS',
      name: 'Tiếng Anh Cambridge Movers Chuẩn Quốc Tế',
      type: 'Tiếng Anh thiếu nhi',
      targetAge: '7-9',
      level: 'A1 Movers',
      duration: 32,
      fee: 4500000,
      description: 'Trang bị 4 kỹ năng Nghe - Nói - Đọc - Viết theo chuẩn Cambridge Young Learners.'
    }
  })

  const courseFlyers = await prisma.course.create({
    data: {
      code: 'ENG-CAM-FLYERS',
      name: 'Tiếng Anh Cambridge Flyers Bứt Phá',
      type: 'Tiếng Anh thiếu nhi',
      targetAge: '10-12',
      level: 'A2 Flyers',
      duration: 32,
      fee: 4800000,
      description: 'Chinh phục chứng chỉ A2 Flyers, chuẩn bị nền tảng chuyển cấp.'
    }
  })

  const courseSpeak1on1 = await prisma.course.create({
    data: {
      code: 'ENG-SPEAK-1ON1',
      name: 'Lớp Bổ Trợ Phát Âm & Phản Xạ Giao Tiếp 1:1',
      type: 'Tiếng Anh bổ trợ',
      targetAge: '8-16',
      level: 'Personalized',
      duration: 12,
      fee: 3600000,
      description: 'Khắc phục triệt để điểm yếu phát âm, tăng cường phản xạ Listening & Speaking 1 kèm 1 với giáo viên.'
    }
  })

  // 6. Classes (Tailored for transfers, makeups, and persona tests)
  console.log('Creating targeted classes...')
  // Class 1: Bé Minh hiện tại (Bình Thạnh - Tối 3-5)
  const classMoversBT01 = await prisma.class.create({
    data: {
      code: 'HCM-MOV-BT01',
      name: 'Lớp Cambridge Movers (Bình Thạnh - Tối 3-5)',
      courseId: courseMovers.id,
      teacherId: teacherLong.id,
      facilityId: facilityBT.id,
      capacity: 15,
      status: 'ONGOING'
    }
  })

  // Class 2: Target chuyển cơ sở của Bé Minh (Quận 7 - Tối 3-5)
  const classMoversQ701 = await prisma.class.create({
    data: {
      code: 'HCM-MOV-Q701',
      name: 'Lớp Cambridge Movers (Quận 7 - Tối 3-5)',
      courseId: courseMovers.id,
      teacherId: teacherNga.id,
      facilityId: facilityQ7.id,
      capacity: 15,
      status: 'ONGOING'
    }
  })

  // Class 3: Lớp học bù cuối tuần (Bình Thạnh - Sáng T7-CN)
  const classMoversBTWeekend = await prisma.class.create({
    data: {
      code: 'HCM-MOV-BT-WK',
      name: 'Lớp Cambridge Movers Bù & Tăng cường (Bình Thạnh - Sáng T7-CN)',
      courseId: courseMovers.id,
      teacherId: teacherLong.id,
      facilityId: facilityBT.id,
      capacity: 12,
      status: 'ONGOING'
    }
  })

  // Class 4: Lớp Flyers Bình Thạnh
  const classFlyersBT01 = await prisma.class.create({
    data: {
      code: 'HCM-FLY-BT01',
      name: 'Lớp Cambridge Flyers (Bình Thạnh - Tối 2-4-6)',
      courseId: courseFlyers.id,
      teacherId: teacherLong.id,
      facilityId: facilityBT.id,
      capacity: 15,
      status: 'ONGOING'
    }
  })

  // Class 5: Lớp Flyers Cầu Giấy HN
  const classFlyersHN01 = await prisma.class.create({
    data: {
      code: 'HN-FLY-CG01',
      name: 'Lớp Cambridge Flyers (Cầu Giấy - Tối 3-5)',
      courseId: courseFlyers.id,
      teacherId: teacherMaiAnh.id,
      facilityId: facilityHN.id,
      capacity: 16,
      status: 'ONGOING'
    }
  })

  // Class 6: Lớp MBA Cơ sở của anh Nam
  const classMBABT01 = await prisma.class.create({
    data: {
      code: 'HCM-MBA-K28',
      name: 'Lớp MBA Cơ sở Khóa 28 (Bình Thạnh - Tối Thứ 4 & Thứ 7)',
      courseId: courseMBABase.id,
      teacherId: teacherDavid.id,
      facilityId: facilityBT.id,
      capacity: 25,
      status: 'ONGOING'
    }
  })

  // Class 7: Lớp MBA Chuyên ngành tiếp theo (Upsell)
  const classMBAAdvBT01 = await prisma.class.create({
    data: {
      code: 'HCM-MBA-ADV27',
      name: 'Lớp MBA Chuyên ngành Quản trị Khóa 27 (Bình Thạnh - Cuối tuần)',
      courseId: courseMBAAdv.id,
      teacherId: teacherDavid.id,
      facilityId: facilityBT.id,
      capacity: 20,
      status: 'ONGOING'
    }
  })

  // Class 8: Lớp bổ trợ 1:1 Speaking (Cross-sell)
  const classSpeak1on1BT = await prisma.class.create({
    data: {
      code: 'HCM-SPK-1ON1',
      name: 'Lớp Bổ Trợ Giao Tiếp 1:1 Chuyên Sâu (Bình Thạnh / Online)',
      courseId: courseSpeak1on1.id,
      teacherId: teacherNga.id,
      facilityId: facilityBT.id,
      capacity: 5,
      status: 'ONGOING'
    }
  })

  // 7. Exactly 5 Deterministic Parents
  console.log('Creating 5 test-persona parents...')
  // Parent 1: Mẹ bé Nhật Minh & Nhật An
  const parentTrang = await prisma.parent.create({
    data: {
      name: 'PH. Lê Thu Trang',
      phone: '0901234567',
      email: 'lethutrang@gmail.com',
      notes: 'Phụ huynh bé Nguyễn Nhật Minh và Nguyễn Nhật An. Có kế hoạch chuyển nhà sang Quận 7 trong tháng tới.'
    }
  })

  // Parent 2: Anh Trần Hoàng Nam (Học viên MBA tự học)
  const parentNam = await prisma.parent.create({
    data: {
      name: 'Trần Hoàng Nam (Học viên MBA)',
      phone: '0912345678',
      email: 'nam.tran@company.com.vn',
      notes: 'Học viên cao học MBA, Trưởng phòng Marketing bận công tác thường xuyên.'
    }
  })

  // Parent 3: Mẹ bé Hoàng Đức Long
  const parentHuong = await prisma.parent.create({
    data: {
      name: 'PH. Phạm Quỳnh Hương',
      phone: '0923456789',
      email: 'quynhhuong.pham@gmail.com',
      notes: 'Phụ huynh rất quan tâm điểm số thi giữa kỳ và cần cải thiện kỹ năng Speaking cho con.'
    }
  })

  // Parent 4: Bố bé Vũ Bảo Ngọc
  const parentHung = await prisma.parent.create({
    data: {
      name: 'PH. Vũ Đình Hùng',
      phone: '0934567890',
      email: 'dinhhung.vu@gmail.com',
      notes: 'Phụ huynh đang phân vân không muốn tái tục do cảm thấy con chưa tự tin sau 1 năm học.'
    }
  })

  // Parent 5: Mẹ bé Đặng Gia Huy & Đặng Hải Đăng
  const parentNga = await prisma.parent.create({
    data: {
      name: 'PH. Đặng Thúy Nga',
      phone: '0945678901',
      email: 'thuynga.dang@gmail.com',
      notes: 'Phụ huynh 2 bé Gia Huy và Hải Đăng. Vừa chuyển khoản học phí 5 triệu và từng khiếu nại điều hòa phòng học.'
    }
  })

  // 8. Exactly 7 Students (1-2 students per parent)
  console.log('Creating 7 students mapped to parents...')
  // Student 1: Nguyễn Nhật Minh (Con mẹ Trang)
  const studentMinh = await prisma.student.create({
    data: {
      code: 'HV0001',
      name: 'Nguyễn Nhật Minh',
      dob: new Date('2016-05-15'),
      parentId: parentTrang.id,
      facilityId: facilityBT.id,
      status: 'ACTIVE',
      classes: { connect: [{ id: classMoversBT01.id }] }
    }
  })

  // Student 2: Nguyễn Nhật An (Con mẹ Trang)
  const studentAn = await prisma.student.create({
    data: {
      code: 'HV0002',
      name: 'Nguyễn Nhật An',
      dob: new Date('2014-08-20'),
      parentId: parentTrang.id,
      facilityId: facilityBT.id,
      status: 'ACTIVE',
      classes: { connect: [{ id: classFlyersBT01.id }] }
    }
  })

  // Student 3: Trần Hoàng Nam (Học viên MBA tự học)
  const studentNam = await prisma.student.create({
    data: {
      code: 'HV0003',
      name: 'Trần Hoàng Nam',
      phone: '0912345678',
      dob: new Date('1992-11-10'),
      parentId: parentNam.id,
      facilityId: facilityBT.id,
      status: 'ACTIVE',
      classes: { connect: [{ id: classMBABT01.id }] }
    }
  })

  // Student 4: Hoàng Đức Long (Con mẹ Hương - Grammar tốt, Speaking điểm C)
  const studentLong = await prisma.student.create({
    data: {
      code: 'HV0004',
      name: 'Hoàng Đức Long',
      dob: new Date('2013-03-25'),
      parentId: parentHuong.id,
      facilityId: facilityBT.id,
      status: 'ACTIVE',
      classes: { connect: [{ id: classFlyersBT01.id }] }
    }
  })

  // Student 5: Vũ Bảo Ngọc (Con bố Hùng - Phụ huynh phân vân retention)
  const studentNgoc = await prisma.student.create({
    data: {
      code: 'HV0005',
      name: 'Vũ Bảo Ngọc',
      dob: new Date('2016-09-12'),
      parentId: parentHung.id,
      facilityId: facilityBT.id,
      status: 'ACTIVE',
      classes: { connect: [{ id: classMoversBT01.id }] }
    }
  })

  // Student 6: Đặng Gia Huy (Con mẹ Nga - Vừa nộp 5tr, khiếu nại máy lạnh)
  const studentHuy = await prisma.student.create({
    data: {
      code: 'HV0006',
      name: 'Đặng Gia Huy',
      dob: new Date('2015-12-05'),
      parentId: parentNga.id,
      facilityId: facilityBT.id,
      status: 'ACTIVE',
      classes: { connect: [{ id: classMoversBT01.id }] }
    }
  })

  // Student 7: Đặng Hải Đăng (Con mẹ Nga - Học sinh mới)
  const studentDang = await prisma.student.create({
    data: {
      code: 'HV0007',
      name: 'Đặng Hải Đăng',
      dob: new Date('2018-04-18'),
      parentId: parentNga.id,
      facilityId: facilityBT.id,
      status: 'ACTIVE',
      classes: { connect: [{ id: classMoversBT01.id }] }
    }
  })

  // 9. Schedules & Attendances
  console.log('Generating deterministic schedules and attendance records...')
  const now = new Date()

  // --- Schedules for Movers Bình Thạnh (Tối 3-5: 18h00 - 19h30) ---
  const schedMoversPast1 = await prisma.schedule.create({
    data: {
      classId: classMoversBT01.id,
      roomId: roomBT101.id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      duration: 90,
      status: 'COMPLETED'
    }
  })

  const schedMoversPast2 = await prisma.schedule.create({
    data: {
      classId: classMoversBT01.id,
      roomId: roomBT101.id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: 90,
      status: 'COMPLETED'
    }
  })

  const schedMoversUpcoming1 = await prisma.schedule.create({
    data: {
      classId: classMoversBT01.id,
      roomId: roomBT101.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Next Thursday 18h00
      duration: 90,
      status: 'SCHEDULED'
    }
  })

  // Attendance for Movers Class
  const moversStudents = [studentMinh, studentNgoc, studentHuy, studentDang]
  for (const st of moversStudents) {
    await prisma.attendance.create({
      data: {
        scheduleId: schedMoversPast1.id,
        studentId: st.id,
        classId: classMoversBT01.id,
        status: 'PRESENT',
        note: 'Có mặt đúng giờ, tham gia sôi nổi'
      }
    })
    await prisma.attendance.create({
      data: {
        scheduleId: schedMoversPast2.id,
        studentId: st.id,
        classId: classMoversBT01.id,
        status: 'PRESENT',
        note: 'Có mặt đầy đủ'
      }
    })
  }

  // --- Schedules for Weekend Make-up Class (HCM-MOV-BT-WK) ---
  const schedWeekendSat = await prisma.schedule.create({
    data: {
      classId: classMoversBTWeekend.id,
      roomId: roomBT101.id,
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Thứ 7 tuần này lúc 09h00
      duration: 90,
      status: 'SCHEDULED'
    }
  })

  const schedWeekendSun = await prisma.schedule.create({
    data: {
      classId: classMoversBTWeekend.id,
      roomId: roomBT101.id,
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Chủ Nhật tuần này lúc 09h00
      duration: 90,
      status: 'SCHEDULED'
    }
  })

  // --- Schedules for Target Class in Quận 7 (HCM-MOV-Q701) ---
  const schedQ7Tue = await prisma.schedule.create({
    data: {
      classId: classMoversQ701.id,
      roomId: roomQ7101.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Tối Thứ 3 tuần tới 18h00
      duration: 90,
      status: 'SCHEDULED'
    }
  })

  const schedQ7Thu = await prisma.schedule.create({
    data: {
      classId: classMoversQ701.id,
      roomId: roomQ7101.id,
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Tối Thứ 5 tuần tới 18h00
      duration: 90,
      status: 'SCHEDULED'
    }
  })

  // --- Schedules & 3 consecutive absences for MBA Student Nam (Risk Intervention test) ---
  const schedMBAPast1 = await prisma.schedule.create({
    data: {
      classId: classMBABT01.id,
      roomId: roomBT201.id,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      duration: 120,
      status: 'COMPLETED'
    }
  })

  const schedMBAPast2 = await prisma.schedule.create({
    data: {
      classId: classMBABT01.id,
      roomId: roomBT201.id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 120,
      status: 'COMPLETED'
    }
  })

  const schedMBAPast3 = await prisma.schedule.create({
    data: {
      classId: classMBABT01.id,
      roomId: roomBT201.id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      duration: 120,
      status: 'COMPLETED'
    }
  })

  const schedMBAExam = await prisma.schedule.create({
    data: {
      classId: classMBABT01.id,
      roomId: roomBT201.id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days later
      duration: 120,
      status: 'SCHEDULED'
    }
  })

  const schedMBAThesis = await prisma.schedule.create({
    data: {
      classId: classMBABT01.id,
      roomId: roomBT201.id,
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days later
      duration: 180,
      status: 'SCHEDULED'
    }
  })

  // 3 ABSENT attendances for MBA Student Nam to trigger Scenario 3.2
  await prisma.attendance.create({
    data: {
      scheduleId: schedMBAPast1.id,
      studentId: studentNam.id,
      classId: classMBABT01.id,
      status: 'ABSENT',
      note: 'Vắng có phép - Bận công tác đột xuất'
    }
  })

  await prisma.attendance.create({
    data: {
      scheduleId: schedMBAPast2.id,
      studentId: studentNam.id,
      classId: classMBABT01.id,
      status: 'ABSENT',
      note: 'Vắng không phép buổi thứ 2'
    }
  })

  await prisma.attendance.create({
    data: {
      scheduleId: schedMBAPast3.id,
      studentId: studentNam.id,
      classId: classMBABT01.id,
      status: 'ABSENT',
      note: 'Vắng buổi thứ 3 liên tiếp môn Quản trị Chiến lược - Cần cảnh báo học vụ'
    }
  })

  // 10. Assignments & Scores (Scenarios 3.1, 6.2, 6.3)
  console.log('Creating assignments & score records...')
  // Case 6.2 & 3.1: Hoàng Đức Long (Grammar cao, Speaking & Listening điểm C)
  await prisma.assignment.create({
    data: {
      title: 'Bài thi giữa kỳ: Ngữ pháp & Từ vựng Unit 1-6',
      studentId: studentLong.id,
      score: 9.0,
      maxScore: 10,
      status: 'COMPLETED',
      teacherNote: 'Nắm vững cấu trúc câu, ngữ pháp rất tốt, làm bài cẩn thận.',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  })

  await prisma.assignment.create({
    data: {
      title: 'Kiểm tra Kỹ năng Nói & Giao tiếp phản xạ (Speaking Mock Test)',
      studentId: studentLong.id,
      score: 5.5,
      maxScore: 10,
      status: 'COMPLETED',
      teacherNote: 'Phát âm còn ngập ngừng, phản xạ Speaking còn hạn chế (Điểm C). Nên bổ sung thêm lớp luyện nói 1:1 với giáo viên bản ngữ.',
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  })

  await prisma.assignment.create({
    data: {
      title: 'Kiểm tra Kỹ năng Nghe hiểu (Listening Section 2)',
      studentId: studentLong.id,
      score: 6.0,
      maxScore: 10,
      status: 'COMPLETED',
      teacherNote: 'Cần luyện thêm khả năng bắt từ khóa trong đoạn hội thoại dài.',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  })

  // Case 6.3: Vũ Bảo Ngọc (Tiến bộ rõ rệt từ đầu vào 4.5 -> hiện tại 7.5 để xử lý nguy cơ nghỉ học)
  await prisma.assignment.create({
    data: {
      title: 'Đánh giá năng lực đầu vào (Placement Test)',
      studentId: studentNgoc.id,
      score: 4.5,
      maxScore: 10,
      status: 'COMPLETED',
      teacherNote: 'Chưa nhớ bảng chữ cái tiếng Anh, rất nhút nhát, chưa dám phát biểu.',
      date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  })

  await prisma.assignment.create({
    data: {
      title: 'Bảng điểm kiểm tra giữa kỳ (Mid-term Assessment)',
      studentId: studentNgoc.id,
      score: 7.5,
      maxScore: 10,
      status: 'COMPLETED',
      teacherNote: 'Đã thuộc từ vựng các chủ đề gia đình, trường học. Tích cực tham gia trò chơi tương tác, tiến bộ vượt bậc so với đầu khóa.',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  })

  // Case 3.1: Bé Minh có bảng điểm giữa kỳ tốt
  await prisma.assignment.create({
    data: {
      title: 'Bảng điểm thi giữa kỳ Cambridge Movers',
      studentId: studentMinh.id,
      score: 8.5,
      maxScore: 10,
      status: 'COMPLETED',
      teacherNote: 'Bé thông minh, tiếp thu bài nhanh, làm bài tập về nhà đầy đủ.',
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    }
  })

  // Case 4.2: Luận văn MBA của anh Nam chưa hoàn thành
  await prisma.assignment.create({
    data: {
      title: 'Báo cáo Chuyên đề & Tiểu luận Quản trị Chiến lược',
      studentId: studentNam.id,
      score: null,
      maxScore: 10,
      status: 'PENDING',
      teacherNote: null,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  })

  // 11. Orders & Billing Records (Scenarios 5.1 & 5.2)
  console.log('Generating target orders & bills...')
  // Case 5.1: Bé Minh đã đóng kỳ 1, nhưng có công nợ kỳ mới 4.500.000 VNĐ
  await prisma.order.create({
    data: {
      code: 'ORD-2025-0001',
      studentId: studentMinh.id,
      parentName: 'PH. Lê Thu Trang',
      parentPhone: '0901234567',
      courseId: courseMovers.id,
      facilityId: facilityBT.id,
      amount: 4500000,
      status: 'PAID',
      notes: 'Học phí Movers Kỳ 1 - Đã thanh toán đầy đủ',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    }
  })

  await prisma.order.create({
    data: {
      code: 'ORD-2025-0002',
      studentId: studentMinh.id,
      parentName: 'PH. Lê Thu Trang',
      parentPhone: '0901234567',
      courseId: courseMovers.id,
      facilityId: facilityBT.id,
      amount: 4500000,
      status: 'PENDING',
      notes: 'Học phí Movers Kỳ 2 - Chưa thanh toán (Công nợ tháng này)',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  })

  // Case 5.2: Phụ huynh Đặng Thúy Nga vừa chuyển khoản 5 triệu (Đang PENDING đối soát)
  await prisma.order.create({
    data: {
      code: 'ORD-2025-0003',
      studentId: studentHuy.id,
      parentName: 'PH. Đặng Thúy Nga',
      parentPhone: '0945678901',
      courseId: courseMovers.id,
      facilityId: facilityBT.id,
      amount: 5000000,
      status: 'PENDING',
      notes: 'Chờ đối soát kế toán - Khách hàng báo đã chuyển khoản qua VietQR lúc 09h30 sáng nay',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    }
  })

  // Order của anh Nam (MBA - Đã thanh toán)
  await prisma.order.create({
    data: {
      code: 'ORD-2025-0004',
      studentId: studentNam.id,
      parentName: 'Trần Hoàng Nam',
      parentPhone: '0912345678',
      courseId: courseMBABase.id,
      facilityId: facilityBT.id,
      amount: 25000000,
      status: 'PAID',
      notes: 'Đã hoàn tất thanh toán chuyển khoản doanh nghiệp',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  })

  // 12. Support Requests & Tickets (Scenarios 4.2, 4.3, 2.2)
  console.log('Generating support tickets...')
  // Case 4.3: Khiếu nại gay gắt về máy lạnh hỏng -> High Priority & Human Handoff
  await prisma.supportRequest.create({
    data: {
      studentId: studentHuy.id,
      type: 'COMPLAINT',
      priority: 'HIGH',
      status: 'NEW',
      assigneeId: csChau.id,
      content: 'Phòng học hôm nay nóng không có điều hòa. Báo mấy lần không sửa. Nối máy cho tôi gặp quản lý trung tâm ngay, không nói chuyện với máy nữa!',
      notes: 'Khách hàng bức xúc. Đã kích hoạt cơ chế Handoff cho Quản lý cơ sở Bình Thạnh xử lý trực tiếp.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 mins ago
    }
  })

  // Case 4.2: Lỗi upload luận văn 5MB PWA
  await prisma.supportRequest.create({
    data: {
      studentId: studentNam.id,
      type: 'SUPPORT',
      priority: 'NORMAL',
      status: 'IN_PROGRESS',
      assigneeId: csChau.id,
      content: 'App bị lỗi à? Tôi không tải file luận văn lên hệ thống PWA được, cứ báo quá dung lượng dù file chỉ có 5MB.',
      notes: 'Đã chuyển sang IT kiểm tra giới hạn upload của hệ thống nộp bài PWA.',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000)
    }
  })

  // Case 2.2: Đơn xin nghỉ của bé Minh
  await prisma.supportRequest.create({
    data: {
      studentId: studentMinh.id,
      type: 'LEAVE',
      priority: 'NORMAL',
      status: 'NEW',
      assigneeId: csChau.id,
      content: 'Hôm nay thứ 3 con tôi bị ốm không đi học được. Xin cho cháu nghỉ và sắp xếp học bù vào cuối tuần này. Trung tâm xem có lớp nào trống không?',
      notes: 'Chờ CS xác nhận ca bù thứ 7 hoặc chủ nhật.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  })

  // 13. Leads (5 sample leads for sales testing)
  console.log('Generating sample leads...')
  await prisma.lead.create({
    data: {
      name: 'Khách hàng Nguyễn Hoàng Nam',
      phone: '0988111222',
      courseId: courseMBAAdv.id,
      facilityId: facilityBT.id,
      age: 28,
      source: 'Facebook Ads',
      status: 'CONSULTING',
      notes: 'Quan tâm chương trình MBA Chuyên ngành Quản trị Chiến lược.'
    }
  })

  await prisma.lead.create({
    data: {
      name: 'Khách hàng Lê Kiều Oanh',
      phone: '0977333444',
      courseId: courseMovers.id,
      facilityId: facilityQ7.id,
      age: 8,
      source: 'Website Form',
      status: 'TRIAL_BOOKED',
      notes: 'Đã đăng ký học thử Cambridge Movers tại Cơ sở Quận 7 tối thứ 5.'
    }
  })

  await prisma.lead.create({
    data: {
      name: 'Khách hàng Vũ Thanh Tùng',
      phone: '0966555666',
      courseId: courseSpeak1on1.id,
      facilityId: facilityBT.id,
      age: 12,
      source: 'Giới thiệu từ học viên cũ',
      status: 'NEW',
      notes: 'Cần lớp 1:1 tăng cường Speaking chuẩn bị thi học bổng.'
    }
  })

  // 14. Campaigns & Promotional Events (Rich Product Carousel for Orchexa AI)
  console.log('Generating campaigns & recommended products...')
  const campBack2School = await prisma.campaign.create({
    data: {
      code: 'CAMP-BACK2SCHOOL-2025',
      title: 'Mùa Tựu Trường 2025 - Bứt Phá Cambridge',
      description: 'Chương trình ưu đãi tựu trường lớn nhất năm dành cho các bé tiểu học & THCS. Giảm ngay 20% học phí khi đăng ký trước ngày 15 hàng tháng.',
      badge: 'HOT EVENT 20%',
      type: 'PROMOTION',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      bannerUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&auto=format&fit=crop&q=80',
      facilityId: facilityBT.id,
      items: {
        create: [
          {
            productCode: 'ENG-CAM-MOVERS-PROMO',
            courseId: courseMovers.id,
            name: 'Cambridge Movers Chuẩn Quốc Tế',
            title: 'Lớp Movers (7-9 tuổi)',
            description: 'Tặng ngay học bổng 20% học phí + Bộ giáo trình bản quyền và balo phản quang khi phụ huynh đăng ký sớm.',
            imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80',
            listPrice: 4500000,
            salePrice: 3600000,
            discountPercent: 20,
            stock: 8,
            featured: true,
            orderIndex: 1,
            targetAudience: 'KIDS',
            primaryBtnLabel: 'Nhận voucher',
            primaryBtnMsg: 'Tôi muốn nhận ưu đãi 20% cho khóa Cambridge Movers Chuẩn Quốc Tế',
            secondaryBtnLabel: 'Xem chi tiết',
            secondaryBtnMsg: 'Tư vấn thêm cho tôi về khóa Cambridge Movers Chuẩn Quốc Tế'
          },
          {
            productCode: 'ENG-CAM-FLYERS-PROMO',
            courseId: courseFlyers.id,
            name: 'Cambridge Flyers Bứt Phá',
            title: 'Lớp Flyers (10-12 tuổi)',
            description: 'Chinh phục chứng chỉ A2 Flyers. Giảm ngay 20% học phí kỳ 1 + Tặng 2 buổi Speaking Mock Test cùng giáo viên bản ngữ.',
            imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80',
            listPrice: 4800000,
            salePrice: 3840000,
            discountPercent: 20,
            stock: 5,
            featured: false,
            orderIndex: 2,
            targetAudience: 'TEEN',
            primaryBtnLabel: 'Nhận voucher',
            primaryBtnMsg: 'Tôi muốn nhận ưu đãi cho khóa Cambridge Flyers Bứt Phá',
            secondaryBtnLabel: 'Xem chi tiết',
            secondaryBtnMsg: 'Tư vấn thêm cho tôi về khóa Cambridge Flyers Bứt Phá'
          }
        ]
      }
    }
  })

  const campRetentionMBA = await prisma.campaign.create({
    data: {
      code: 'CAMP-RETENTION-MBA',
      title: 'Học Tiếp Chuyên Ngành MBA - Ưu Đãi Tái Tục & Nâng Băng',
      description: 'Đặc quyền dành riêng cho học viên đã hoàn thành Giai đoạn Cơ sở MBA: Tặng voucher trực tiếp 3.000.000 VNĐ khi đăng ký học phần Chuyên ngành.',
      badge: 'VOUCHER 3TR',
      type: 'UPSELL',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      bannerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
      facilityId: facilityBT.id,
      items: {
        create: [
          {
            productCode: 'MBA-ADVANCED-MGMT-PROMO',
            courseId: courseMBAAdv.id,
            name: 'MBA Chuyên ngành Quản trị Chiến lược & Đổi mới',
            title: 'MBA Advanced Management',
            description: 'Đặc quyền học viên MBA: Tặng ngay voucher 3.000.000 VNĐ + Suất tham gia Hội thảo Quản trị Đổi mới sáng tạo Quốc tế.',
            imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
            listPrice: 32000000,
            salePrice: 29000000,
            discountPercent: 9.4,
            stock: 10,
            featured: true,
            orderIndex: 1,
            targetAudience: 'ADULT_MBA',
            primaryBtnLabel: 'Đăng ký ngay',
            primaryBtnMsg: 'Tôi muốn áp dụng voucher 3 triệu đăng ký khóa MBA Chuyên ngành Quản trị Chiến lược',
            secondaryBtnLabel: 'Xem lộ trình',
            secondaryBtnMsg: 'Gửi cho tôi thông tin chi tiết lộ trình môn học MBA Chuyên ngành'
          }
        ]
      }
    }
  })

  const campCrossSell1on1 = await prisma.campaign.create({
    data: {
      code: 'CAMP-CROSS-SELL-1ON1',
      title: 'Khắc Phục Kỹ Năng Yếu - Bổ Trợ Giao Tiếp 1:1 Cấp Tốc',
      description: 'Khóa học kèm riêng 1:1 giải quyết dứt điểm rào cản phát âm và phản xạ Speaking cho các bé điểm Speaking/Listening chưa đạt chuẩn.',
      badge: 'GIẢM 25%',
      type: 'PROMOTION',
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      bannerUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
      facilityId: facilityBT.id,
      items: {
        create: [
          {
            productCode: 'ENG-SPEAK-1ON1-PROMO',
            courseId: courseSpeak1on1.id,
            name: 'Lớp Bổ Trợ Phát Âm & Phản Xạ Giao Tiếp 1:1',
            title: 'Kèm Riêng 1:1 Phản Xạ',
            description: 'Giảm 25% học phí cho học viên đang theo học. Kèm riêng với giáo viên bản ngữ, chỉnh phát âm IPA và tăng phản xạ nói tự nhiên.',
            imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80',
            listPrice: 3600000,
            salePrice: 2700000,
            discountPercent: 25,
            stock: 6,
            featured: true,
            orderIndex: 1,
            targetAudience: 'KIDS',
            primaryBtnLabel: 'Nhận ưu đãi 25%',
            primaryBtnMsg: 'Tôi muốn nhận ưu đãi giảm 25% cho Lớp Bổ Trợ Phát Âm & Phản Xạ Giao Tiếp 1:1',
            secondaryBtnLabel: 'Xem chi tiết',
            secondaryBtnMsg: 'Tư vấn cho tôi lịch học kèm 1:1 bổ trợ kỹ năng Nói'
          }
        ]
      }
    }
  })

  // 15. Activity Logs
  console.log('Generating activity logs...')
  await prisma.activityLog.create({
    data: {
      userId: adminUser.id,
      role: 'ADMIN',
      action: 'INIT_STREAMLINED_DATABASE',
      entityType: 'SYSTEM',
      entityId: 'SYSTEM-001',
      details: JSON.stringify({ message: 'Khởi tạo seed data rút gọn theo 5 kịch bản kiểm thử CSKH.' }),
      source: 'SYSTEM'
    }
  })

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2)
  console.log(`\n✅ Streamlined Seeding complete in ${durationSec}s!`)
  console.log(`📊 Total summary:`)
  console.log(`   - Facilities: 3 (Cầu Giấy, Bình Thạnh, Quận 7)`)
  console.log(`   - Courses: 5 (MBA Base, MBA Adv, Movers, Flyers, Speaking 1:1)`)
  console.log(`   - Classes: 8`)
  console.log(`   - Parents: 5`)
  console.log(`   - Students: 7`)
  console.log(`   - Schedules: 10`)
  console.log(`   - Orders: 4`)
  console.log(`   - Support Requests: 3`)
  console.log(`   - Leads: 3`)
  console.log(`   - Campaigns: 3`)
  console.log(`   - Promotional Products: 4`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
