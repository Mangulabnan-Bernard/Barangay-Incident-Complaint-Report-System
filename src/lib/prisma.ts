import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { mockPrisma } from "./mock-db";

// Use the in-memory mock "database" when there is no real DATABASE_URL
// (e.g. a Vercel demo deploy) or when USE_MOCK_DB is explicitly set. Otherwise
// connect to MySQL through the Prisma MariaDB driver adapter.
const useMock =
  process.env.USE_MOCK_DB === "true" || !process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createRealClient(): PrismaClient {
  const url = new URL(process.env.DATABASE_URL as string);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    connectionLimit: 5,
  });
  return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = useMock
  ? (mockPrisma as unknown as PrismaClient)
  : globalForPrisma.prisma ?? createRealClient();

if (!useMock && process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
