import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function getDatabaseUrl(): string | undefined {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    const srcDb = path.join(process.cwd(), "prisma", "dev.db");
    if (!fs.existsSync(/*turbopackIgnore: true*/ tmpDbPath)) {
      if (fs.existsSync(/*turbopackIgnore: true*/ srcDb)) {
        try {
          fs.copyFileSync(srcDb, tmpDbPath);
        } catch (e) {
          console.error("Failed to copy db to /tmp:", e);
        }
      }
    }
    return "file:/tmp/dev.db";
  }

  return process.env.DATABASE_URL || "file:./dev.db";
}

const prismaClientSingleton = () => {
  const dbUrl = getDatabaseUrl();
  return new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

