import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client dùng chung cho toàn bộ route handler.
 * Giữ instance trên `globalThis` ở môi trường dev để hot-reload không tạo
 * hàng trăm kết nối mới mỗi lần Next.js biên dịch lại — mẫu chuẩn của Prisma
 * cho Next.js App Router.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
