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


type UpdatePersonBody = {
  name?: unknown;
  avatarInitials?: unknown;
  departmentId?: unknown;
  role?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  return withApiErrors(async () => {
    const body = await readJsonBody<UpdatePersonBody>(request);
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

    const updated = await prisma.person.update({
      where: { id: params.id },
      data: {
        name,
        avatarInitials: avatarInitials ?? name.slice(0, 2).toUpperCase(),
        departmentId,
        role,
      },
    });
    return apiOk(toPerson(updated));
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return withApiErrors(async () => {
    const [taskCount, meetingCount] = await Promise.all([
      prisma.task.count({ where: { assigneeId: params.id } }),
      prisma.meeting.count({ where: { hostId: params.id } }),
    ]);

    if (taskCount || meetingCount) {
      const parts = [
        taskCount ? `${taskCount} công việc đang phụ trách` : null,
        meetingCount ? `${meetingCount} cuộc họp đang chủ trì` : null,
      ].filter(Boolean);
      return apiError(
        409,
        `Người này còn ${parts.join(" và ")}. Hãy chuyển giao trước khi xoá.`,
      );
    }

    await prisma.person.delete({ where: { id: params.id } });
    return apiOk({ id: params.id });
  });
}
