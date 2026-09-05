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

type UpdateDepartmentBody = { name?: unknown };

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  return withApiErrors(async () => {
    const body = await readJsonBody<UpdateDepartmentBody>(request);
    const name = requireString(body.name);
    if (!name) return apiError(400, "Vui lòng nhập tên bộ phận.");

    const all = await prisma.department.findMany({ select: { id: true, name: true } });
    const duplicated = all.some(
      (item) =>
        item.id !== params.id && item.name.trim().toLowerCase() === name.toLowerCase(),
    );
    if (duplicated) return apiError(409, "Đã có bộ phận trùng tên.");

    const updated = await prisma.department.update({
      where: { id: params.id },
      data: { name },
    });
    return apiOk(toDepartment(updated));
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return withApiErrors(async () => {
    const [peopleCount, meetingCount, taskCount] = await Promise.all([
      prisma.person.count({ where: { departmentId: params.id } }),
      prisma.meeting.count({ where: { departmentId: params.id } }),
      prisma.task.count({ where: { departmentId: params.id } }),
    ]);

    if (peopleCount || meetingCount || taskCount) {
      const parts = [
        peopleCount ? `${peopleCount} nhân sự` : null,
        meetingCount ? `${meetingCount} cuộc họp` : null,
        taskCount ? `${taskCount} công việc` : null,
      ].filter(Boolean);
      return apiError(
        409,
        `Bộ phận này còn ${parts.join(", ")}. Hãy chuyển hoặc xoá dữ liệu liên quan trước.`,
      );
    }

    await prisma.department.delete({ where: { id: params.id } });
    return apiOk({ id: params.id });
  });
}
