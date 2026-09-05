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


type CreateTaskBody = {
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

export async function POST(request: Request) {
  return withApiErrors(async () => {
    const body = await readJsonBody<CreateTaskBody>(request);
    const title = requireString(body.title);
    const description = optionalString(body.description);
    const assigneeId = requireString(body.assigneeId);
    const departmentId = requireString(body.departmentId);
    const dueDate = requireIsoDate(body.dueDate);
    const priority = requireEnum(body.priority, TASK_PRIORITIES);
    const status = requireEnum(body.status, TASK_STATUSES);
    const progress = requireInt(body.progress, 0, 100);
    const meetingId =
      body.meetingId === null || body.meetingId === undefined
        ? null
        : requireString(body.meetingId);

    if (!title) return apiError(400, "Vui lòng nhập tiêu đề công việc.");
    if (description === null) return apiError(400, "Mô tả không hợp lệ.");
    if (!assigneeId) return apiError(400, "Vui lòng chọn người phụ trách.");
    if (!departmentId) return apiError(400, "Vui lòng chọn bộ phận.");
    if (!dueDate) return apiError(400, "Hạn chót không hợp lệ.");
    if (!priority) return apiError(400, "Độ ưu tiên không hợp lệ.");
    if (!status) return apiError(400, "Trạng thái không hợp lệ.");
    if (progress === null) return apiError(400, "Tiến độ phải trong khoảng 0–100.");

    const assignee = await prisma.person.findUnique({ where: { id: assigneeId } });
    if (!assignee) return apiError(400, "Người phụ trách không tồn tại.");

    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
      if (!meeting) return apiError(400, "Cuộc họp liên quan không tồn tại.");
    }

    const created = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        departmentId,
        dueDate,
        priority,
        status,
        progress,
        meetingId,
      },
    });
    return apiOk(toTask(created), 201);
  });
}
