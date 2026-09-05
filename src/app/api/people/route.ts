import { prisma } from "@/lib/db";
import { toPerson } from "@/lib/db-mappers";
import {
  apiError,
  apiOk,
  readJsonBody,
  requireEnum,
  requireString,
  withApiErrors,
} from "@/lib/api-helpers";
import { PERSON_ROLES } from "@/types";

// Ghi dữ liệu / có tham số động — luôn chạy trên máy chủ, không cache tĩnh.
export const dynamic = "force-dynamic";


type CreatePersonBody = {
  name?: unknown;
  avatarInitials?: unknown;
  departmentId?: unknown;
  role?: unknown;
};

export async function POST(request: Request) {
  return withApiErrors(async () => {
    const body = await readJsonBody<CreatePersonBody>(request);
    const name = requireString(body.name);
    const avatarInitials = requireString(body.avatarInitials);
    const departmentId = requireString(body.departmentId);
    const role = requireEnum(body.role, PERSON_ROLES);

    if (!name) return apiError(400, "Vui lòng nhập họ tên.");
    if (!departmentId) return apiError(400, "Vui lòng chọn bộ phận.");
    if (!role) return apiError(400, "Vai trò không hợp lệ.");

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });
    if (!department) return apiError(400, "Bộ phận không tồn tại.");

    const created = await prisma.person.create({
      data: {
        name,
        avatarInitials: avatarInitials ?? name.slice(0, 2).toUpperCase(),
        departmentId,
        role,
      },
    });
    return apiOk(toPerson(created), 201);
  });
}
