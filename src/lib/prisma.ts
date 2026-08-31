import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import fs from "fs";
import path from "path";

function getTursoClient(): PrismaClient | null {
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_TURSO_DATABASE_URL;
  const tursoAuthToken =
    process.env.TURSO_AUTH_TOKEN ||
    process.env.DATABASE_TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    try {
      const adapter = new PrismaLibSql({
        url: tursoUrl,
        authToken: tursoAuthToken,
      });
      return new PrismaClient({ adapter });
    } catch (e) {
      console.error("Failed to initialize Turso libSQL client:", e);
    }
  }
  return null;
}

function getLocalDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    const srcDb = path.join(process.cwd(), "prisma", "dev.db");
    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(srcDb)) {
        try {
          fs.copyFileSync(srcDb, tmpDbPath);
        } catch (e) {
          console.error("Failed to copy db to /tmp:", e);
        }
      }
    }
    return "file:/tmp/dev.db";
  }

  // Ensure absolute path so SQLite doesn't resolve to relative chunk dirs with read-only locks
  const localDb = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${localDb}`;
}

const prismaClientSingleton = () => {
  // 1. Prioritize Turso cloud database if configured
  const tursoPrisma = getTursoClient();
  if (tursoPrisma) {
    return tursoPrisma;
  }

  // 2. Fallback to SQLite (local / /tmp)
  const dbUrl = getLocalDatabaseUrl();
  return new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
