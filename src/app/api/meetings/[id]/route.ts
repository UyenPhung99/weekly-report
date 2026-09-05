import { prisma } from "@/lib/db";
import { serializeDecisions, toMeeting } from "@/lib/db-mappers";
import {
  apiError,
  apiOk,
  optionalString,
  readJsonBody,
  requireIsoDate,
  requireString,
  requireStringArray,
  withApiErrors,
} from "@/lib/api-helpers";

// Ghi dữ liệu / có tham số động — luôn chạy trên máy chủ, không cache tĩnh.
export const dynamic = "force-dynamic";

type UpdateMeetingBody = {
  departmentId?: unknown;
  hostId?: unknown;
  date?: unknown;
  agenda?: unknown;
  notes?: unknown;
  decisions?: unknown;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  return withApiErrors(async () => {
    const body = await readJsonBody<UpdateMeetingBody>(request);
    const departmentId = requireString(body.departmentId);
    const hostId = requireString(body.hostId);
    const date = requireIsoDate(body.date);
    const agenda = requireString(body.agenda);
    const notes = optionalString(body.notes);
    const decisions = requireStringArray(body.decisions);

    if (!departmentId) return apiError(400, "Vui lòng chọn bộ phận.");
    if (!hostId) return apiError(400, "Vui lòng chọn người chủ trì.");
    if (!date) return apiError(400, "Ngày họp không hợp lệ.");
    if (!agenda) return apiError(400, "Vui lòng nhập nội dung agenda.");
    if (notes === null) return apiError(400, "Ghi chú không hợp lệ.");
    if (!decisions) return apiError(400, "Danh sách quyết định không hợp lệ.");

    const host = await prisma.person.findUnique({ where: { id: hostId } });
    if (!host) return apiError(400, "Người chủ trì không tồn tại.");
    if (host.departmentId !== departmentId) {
      return apiError(400, "Người chủ trì phải thuộc đúng bộ phận đã chọn.");
    }

    const updated = await prisma.meeting.update({
      where: { id: params.id },
      data: {
        departmentId,
        hostId,
        date,
        agenda,
        notes,
        decisions: serializeDecisions(decisions),
      },
    });
    return apiOk(toMeeting(updated));
  });
}

/** Xoá cuộc họp — công việc liên quan tự gỡ liên kết (onDelete: SetNull ở schema). */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  return withApiErrors(async () => {
    await prisma.meeting.delete({ where: { id: params.id } });
    return apiOk({ id: params.id });
  });
}
