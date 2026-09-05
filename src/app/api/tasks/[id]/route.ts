import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { toTask } from "@/lib/db-mappers";
import {
  apiError,
  apiOk,
  optionalString,
  readJsonBody,
  requireEnum,
  requireInt,
  requireIsoDate,
  requireString,
  withApiErrors,
} from "@/lib/api-helpers";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/types";

// Ghi dữ liệu / có tham số động — luôn chạy trên máy chủ, không cache tĩnh.
export const dynamic = "force-dynamic";


type UpdateTaskBody = {
  meetingId?: unknown;
  title?: unknown;
  description?: unknown;
  assigneeId?: unknown;
  departmentId?: unknown;
  dueDate?: unknown;
  priority?: unknown;
  status?: unknown;
  progress?: unknown;
};

/**
 * Cập nhật từng phần — task-status-menu.tsx chỉ gửi { status, progress } khi
 * đổi trạng thái nhanh, nên route này chỉ validate những trường thật sự có
 * mặt trong body thay vì bắt buộc gửi đủ toàn bộ Task.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  return withApiErrors(async () => {
    const body = await readJsonBody<UpdateTaskBody>(request);
    const data: Prisma.TaskUpdateInput = {};

    if ("title" in body) {
      const title = requireString(body.title);
      if (!title) return apiError(400, "Vui lòng nhập tiêu đề công việc.");
      data.title = title;
    }
    if ("description" in body) {
      const description = optionalString(body.description);
      if (description === null) return apiError(400, "Mô tả không hợp lệ.");
      data.description = description;
    }
    if ("dueDate" in body) {
      const dueDate = requireIsoDate(body.dueDate);
      if (!dueDate) return apiError(400, "Hạn chót không hợp lệ.");
      data.dueDate = dueDate;
    }
    if ("priority" in body) {
      const priority = requireEnum(body.priority, TASK_PRIORITIES);
      if (!priority) return apiError(400, "Độ ưu tiên không hợp lệ.");
      data.priority = priority;
    }
    if ("status" in body) {
      const status = requireEnum(body.status, TASK_STATUSES);
      if (!status) return apiError(400, "Trạng thái không hợp lệ.");
      data.status = status;
    }
    if ("progress" in body) {
      const progress = requireInt(body.progress, 0, 100);
      if (progress === null) return apiError(400, "Tiến độ phải trong khoảng 0–100.");
      data.progress = progress;
    }
    if ("assigneeId" in body) {
      const assigneeId = requireString(body.assigneeId);
      if (!assigneeId) return apiError(400, "Vui lòng chọn người phụ trách.");
      const assignee = await prisma.person.findUnique({ where: { id: assigneeId } });
      if (!assignee) return apiError(400, "Người phụ trách không tồn tại.");
      data.assignee = { connect: { id: assigneeId } };
    }
    if ("departmentId" in body) {
      const departmentId = requireString(body.departmentId);
      if (!departmentId) return apiError(400, "Vui lòng chọn bộ phận.");
      data.department = { connect: { id: departmentId } };
    }
    if ("meetingId" in body) {
      const raw = body.meetingId;
      if (raw === null || raw === undefined) {
        data.meeting = { disconnect: true };
      } else {
        const meetingId = requireString(raw);
        if (!meetingId) return apiError(400, "Cuộc họp liên quan không hợp lệ.");
        const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
        if (!meeting) return apiError(400, "Cuộc họp liên quan không tồn tại.");
        data.meeting = { connect: { id: meetingId } };
      }
    }

    const updated = await prisma.task.update({ where: { id: params.id }, data });
    return apiOk(toTask(updated));
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return withApiErrors(async () => {
    await prisma.task.delete({ where: { id: params.id } });
    return apiOk({ id: params.id });
  });
}
