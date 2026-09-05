import { prisma } from "@/lib/db";
import { toDepartment } from "@/lib/db-mappers";
import {
  apiError,
  apiOk,
  readJsonBody,
  requireString,
  withApiErrors,
} from "@/lib/api-helpers";

// Ghi dữ liệu / có tham số động — luôn chạy trên máy chủ, không cache tĩnh.
export const dynamic = "force-dynamic";

type CreateDepartmentBody = { name?: unknown };

export async function POST(request: Request) {
  return withApiErrors(async () => {
    const body = await readJsonBody<CreateDepartmentBody>(request);
    const name = requireString(body.name);
    if (!name) return apiError(400, "Vui lòng nhập tên bộ phận.");

    // So sánh không phân biệt hoa/thường trong JS thay vì dùng `mode: "insensitive"`
    // của Prisma — filter đó chỉ Postgres hỗ trợ, không chạy được trên SQLite
    // (engine dùng để kiểm thử cục bộ), nên tránh để hành vi giống hệt trên cả hai.
    const all = await prisma.department.findMany({ select: { name: true } });
    const duplicated = all.some(
      (item) => item.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicated) return apiError(409, "Đã có bộ phận trùng tên.");

    const created = await prisma.department.create({ data: { name } });
    return apiOk(toDepartment(created), 201);
  });
}
