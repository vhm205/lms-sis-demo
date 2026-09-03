import { createClient } from "@libsql/client";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_TURSO_AUTH_TOKEN;

async function syncTurso() {
  if (!tursoUrl) {
    console.error("❌ Error: TURSO_DATABASE_URL or DATABASE_TURSO_DATABASE_URL is not set.");
    console.log("👉 Please export TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running this script.");
    process.exit(1);
  }

  console.log(`Connecting to Turso: ${tursoUrl}...`);
  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  console.log("Creating/verifying database tables on Turso...");

  const ddlStatements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "facilityId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Facility" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "address" TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS "Room" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "capacity" INTEGER NOT NULL,
      "facilityId" TEXT NOT NULL,
      FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Course" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL UNIQUE,
      "type" TEXT NOT NULL,
      "targetAge" TEXT,
      "level" TEXT,
      "duration" INTEGER NOT NULL,
      "fee" REAL,
      "description" TEXT,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE'
    );`,
    `CREATE TABLE IF NOT EXISTS "Class" (
      "id" TEXT PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "courseId" TEXT NOT NULL,
      "teacherId" TEXT,
      "facilityId" TEXT NOT NULL,
      "capacity" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'ONGOING',
      FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Parent" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "phone" TEXT NOT NULL UNIQUE,
      "email" TEXT,
      "notes" TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS "Student" (
      "id" TEXT PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "dob" DATETIME,
      "phone" TEXT,
      "parentId" TEXT,
      "facilityId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("parentId") REFERENCES "Parent" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "_ClassToStudent" (
      "A" TEXT NOT NULL,
      "B" TEXT NOT NULL,
      FOREIGN KEY ("A") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("B") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "_ClassToStudent_AB_unique" ON "_ClassToStudent"("A", "B");`,
    `CREATE INDEX IF NOT EXISTS "_ClassToStudent_B_index" ON "_ClassToStudent"("B");`,
    `CREATE TABLE IF NOT EXISTS "Schedule" (
      "id" TEXT PRIMARY KEY,
      "classId" TEXT NOT NULL,
      "roomId" TEXT NOT NULL,
      "date" DATETIME NOT NULL,
      "duration" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
      FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Attendance" (
      "id" TEXT PRIMARY KEY,
      "scheduleId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "classId" TEXT NOT NULL,
      "status" TEXT NOT NULL,
      "note" TEXT,
      "updatedBy" TEXT,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("scheduleId") REFERENCES "Schedule" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_scheduleId_studentId_key" ON "Attendance"("scheduleId", "studentId");`,
    `CREATE TABLE IF NOT EXISTS "Assignment" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "score" REAL,
      "maxScore" REAL,
      "status" TEXT NOT NULL,
      "teacherNote" TEXT,
      "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Lead" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "courseId" TEXT,
      "facilityId" TEXT,
      "age" INTEGER,
      "source" TEXT,
      "status" TEXT NOT NULL DEFAULT 'NEW',
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "SupportRequest" (
      "id" TEXT PRIMARY KEY,
      "studentId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'NEW',
      "assigneeId" TEXT,
      "priority" TEXT NOT NULL DEFAULT 'NORMAL',
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "MakeUpRequest" (
      "id" TEXT PRIMARY KEY,
      "studentId" TEXT NOT NULL,
      "missedScheduleId" TEXT NOT NULL,
      "targetScheduleId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "TransferRequest" (
      "id" TEXT PRIMARY KEY,
      "studentId" TEXT NOT NULL,
      "fromClassId" TEXT NOT NULL,
      "toClassId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "ActivityLog" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT,
      "role" TEXT,
      "action" TEXT NOT NULL,
      "entityType" TEXT NOT NULL,
      "entityId" TEXT NOT NULL,
      "details" TEXT,
      "source" TEXT NOT NULL DEFAULT 'SYSTEM',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "studentId" TEXT,
      "parentName" TEXT NOT NULL,
      "parentPhone" TEXT NOT NULL,
      "courseId" TEXT NOT NULL,
      "facilityId" TEXT NOT NULL,
      "amount" REAL NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "Campaign" (
      "id" TEXT PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "badge" TEXT,
      "type" TEXT NOT NULL DEFAULT 'PROMOTION',
      "startDate" DATETIME NOT NULL,
      "endDate" DATETIME NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'ACTIVE',
      "bannerUrl" TEXT,
      "facilityId" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("facilityId") REFERENCES "Facility" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`,
    `CREATE TABLE IF NOT EXISTS "CampaignItem" (
      "id" TEXT PRIMARY KEY,
      "campaignId" TEXT NOT NULL,
      "courseId" TEXT,
      "productCode" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "title" TEXT,
      "description" TEXT NOT NULL,
      "imageUrl" TEXT NOT NULL,
      "listPrice" REAL NOT NULL,
      "salePrice" REAL NOT NULL,
      "discountPercent" REAL,
      "stock" INTEGER NOT NULL DEFAULT 10,
      "featured" BOOLEAN NOT NULL DEFAULT 0,
      "orderIndex" INTEGER NOT NULL DEFAULT 0,
      "targetAudience" TEXT,
      "primaryBtnLabel" TEXT DEFAULT 'Nhận voucher',
      "primaryBtnMsg" TEXT DEFAULT 'Tôi muốn nhận ưu đãi cho khóa {name}',
      "secondaryBtnLabel" TEXT DEFAULT 'Xem chi tiết',
      "secondaryBtnMsg" TEXT DEFAULT 'Tư vấn thêm cho tôi về khóa {name}',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );`
  ];

  for (const ddl of ddlStatements) {
    await client.execute(ddl);
  }

  console.log("✅ Turso schema synced successfully!");
}

syncTurso().catch((e) => {
  console.error("❌ Turso sync failed:", e);
  process.exit(1);
});
