import { prisma } from "@/lib/prisma";

export type ReportType = "ACADEMIC_RESULTS" | "PROGRESS_OVERVIEW";

export interface StudentReportAcademicData {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  performanceTier: "XUẤT SẮC" | "GIỎI" | "KHÁ" | "TRUNG BÌNH" | "CẦN CẢI THIỆN";
  scoreTrend: "IMPROVING" | "STABLE" | "DECLINING";
  scoreTrendLabel: string;
  passRate: number;
  distinctionRate: number;
  assignments: Array<{
    id: string;
    title: string;
    date: string;
    score: number | null;
    maxScore: number;
    percentage: number | null;
    status: string;
    teacherNote: string | null;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  teacherSynthesis: string;
  nextGoals: string[];
}

export interface StudentReportProgressData {
  totalSessions: number;
  completedSessions: number;
  progressPercentage: number;
  attendanceRate: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceTier: "RẤT TỐT" | "TỐT" | "TRUNG BÌNH" | "CẦN LƯU Ý";
  submissionRate: number;
  openSupportRequestsCount: number;
  makeupRequestsCount: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskAssessment: {
    hasAttendanceRisk: boolean;
    hasLearningRisk: boolean;
    hasEngagementRisk: boolean;
    signals: string[];
  };
  recentAttendances: Array<{
    id: string;
    date: string;
    className: string;
    courseName: string;
    roomName: string | null;
    status: string;
    note: string | null;
  }>;
  overallStatusSummary: string;
  recommendedInterventions: string[];
}

export interface GeneratedStudentReport {
  id: string;
  type: ReportType;
  typeName: string;
  title: string;
  generatedAt: string;
  validUntil: string;
  student: {
    id: string;
    code: string;
    name: string;
    dob: string | null;
    phone: string | null;
    status: string;
    facility: {
      id: string;
      name: string;
      address: string;
    };
    parent: {
      id: string;
      name: string;
      phone: string;
      email: string | null;
    } | null;
    classes: Array<{
      id: string;
      code: string;
      name: string;
      courseName: string;
      courseCode: string;
      teacherName: string | null;
    }>;
  };
  academic?: StudentReportAcademicData;
  progress?: StudentReportProgressData;
  summaryText: string;
  shortHighlights: string[];
  previewUrl: string;
  pdfUrl: string;
}

/**
 * Normalizes input report type string (handles English and Vietnamese aliases)
 */
export function normalizeReportType(typeInput?: string): ReportType {
  if (!typeInput) return "ACADEMIC_RESULTS";
  const normalized = typeInput.toUpperCase().trim();
  if (
    normalized.includes("OVERVIEW") ||
    normalized.includes("PROGRESS") ||
    normalized.includes("TONG_QUAN") ||
    normalized.includes("TỔNG QUAN") ||
    normalized.includes("TIEN_DO") ||
    normalized.includes("TIẾN ĐỘ") ||
    normalized.includes("TINH_HINH") ||
    normalized.includes("TÌNH HÌNH") ||
    normalized === "2"
  ) {
    return "PROGRESS_OVERVIEW";
  }
  return "ACADEMIC_RESULTS";
}

/**
 * Generates full student report data given an identifier and type
 */
export async function generateStudentReport(
  studentIdentifier: string,
  rawType: string = "ACADEMIC_RESULTS",
  options?: {
    baseUrl?: string;
    token?: string;
  }
): Promise<GeneratedStudentReport> {
  const type = normalizeReportType(rawType);
  const identifier = studentIdentifier?.trim();

  if (!identifier) {
    throw new Error("Mã hoặc ID học viên không được để trống.");
  }

  // Find student with all relations
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { id: identifier },
        { code: identifier },
        { phone: identifier },
        { name: { contains: identifier } },
      ],
    },
    include: {
      facility: true,
      parent: true,
      classes: {
        include: {
          course: true,
          teacher: true,
        },
      },
      attendances: {
        include: {
          schedule: {
            include: {
              room: true,
              class: {
                include: { course: true, teacher: true },
              },
            },
          },
        },
        orderBy: { schedule: { date: "desc" } },
        take: 30,
      },
      assignments: {
        orderBy: { date: "desc" },
        take: 30,
      },
      supportRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      makeUpRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!student) {
    throw new Error(`Không tìm thấy thông tin học viên với từ khóa: "${identifier}"`);
  }

  const generatedDate = new Date();
  const validUntilDate = new Date(generatedDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const reportId = `REP-${type === "ACADEMIC_RESULTS" ? "ACAD" : "PROG"}-${student.code}-${Date.now().toString(36).toUpperCase()}`;

  const hostBase = (options?.baseUrl || "").replace(/\/$/, "");
  const previewPath = `/reports/preview/${student.code}?type=${type === "ACADEMIC_RESULTS" ? "academic" : "overview"}&reportId=${reportId}`;
  const pdfPath = `/reports/preview/${student.code}?type=${type === "ACADEMIC_RESULTS" ? "academic" : "overview"}&reportId=${reportId}&print=true`;

  const previewUrl = hostBase ? `${hostBase}${previewPath}` : previewPath;
  const pdfUrl = hostBase ? `${hostBase}${pdfPath}` : pdfPath;

  const formattedClasses = student.classes.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    courseName: c.course.name,
    courseCode: c.course.code,
    teacherName: c.teacher?.name || null,
  }));

  // Build report based on requested type
  if (type === "ACADEMIC_RESULTS") {
    const rawAssignments = student.assignments || [];
    const graded = rawAssignments.filter((a) => a.score !== null && a.maxScore && a.maxScore > 0);
    const totalAssignments = rawAssignments.length;
    const completedAssignments = rawAssignments.filter((a) => a.status === "COMPLETED").length;
    const pendingAssignments = totalAssignments - completedAssignments;

    // Calculate score points converted to /10 base
    const scoresConverted = graded.map((a) => (Number(a.score) / Number(a.maxScore)) * 10);
    const avgScore = scoresConverted.length > 0
      ? Number((scoresConverted.reduce((sum, val) => sum + val, 0) / scoresConverted.length).toFixed(1))
      : 8.5; // default fallback if empty

    const highestScore = scoresConverted.length > 0 ? Number(Math.max(...scoresConverted).toFixed(1)) : avgScore;
    const lowestScore = scoresConverted.length > 0 ? Number(Math.min(...scoresConverted).toFixed(1)) : avgScore;

    const passCount = scoresConverted.filter((s) => s >= 5.0).length;
    const passRate = scoresConverted.length > 0 ? Math.round((passCount / scoresConverted.length) * 100) : 100;

    const distinctionCount = scoresConverted.filter((s) => s >= 8.0).length;
    const distinctionRate = scoresConverted.length > 0 ? Math.round((distinctionCount / scoresConverted.length) * 100) : 80;

    // Determine performance tier
    let performanceTier: StudentReportAcademicData["performanceTier"] = "GIỎI";
    if (avgScore >= 9.0) performanceTier = "XUẤT SẮC";
    else if (avgScore >= 8.0) performanceTier = "GIỎI";
    else if (avgScore >= 6.5) performanceTier = "KHÁ";
    else if (avgScore >= 5.0) performanceTier = "TRUNG BÌNH";
    else performanceTier = "CẦN CẢI THIỆN";

    // Trend calculation (compare recent half vs older half)
    let scoreTrend: StudentReportAcademicData["scoreTrend"] = "STABLE";
    let scoreTrendLabel = "Kết quả học tập ổn định qua các kỳ kiểm tra";
    if (scoresConverted.length >= 2) {
      const recent = scoresConverted[0];
      const older = scoresConverted[scoresConverted.length - 1];
      if (recent - older >= 0.5) {
        scoreTrend = "IMPROVING";
        scoreTrendLabel = "Có sự tiến bộ rõ rệt so với các bài kiểm tra đầu kỳ (+)";
      } else if (older - recent >= 0.8) {
        scoreTrend = "DECLINING";
        scoreTrendLabel = "Điểm số gần đây có chiều hướng giảm nhẹ, cần tập trung củng cố (-)";
      }
    }

    // Strengths and Improvement areas
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    const nextGoals: string[] = [];

    if (avgScore >= 8.0) {
      strengths.push("Nắm vững kiến thức nền tảng và phương pháp giải quyết bài tập nâng cao.");
      strengths.push("Tư duy phản xạ nhanh, hoàn thành tốt các bài kiểm tra định kỳ.");
    } else {
      strengths.push("Có tinh thần học hỏi, tiếp thu bài học tích cực trong giờ lên lớp.");
    }

    if (distinctionRate >= 60) {
      strengths.push(`Tỷ lệ bài đạt điểm Giỏi/Xuất sắc cao (${distinctionRate}% tổng số bài).`);
    }

    // Identify weak spots from teacher notes
    const teacherNotesWithIssues = rawAssignments
      .filter((a) => a.teacherNote && (a.teacherNote.includes("chú ý") || a.teacherNote.includes("cần") || a.teacherNote.includes("hạn")))
      .map((a) => a.teacherNote as string);

    if (teacherNotesWithIssues.length > 0) {
      areasForImprovement.push(teacherNotesWithIssues[0]);
    } else if (avgScore < 8.0) {
      areasForImprovement.push("Cần dành thêm thời gian luyện tập lại các dạng bài tập chuyên sâu tại nhà.");
    } else {
      areasForImprovement.push("Cần duy trì sự cẩn thận ở các câu hỏi logic/ngữ pháp chi tiết để tránh lỗi nhỏ.");
    }

    if (pendingAssignments > 0) {
      areasForImprovement.push(`Còn ${pendingAssignments} bài tập chưa hoàn thành hoặc chưa nộp đúng hạn.`);
    }

    nextGoals.push("Hoàn thành 100% các bài tập tự luyện và bài tập về nhà của tuần tới.");
    nextGoals.push(`Duy trì phong độ điểm số mục tiêu >= ${(Math.min(10, avgScore + 0.5)).toFixed(1)}/10 ở đợt kiểm tra kế tiếp.`);
    if (formattedClasses.length > 0) {
      nextGoals.push(`Chuẩn bị ôn tập cho kỳ thi đánh giá chuẩn đầu ra môn ${formattedClasses[0].courseName}.`);
    }

    // Teacher synthesis text
    const sampleTeacherRemarks = rawAssignments
      .filter((a) => a.teacherNote)
      .map((a) => a.teacherNote)
      .slice(0, 3);

    const teacherSynthesis = sampleTeacherRemarks.length > 0
      ? `Học viên ${student.name} có thái độ học tập tích cực. Điểm trung bình đạt ${avgScore}/10 (Xếp loại: ${performanceTier}). ${sampleTeacherRemarks.join(". ")}.`
      : `Học viên ${student.name} hoàn thành tốt các nội dung kiểm tra định kỳ với điểm trung bình ${avgScore}/10 (Xếp loại: ${performanceTier}). Em tiếp thu bài nhanh và tích cực tương tác.`;

    const formattedAssignments = rawAssignments.map((a) => {
      const scoreVal = a.score !== null ? Number(a.score) : null;
      const maxVal = a.maxScore ? Number(a.maxScore) : 10;
      const pct = scoreVal !== null ? Math.round((scoreVal / maxVal) * 100) : null;
      return {
        id: a.id,
        title: a.title,
        date: a.date.toISOString(),
        score: scoreVal,
        maxScore: maxVal,
        percentage: pct,
        status: a.status,
        teacherNote: a.teacherNote,
      };
    });

    const academicData: StudentReportAcademicData = {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      averageScore: avgScore,
      highestScore,
      lowestScore,
      performanceTier,
      scoreTrend,
      scoreTrendLabel,
      passRate,
      distinctionRate,
      assignments: formattedAssignments,
      strengths,
      areasForImprovement,
      teacherSynthesis,
      nextGoals,
    };

    const shortHighlights = [
      `Điểm trung bình: ${avgScore}/10 (Xếp loại: ${performanceTier})`,
      `Số bài kiểm tra đã hoàn thành: ${completedAssignments}/${totalAssignments}`,
      `Tỷ lệ đạt chuẩn (>=5.0): ${passRate}% | Điểm Giỏi (>=8.0): ${distinctionRate}%`,
      `Xu hướng: ${scoreTrendLabel}`,
    ];

    const summaryText = `Báo cáo Kết quả Học tập của học viên ${student.name} (${student.code}): Điểm trung bình đạt ${avgScore}/10 - Xếp loại ${performanceTier}. Đã hoàn thành ${completedAssignments}/${totalAssignments} bài tập/bài kiểm tra. Điểm cao nhất đạt ${highestScore}/10. ${scoreTrendLabel}.`;

    return {
      id: reportId,
      type: "ACADEMIC_RESULTS",
      typeName: "Báo cáo Kết quả Học tập",
      title: `Báo cáo Kết quả Học tập - ${student.name} (${student.code})`,
      generatedAt: generatedDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
      student: {
        id: student.id,
        code: student.code,
        name: student.name,
        dob: student.dob ? student.dob.toISOString() : null,
        phone: student.phone,
        status: student.status,
        facility: {
          id: student.facility.id,
          name: student.facility.name,
          address: student.facility.address,
        },
        parent: student.parent
          ? {
              id: student.parent.id,
              name: student.parent.name,
              phone: student.parent.phone,
              email: student.parent.email,
            }
          : null,
        classes: formattedClasses,
      },
      academic: academicData,
      summaryText,
      shortHighlights,
      previewUrl,
      pdfUrl,
    };
  } else {
    // PROGRESS_OVERVIEW
    const attendances = student.attendances || [];
    const totalAttendances = attendances.length;
    const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
    const lateCount = attendances.filter((a) => a.status === "LATE").length;
    const absentCount = attendances.filter((a) => a.status === "ABSENT").length;
    const excusedCount = attendances.filter((a) => a.status === "EXCUSED").length;

    const attendedCount = presentCount + lateCount;
    const attendanceRate = totalAttendances > 0 ? Math.round((attendedCount / totalAttendances) * 100) : 100;

    let attendanceTier: StudentReportProgressData["attendanceTier"] = "TỐT";
    if (attendanceRate >= 95) attendanceTier = "RẤT TỐT";
    else if (attendanceRate >= 85) attendanceTier = "TỐT";
    else if (attendanceRate >= 75) attendanceTier = "TRUNG BÌNH";
    else attendanceTier = "CẦN LƯU Ý";

    // Progress percentage
    const assignments = student.assignments || [];
    const completedAssignments = assignments.filter((a) => a.status === "COMPLETED").length;
    const submissionRate = assignments.length > 0 ? Math.round((completedAssignments / assignments.length) * 100) : 100;

    // Course session progress
    const totalCourseSessions = 24; // Default estimated duration
    const completedSessions = Math.max(totalAttendances, 1);
    const progressPercentage = Math.min(100, Math.round((completedSessions / totalCourseSessions) * 100));

    // Risk Assessment
    const riskSignals: string[] = [];
    const hasAttendanceRisk = attendanceRate < 80 || absentCount >= 2;
    const hasLearningRisk = assignments.some((a) => a.score !== null && Number(a.score) < 6.0);
    const hasEngagementRisk = submissionRate < 70;

    if (hasAttendanceRisk) {
      riskSignals.push(`Tỷ lệ vắng mặt: ${absentCount} buổi (Tỷ lệ chuyên cần hiện tại: ${attendanceRate}%).`);
    }
    if (hasLearningRisk) {
      riskSignals.push("Có bài kiểm tra dưới ngưỡng trung bình, cần ôn luyện bổ trợ.");
    }
    if (hasEngagementRisk) {
      riskSignals.push(`Tỷ lệ nộp bài tập về nhà chưa đạt yêu cầu (${submissionRate}%).`);
    }

    let riskLevel: StudentReportProgressData["riskLevel"] = "LOW";
    if (hasAttendanceRisk && hasLearningRisk) riskLevel = "HIGH";
    else if (hasAttendanceRisk || hasLearningRisk || hasEngagementRisk) riskLevel = "MEDIUM";

    const recommendedInterventions: string[] = [];
    if (hasAttendanceRisk) {
      recommendedInterventions.push("Trung tâm sẽ chủ động liên hệ hỗ trợ xếp lịch học bù cho các buổi nghỉ.");
    }
    if (hasEngagementRisk) {
      recommendedInterventions.push("Phụ huynh phối hợp nhắc nhở con hoàn thiện các bài tập trước giờ lên lớp.");
    }
    recommendedInterventions.push("Tiếp tục theo dõi sự tiến bộ và phản hồi sau mỗi chuyên đề học phần.");

    const overallStatusSummary = `Học viên ${student.name} hiện đang tham gia ${student.classes.length} lớp học tại ${student.facility.name}. Tỷ lệ chuyên cần đạt ${attendanceRate}% (${attendedCount}/${totalAttendances} buổi tham gia). Tiến độ hoàn thành khóa học đạt khoảng ${progressPercentage}%. Đánh giá chung: Học tập ổn định và duy trì tốt nền nếp lớp học.`;

    const recentAttendancesFormatted = attendances.slice(0, 10).map((att) => ({
      id: att.id,
      date: att.schedule?.date ? att.schedule.date.toISOString() : new Date().toISOString(),
      className: att.schedule?.class?.name || "Lớp học",
      courseName: att.schedule?.class?.course?.name || "Khóa học",
      roomName: att.schedule?.room?.name || null,
      status: att.status,
      note: att.note,
    }));

    const progressData: StudentReportProgressData = {
      totalSessions: totalCourseSessions,
      completedSessions,
      progressPercentage,
      attendanceRate,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
      attendanceTier,
      submissionRate,
      openSupportRequestsCount: student.supportRequests.filter((s) => s.status !== "RESOLVED" && s.status !== "CLOSED").length,
      makeupRequestsCount: student.makeUpRequests.length,
      riskLevel,
      riskAssessment: {
        hasAttendanceRisk,
        hasLearningRisk,
        hasEngagementRisk,
        signals: riskSignals,
      },
      recentAttendances: recentAttendancesFormatted,
      overallStatusSummary,
      recommendedInterventions,
    };

    const shortHighlights = [
      `Tiến độ khóa học: ${progressPercentage}% (${completedSessions}/${totalCourseSessions} buổi)`,
      `Chuyên cần: ${attendanceRate}% (Có mặt: ${presentCount}, Đi muộn: ${lateCount}, Vắng: ${absentCount + excusedCount})`,
      `Tỷ lệ nộp bài tập: ${submissionRate}%`,
      `Trạng thái rủi ro: ${riskLevel === "LOW" ? "Tốt / Ổn định (Low Risk)" : riskLevel === "MEDIUM" ? "Cần chú ý (Medium Risk)" : "Cần can thiệp sớm (High Risk)"}`,
    ];

    const summaryText = `Báo cáo Tổng quan Quá trình của học viên ${student.name} (${student.code}): Chuyên cần đạt ${attendanceRate}% (${presentCount} buổi có mặt), tiến độ khóa học đạt ${progressPercentage}%. Tỷ lệ hoàn thành bài tập đạt ${submissionRate}%. Tình trạng hiện tại: ${riskLevel === "LOW" ? "Học tập ổn định, chấp hành tốt nội quy" : "Cần chú ý theo dõi chuyên cần và bài tập"}.`;

    return {
      id: reportId,
      type: "PROGRESS_OVERVIEW",
      typeName: "Báo cáo Tổng quan Quá trình & Tình hình Hiện tại",
      title: `Báo cáo Tổng quan Quá trình - ${student.name} (${student.code})`,
      generatedAt: generatedDate.toISOString(),
      validUntil: validUntilDate.toISOString(),
      student: {
        id: student.id,
        code: student.code,
        name: student.name,
        dob: student.dob ? student.dob.toISOString() : null,
        phone: student.phone,
        status: student.status,
        facility: {
          id: student.facility.id,
          name: student.facility.name,
          address: student.facility.address,
        },
        parent: student.parent
          ? {
              id: student.parent.id,
              name: student.parent.name,
              phone: student.parent.phone,
              email: student.parent.email,
            }
          : null,
        classes: formattedClasses,
      },
      progress: progressData,
      summaryText,
      shortHighlights,
      previewUrl,
      pdfUrl,
    };
  }
}
