import { prisma } from './src/lib/prisma'

// Seed helper random utilities
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const LAST_NAMES = [
  'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng',
  'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đoàn', 'Lâm', 'Trịnh'
]

const MIDDLE_MALE = ['Văn', 'Đức', 'Minh', 'Hải', 'Thanh', 'Quốc', 'Đình', 'Hoàng', 'Bảo', 'Tuấn', 'Trọng', 'Công', 'Gia', 'Hữu']
const MIDDLE_FEMALE = ['Thị', 'Ngọc', 'Thu', 'Mai', 'Anh', 'Phương', 'Khánh', 'Thùy', 'Hải', 'Bảo', 'Tuyết', 'Diệu', 'Yến', 'Quỳnh']

const FIRST_MALE = [
  'An', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Hải', 'Hiếu', 'Hoàng', 'Hùng', 'Huy',
  'Khánh', 'Khoa', 'Long', 'Minh', 'Nam', 'Nghĩa', 'Phong', 'Phúc', 'Quân', 'Quang',
  'Sơn', 'Tân', 'Thắng', 'Thịnh', 'Trung', 'Tuấn', 'Tùng', 'Việt', 'Vinh', 'Vũ'
]

const FIRST_FEMALE = [
  'Anh', 'Bích', 'Châu', 'Chi', 'Dung', 'Duyên', 'Giang', 'Hà', 'Hạnh', 'Hoa',
  'Hương', 'Lan', 'Linh', 'Mai', 'My', 'Nga', 'Ngân', 'Ngọc', 'Nhi', 'Như',
  'Phương', 'Quỳnh', 'Tâm', 'Thảo', 'Trang', 'Trâm', 'Uyên', 'Vân', 'Vy', 'Yến'
]

function generateFullName(gender?: 'M' | 'F'): { name: string; isMale: boolean } {
  const isMale = gender !== undefined ? gender === 'M' : Math.random() > 0.5
  const lastName = randomItem(LAST_NAMES)
  const middleName = isMale ? randomItem(MIDDLE_MALE) : randomItem(MIDDLE_FEMALE)
  const firstName = isMale ? randomItem(FIRST_MALE) : randomItem(FIRST_FEMALE)
  return { name: `${lastName} ${middleName} ${firstName}`, isMale }
}

function generatePhone(index: number): string {
  const prefixes = ['090', '091', '092', '093', '094', '096', '097', '098', '086', '088', '089', '077', '078', '079']
  const prefix = prefixes[index % prefixes.length]
  const suffix = String(1000000 + (index * 137 + randomInt(1, 99)) % 9000000).slice(1)
  return `${prefix}${suffix}`
}

async function main() {
  console.log('🚀 Starting deep database seed with 1,000+ student records...')
  const startTime = Date.now()

  // 1. Clear existing data in correct dependency order
  console.log('Cleaning old data...')
  await prisma.activityLog.deleteMany()
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

  // 2. Facilities
  console.log('Creating facilities...')
  const facilities = await Promise.all([
    prisma.facility.create({
      data: { id: 'facility-cau-giay', name: 'Cơ sở Cầu Giấy', address: '123 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội' }
    }),
    prisma.facility.create({
      data: { id: 'facility-binh-thanh', name: 'Cơ sở Bình Thạnh', address: '456 Điện Biên Phủ, Phường 25, Bình Thạnh, TP.HCM' }
    }),
    prisma.facility.create({
      data: { id: 'facility-hai-chau', name: 'Cơ sở Hải Châu', address: '789 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng' }
    })
  ])

  const [facilityHN, facilityHCM, facilityDN] = facilities

  // 3. Rooms (6 rooms per facility = 18 rooms total)
  console.log('Creating rooms...')
  const roomData = [
    // HN
    { name: 'Phòng 101 (Lab A)', capacity: 25, facilityId: facilityHN.id },
    { name: 'Phòng 102 (Smart Room)', capacity: 20, facilityId: facilityHN.id },
    { name: 'Phòng 201 (Kids Active)', capacity: 16, facilityId: facilityHN.id },
    { name: 'Phòng 202 (IELTS Studio)', capacity: 18, facilityId: facilityHN.id },
    { name: 'Phòng 301 (Hội trường)', capacity: 40, facilityId: facilityHN.id },
    { name: 'Phòng 302 (Coding Lab)', capacity: 22, facilityId: facilityHN.id },
    // HCM
    { name: 'Phòng S-101 (Creative)', capacity: 20, facilityId: facilityHCM.id },
    { name: 'Phòng S-102 (Language Hub)', capacity: 25, facilityId: facilityHCM.id },
    { name: 'Phòng S-201 (Kids Junior)', capacity: 18, facilityId: facilityHCM.id },
    { name: 'Phòng S-202 (IELTS Master)', capacity: 15, facilityId: facilityHCM.id },
    { name: 'Phòng S-301 (STEM Workshop)', capacity: 24, facilityId: facilityHCM.id },
    { name: 'Phòng S-302 (Seminar Room)', capacity: 35, facilityId: facilityHCM.id },
    // DN
    { name: 'Phòng D-101 (General)', capacity: 20, facilityId: facilityDN.id },
    { name: 'Phòng D-102 (Kids Wonder)', capacity: 16, facilityId: facilityDN.id },
    { name: 'Phòng D-201 (IELTS Intensive)', capacity: 18, facilityId: facilityDN.id },
    { name: 'Phòng D-202 (Math & Logic)', capacity: 22, facilityId: facilityDN.id },
    { name: 'Phòng D-301 (Tech Lab)', capacity: 20, facilityId: facilityDN.id },
  ]
  const rooms = await Promise.all(roomData.map(r => prisma.room.create({ data: r })))

  // 4. Users (Admin, Teachers, Sales, CS, Managers)
  console.log('Creating system users...')
  const users = await Promise.all([
    prisma.user.create({ data: { name: 'Nguyễn Văn Admin', email: 'admin@educenter.vn', role: 'ADMIN' } }),
    prisma.user.create({ data: { name: 'Hoàng Minh Giám Đốc', email: 'manager@educenter.vn', role: 'MANAGER' } }),
    // Teachers HN
    prisma.user.create({ data: { name: 'Trần Thị Mai Anh', email: 'teacher.maianh@educenter.vn', role: 'TEACHER', facilityId: facilityHN.id } }),
    prisma.user.create({ data: { name: 'Nguyễn Quốc Tuấn', email: 'teacher.tuannq@educenter.vn', role: 'TEACHER', facilityId: facilityHN.id } }),
    prisma.user.create({ data: { name: 'Sarah Wilson', email: 'sarah.w@educenter.vn', role: 'TEACHER', facilityId: facilityHN.id } }),
    // Teachers HCM
    prisma.user.create({ data: { name: 'Lê Văn Hoàng Long', email: 'teacher.longlvh@educenter.vn', role: 'TEACHER', facilityId: facilityHCM.id } }),
    prisma.user.create({ data: { name: 'Phạm Quỳnh Nga', email: 'teacher.ngapq@educenter.vn', role: 'TEACHER', facilityId: facilityHCM.id } }),
    prisma.user.create({ data: { name: 'David Miller', email: 'david.m@educenter.vn', role: 'TEACHER', facilityId: facilityHCM.id } }),
    // Teachers DN
    prisma.user.create({ data: { name: 'Đặng Thảo Vy', email: 'teacher.vydt@educenter.vn', role: 'TEACHER', facilityId: facilityDN.id } }),
    prisma.user.create({ data: { name: 'Bùi Hải Đăng', email: 'teacher.dangbh@educenter.vn', role: 'TEACHER', facilityId: facilityDN.id } }),
    // Sales & CS
    prisma.user.create({ data: { name: 'Phạm Thị Tư Vấn HN', email: 'sales.hn@educenter.vn', role: 'SALES', facilityId: facilityHN.id } }),
    prisma.user.create({ data: { name: 'Vũ Đức Thịnh Sales HCM', email: 'sales.hcm@educenter.vn', role: 'SALES', facilityId: facilityHCM.id } }),
    prisma.user.create({ data: { name: 'Trương Ngọc Lan Sales ĐN', email: 'sales.dn@educenter.vn', role: 'SALES', facilityId: facilityDN.id } }),
    prisma.user.create({ data: { name: 'Hoàng Văn CSKH 1', email: 'cs1@educenter.vn', role: 'CS', facilityId: facilityHN.id } }),
    prisma.user.create({ data: { name: 'Đỗ Thị Minh Châu CSKH 2', email: 'cs2@educenter.vn', role: 'CS', facilityId: facilityHCM.id } })
  ])

  const teachers = users.filter(u => u.role === 'TEACHER')
  const teachersHN = teachers.filter(t => t.facilityId === facilityHN.id)
  const teachersHCM = teachers.filter(t => t.facilityId === facilityHCM.id)
  const teachersDN = teachers.filter(t => t.facilityId === facilityDN.id)

  // 5. Courses (12 diverse courses)
  console.log('Creating courses...')
  const coursesData = [
    { code: 'ENG-KIDS-STARTER', name: 'Tiếng Anh Mầm Non (Kindy Stars)', type: 'Tiếng Anh thiếu nhi', targetAge: '4-6', duration: 24, fee: 3200000, description: 'Phát triển phản xạ tự nhiên qua bài hát, vận động và Flashcard sinh động.' },
    { code: 'ENG-CAM-MOVERS', name: 'Cambridge Movers Chuẩn Quốc Tế', type: 'Tiếng Anh thiếu nhi', targetAge: '7-9', duration: 32, fee: 4500000, description: 'Trang bị 4 kỹ năng Nghe - Nói - Đọc - Viết theo chuẩn Cambridge Young Learners.' },
    { code: 'ENG-CAM-FLYERS', name: 'Cambridge Flyers Bứt Phá', type: 'Tiếng Anh thiếu nhi', targetAge: '10-12', duration: 32, fee: 4800000, description: 'Chinh phục chứng chỉ A2 Flyers, chuẩn bị nền tảng chuyển cấp.' },
    { code: 'IELTS-FOU-45', name: 'IELTS Foundation (3.5 - 4.5)', type: 'Luyện thi IELTS', targetAge: '13-18', duration: 36, fee: 6500000, description: 'Xây dựng nền tảng ngữ pháp chuyên sâu và phát âm chuẩn IPA.' },
    { code: 'IELTS-INT-65', name: 'IELTS Intensive Target 6.5+', type: 'Luyện thi IELTS', targetAge: '15+', duration: 40, fee: 8500000, description: 'Chiến thuật giải đề Writing Task 2 và Speaking Part 2-3 nâng band nhanh.' },
    { code: 'IELTS-MAS-75', name: 'IELTS Master Target 7.5+', type: 'Luyện thi IELTS', targetAge: '16+', duration: 48, fee: 12000000, description: 'Lớp chuyên gia luyện tư duy phản biện và từ vựng C1-C2 cao cấp.' },
    { code: 'MATH-SINGAPORE-1', name: 'Toán Tư Duy Singapore Lớp 1-2', type: 'Toán tư duy', targetAge: '6-8', duration: 24, fee: 3500000, description: 'Phương pháp CPA (Concrete - Pictorial - Abstract) kích thích tư duy logic.' },
    { code: 'MATH-OLYMPIAD', name: 'Toán Olympic & Phân Tích Logic', type: 'Toán tư duy', targetAge: '9-12', duration: 30, fee: 4200000, description: 'Bồi dưỡng học sinh giỏi chuẩn bị cho các kỳ thi Kangaroo, TIMO, SASMO.' },
    { code: 'CODE-SCRATCH-JUNIOR', name: 'Lập Trình Scratch & Game 2D', type: 'Lập trình & STEM', targetAge: '8-11', duration: 20, fee: 3800000, description: 'Khám phá tư duy lập trình kéo thả và sáng tạo trò chơi tương tác.' },
    { code: 'CODE-PYTHON-AI', name: 'Python Lập Trình & Ứng Dụng AI', type: 'Lập trình & STEM', targetAge: '12-16', duration: 30, fee: 5200000, description: 'Làm quen ngôn ngữ Python, xử lý dữ liệu và thuật toán AI cơ bản.' },
    { code: 'ENG-COMM-BUSINESS', name: 'Tiếng Anh Giao Tiếp Doanh Nghiệp', type: 'Tiếng Anh giao tiếp', targetAge: '18+', duration: 24, fee: 4000000, description: 'Thực hành thuyết trình, đàm phán và viết Email thương mại chuẩn chỉnh.' },
    { code: 'SAT-DIGITAL-CRACK', name: 'Luyện Thi Digital SAT 1400+', type: 'Luyện thi SAT', targetAge: '15-18', duration: 36, fee: 9800000, description: 'Bí quyết bứt phá điểm phần Math & Verbal trên nền tảng Digital SAT.' },
  ]
  const courses = await Promise.all(coursesData.map(c => prisma.course.create({ data: c })))

  // 6. Classes (48 classes distributed across facilities)
  console.log('Creating classes...')
  const classList: any[] = []
  let classIndex = 1

  for (const fac of [facilityHN, facilityHCM, facilityDN]) {
    const facPrefix = fac.id === facilityHN.id ? 'HN' : fac.id === facilityHCM.id ? 'HCM' : 'DN'
    const facTeachers = fac.id === facilityHN.id ? teachersHN : fac.id === facilityHCM.id ? teachersHCM : teachersDN

    for (let cIdx = 0; cIdx < courses.length; cIdx++) {
      const course = courses[cIdx]
      // Create 1-2 classes per course per facility
      const classCount = (cIdx % 2 === 0) ? 2 : 1
      for (let k = 1; k <= classCount; k++) {
        const classCode = `${facPrefix}-${course.code.split('-')[0]}-${String(classIndex).padStart(3, '0')}`
        const teacher = facTeachers[classIndex % facTeachers.length]
        const statuses = ['ONGOING', 'ONGOING', 'ONGOING', 'COMPLETED', 'PAUSED']
        const status = statuses[classIndex % statuses.length]

        const createdClass = await prisma.class.create({
          data: {
            code: classCode,
            name: `Lớp ${course.name} (${facPrefix} - Nhóm ${k})`,
            courseId: course.id,
            teacherId: teacher.id,
            facilityId: fac.id,
            capacity: randomInt(15, 25),
            status: status
          }
        })
        classList.push(createdClass)
        classIndex++
      }
    }
  }

  console.log(`Created ${classList.length} active/ongoing classes.`)

  // 7. Parents (700 parents)
  console.log('Creating 700 parent records...')
  const parentData: { name: string; phone: string; email?: string; notes?: string }[] = []
  for (let i = 1; i <= 700; i++) {
    const { name } = generateFullName()
    const phone = generatePhone(i)
    const notesArr = [
      'Liên hệ qua Zalo buổi tối',
      'Phụ huynh quan tâm học phí đóng theo năm',
      'Đăng ký kèm xe đưa đón',
      'Ưu tiên xếp lớp cuối tuần',
      'Muốn nhận báo cáo học tập hàng tuần',
      null,
      null
    ]
    parentData.push({
      name: `PH. ${name}`,
      phone: phone,
      email: `parent${i}@gmail.com`,
      notes: randomItem(notesArr) || undefined
    })
  }

  // Insert parents in chunks
  const chunkSize = 100
  const createdParents: any[] = []
  for (let i = 0; i < parentData.length; i += chunkSize) {
    const chunk = parentData.slice(i, i + chunkSize)
    const res = await Promise.all(chunk.map(p => prisma.parent.create({ data: p })))
    createdParents.push(...res)
  }

  // 8. Students (Target: Exactly 1,000 students!)
  console.log('Creating 1,000 student records...')
  const studentData: any[] = []
  const TOTAL_STUDENTS = 1000

  for (let i = 1; i <= TOTAL_STUDENTS; i++) {
    const code = `HV${String(i).padStart(4, '0')}`
    const isMale = Math.random() > 0.48
    const { name } = generateFullName(isMale ? 'M' : 'F')
    
    // Facility distribution (45% HN, 35% HCM, 20% DN)
    let assignedFacility = facilityHN
    const randFac = Math.random()
    if (randFac < 0.45) assignedFacility = facilityHN
    else if (randFac < 0.80) assignedFacility = facilityHCM
    else assignedFacility = facilityDN

    // Parent mapping (each parent has 1-2 students)
    const parent = createdParents[i % createdParents.length]
    const dobYear = randomInt(2006, 2019)
    const dobMonth = randomInt(1, 12)
    const dobDay = randomInt(1, 28)
    const dob = new Date(`${dobYear}-${String(dobMonth).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`)
    
    // Status (88% ACTIVE, 12% INACTIVE)
    const status = Math.random() < 0.88 ? 'ACTIVE' : 'INACTIVE'
    const studentPhone = (dobYear <= 2008 && Math.random() > 0.3) ? generatePhone(2000 + i) : undefined

    studentData.push({
      code,
      name,
      dob,
      phone: studentPhone,
      parentId: parent.id,
      facilityId: assignedFacility.id,
      status
    })
  }

  // Insert students in chunks
  const createdStudents: any[] = []
  for (let i = 0; i < studentData.length; i += chunkSize) {
    const chunk = studentData.slice(i, i + chunkSize)
    const res = await Promise.all(chunk.map(s => prisma.student.create({ data: s })))
    createdStudents.push(...res)
  }

  console.log(`Created ${createdStudents.length} students successfully.`)

  // 9. Assign Students to Classes (Connecting relation)
  console.log('Assigning students to classes according to facility...')
  for (const s of createdStudents) {
    // Pick 1-2 classes in student's facility
    const eligibleClasses = classList.filter(c => c.facilityId === s.facilityId)
    if (eligibleClasses.length > 0) {
      const classToJoin = randomItem(eligibleClasses)
      try {
        await prisma.student.update({
          where: { id: s.id },
          data: {
            classes: { connect: { id: classToJoin.id } }
          }
        })
      } catch (e) {
        // Continue
      }
    }
  }

  // 10. Schedules & Attendances
  console.log('Generating schedules and attendances...')
  const schedulesToCreate: any[] = []
  
  for (let cIdx = 0; cIdx < classList.length; cIdx++) {
    const cls = classList[cIdx]
    const facRooms = rooms.filter(r => r.facilityId === cls.facilityId)
    const room = facRooms[cIdx % facRooms.length] || rooms[0]

    // Create 3 schedules per class (2 completed past, 1 upcoming)
    const dates = [
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + (cIdx % 5) * 3600000), // Past 1
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + (cIdx % 5) * 3600000), // Past 2
      new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + (cIdx % 5) * 3600000), // Upcoming
    ]

    for (let sIdx = 0; sIdx < dates.length; sIdx++) {
      const isPast = sIdx < 2
      const sched = await prisma.schedule.create({
        data: {
          classId: cls.id,
          roomId: room.id,
          date: dates[sIdx],
          duration: 90,
          status: isPast ? 'COMPLETED' : 'SCHEDULED'
        }
      })
      schedulesToCreate.push(sched)

      // If past schedule, create attendance records for some students
      if (isPast) {
        const studentsInFac = createdStudents.filter(st => st.facilityId === cls.facilityId).slice(0, 12)
        for (const st of studentsInFac) {
          const attendanceStatuses = ['PRESENT', 'PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED']
          const attStatus = randomItem(attendanceStatuses)
          const notes = attStatus === 'ABSENT' ? 'Bận việc riêng có phép' : attStatus === 'LATE' ? 'Đến muộn 10p' : null
          try {
            await prisma.attendance.create({
              data: {
                scheduleId: sched.id,
                studentId: st.id,
                classId: cls.id,
                status: attStatus,
                note: notes
              }
            })
          } catch {}
        }
      }
    }
  }

  // 11. Assignments (400+ assignment submissions)
  console.log('Generating assignments and scores...')
  const assignmentTitles = [
    'Bài tập kiểm tra giữa kỳ Unit 1-4',
    'Mini-Test Vocabulary & Collocations',
    'IELTS Speaking Part 2 Mock Practice',
    'Bài tập logic & Giải thuật tuần 3',
    'Listening Comprehension Section 2',
    'Reading Analysis & Short Summary',
    'Toán ứng dụng thực tế bài số 5'
  ]
  const sampleStudentsForAssignments = createdStudents.slice(0, 350)
  for (const st of sampleStudentsForAssignments) {
    const title = randomItem(assignmentTitles)
    const score = Number((randomInt(60, 100) / 10).toFixed(1))
    const status = Math.random() > 0.1 ? 'COMPLETED' : 'PENDING'
    const notes = [
      'Làm bài tốt, nắm chắc khái niệm',
      'Cần chú ý thêm ngữ pháp và dấu câu',
      'Tiến bộ rõ rệt so với bài trước',
      'Hoàn thành xuất sắc bài tập nâng cao',
      'Cần nộp đúng hạn hơn vào lần tới'
    ]
    await prisma.assignment.create({
      data: {
        title,
        studentId: st.id,
        score: status === 'COMPLETED' ? score : null,
        maxScore: 10,
        status,
        teacherNote: status === 'COMPLETED' ? randomItem(notes) : null,
        date: new Date(Date.now() - randomInt(1, 30) * 24 * 60 * 60 * 1000)
      }
    })
  }

  // 12. Leads (350+ leads across facilities)
  console.log('Generating 350 lead records...')
  const leadStatuses = ['NEW', 'CONTACTED', 'CONSULTING', 'TRIAL_BOOKED', 'TRIAL_DONE', 'ENROLLED', 'UNSUITABLE', 'UNREACHABLE']
  const leadSources = ['Facebook Ads', 'Google Search', 'Website Form', 'Giới thiệu từ học viên cũ', 'Hotline tư vấn', 'Tiktok Video', 'Sự kiện Open Day']

  for (let i = 1; i <= 350; i++) {
    const { name } = generateFullName()
    const assignedFac = (i % 3 === 0) ? facilityHN : (i % 3 === 1) ? facilityHCM : facilityDN
    const selectedCourse = randomItem(courses)
    const status = randomItem(leadStatuses)
    const source = randomItem(leadSources)
    const notes = [
      'Phụ huynh hỏi học phí và chính sách giảm giá 2 con',
      'Muốn học thử 1 buổi vào thứ 7',
      'Đã tư vấn lộ trình 6 tháng, hẹn chốt cuối tuần',
      'Học sinh lớp 11 muốn thi IELTS cấp tốc',
      'Chưa nghe máy, hẹn gọi lại sau 17h'
    ]

    await prisma.lead.create({
      data: {
        name: `Khách hàng ${name}`,
        phone: generatePhone(5000 + i),
        courseId: selectedCourse.id,
        facilityId: assignedFac.id,
        age: randomInt(5, 22),
        source: source,
        status: status,
        notes: randomItem(notes),
        createdAt: new Date(Date.now() - randomInt(0, 45) * 24 * 60 * 60 * 1000)
      }
    })
  }

  // 13. Orders (300+ orders)
  console.log('Generating 300 order records...')
  const orderStatuses = ['PAID', 'PAID', 'PAID', 'PENDING', 'CANCELLED']
  for (let i = 1; i <= 300; i++) {
    const student = createdStudents[i % createdStudents.length]
    const course = courses[i % courses.length]
    const assignedFac = facilities.find(f => f.id === student.facilityId) || facilityHN
    const status = randomItem(orderStatuses)
    const parentName = student.name ? `PH. ${student.name.split(' ').slice(0, 2).join(' ')}` : 'Phụ huynh'

    await prisma.order.create({
      data: {
        code: `ORD-2025-${String(i).padStart(4, '0')}`,
        studentId: student.id,
        parentName: parentName,
        parentPhone: generatePhone(7000 + i),
        courseId: course.id,
        facilityId: assignedFac.id,
        amount: course.fee || 3500000,
        status: status,
        notes: status === 'PAID' ? 'Đã thanh toán qua chuyển khoản VietQR' : 'Chờ phụ huynh xác nhận chuyển khoản',
        createdAt: new Date(Date.now() - randomInt(0, 60) * 24 * 60 * 60 * 1000)
      }
    })
  }

  // 14. Support Requests (120+ requests)
  console.log('Generating 120 support requests...')
  const requestTypes = ['LEAVE', 'INFO', 'SUPPORT', 'COMPLAINT', 'CALL_BACK']
  const requestStatuses = ['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const requestPriorities = ['LOW', 'NORMAL', 'HIGH']
  const supportContents = [
    'Xin phép nghỉ học buổi tới do gia đình có việc bận.',
    'Phụ huynh hỏi về thời gian thi kết thúc học phần và chứng nhận.',
    'Đăng ký đổi lịch học từ thứ 3-5 sang thứ 4-6.',
    'Phản ánh phòng học máy chiếu bị mờ.',
    'Cần tư vấn nâng band điểm kỹ năng Speaking trước kỳ thi thật.',
    'Yêu cầu cấp lại tài liệu và video ôn tập buổi học trước.'
  ]

  for (let i = 1; i <= 120; i++) {
    const student = createdStudents[i % createdStudents.length]
    await prisma.supportRequest.create({
      data: {
        studentId: student.id,
        type: randomItem(requestTypes),
        content: randomItem(supportContents),
        status: randomItem(requestStatuses),
        priority: randomItem(requestPriorities),
        notes: 'Đã phân công CS phụ trách xử lý trong ngày.',
        createdAt: new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000)
      }
    })
  }

  // 15. MakeUp & Transfer Requests
  console.log('Generating makeup & transfer requests...')
  for (let i = 1; i <= 60; i++) {
    const student = createdStudents[i % createdStudents.length]
    const missedSched = schedulesToCreate[(i * 2) % schedulesToCreate.length] || schedulesToCreate[0]
    const targetSched = schedulesToCreate[(i * 2 + 1) % schedulesToCreate.length] || schedulesToCreate[1]
    await prisma.makeUpRequest.create({
      data: {
        studentId: student.id,
        missedScheduleId: missedSched?.id || 'sched-1',
        targetScheduleId: targetSched?.id || 'sched-2',
        status: randomItem(['PENDING', 'APPROVED', 'REJECTED']),
        notes: 'Học sinh bù lớp cùng trình độ.'
      }
    })
  }

  for (let i = 1; i <= 40; i++) {
    const student = createdStudents[i % createdStudents.length]
    const c1 = classList[0]?.id || 'c1'
    const c2 = classList[1]?.id || 'c2'
    await prisma.transferRequest.create({
      data: {
        studentId: student.id,
        fromClassId: c1,
        toClassId: c2,
        status: randomItem(['PENDING', 'APPROVED', 'REJECTED']),
        notes: 'Phụ huynh xin chuyển ca học do trùng lịch học trên trường.'
      }
    })
  }

  // 16. Activity Logs
  console.log('Generating activity logs...')
  for (let i = 1; i <= 80; i++) {
    await prisma.activityLog.create({
      data: {
        userId: users[0].id,
        role: 'ADMIN',
        action: randomItem(['CREATE_STUDENT', 'UPDATE_ATTENDANCE', 'PROCESS_ORDER', 'ASSIGN_CLASS', 'AI_SYNC']),
        entityType: randomItem(['STUDENT', 'ATTENDANCE', 'ORDER', 'CLASS']),
        entityId: `entity-${i}`,
        details: JSON.stringify({ message: `Hoạt động hệ thống mẫu số ${i}`, timestamp: new Date() }),
        source: randomItem(['UI', 'API', 'AI_AGENT'])
      }
    })
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`✅ Seeding complete in ${durationSec}s!`)
  console.log(`📊 Total summary:`)
  console.log(`   - Facilities: 3`)
  console.log(`   - Courses: ${courses.length}`)
  console.log(`   - Classes: ${classList.length}`)
  console.log(`   - Parents: ${createdParents.length}`)
  console.log(`   - Students: ${createdStudents.length} (Goal: 1000)`)
  console.log(`   - Leads: 350`)
  console.log(`   - Orders: 300`)
  console.log(`   - Schedules: ${schedulesToCreate.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
