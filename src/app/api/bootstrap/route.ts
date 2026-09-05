import { prisma } from "@/lib/db";
import { toDepartment, toMeeting, toPerson, toTask } from "@/lib/db-mappers";
import { apiOk, withApiErrors } from "@/lib/api-helpers";

/**
 * Toàn bộ dữ liệu khởi tạo cho store phía client — đọc trực tiếp từ Postgres
 * thay vì mock trong bộ nhớ như trước.
 *
 * QUAN TRỌNG: route GET không có tham số động nên Next.js mặc định coi đây là
 * route TĨNH và chỉ chạy handler một lần lúc `next build`, sau đó luôn trả về
 * đúng bản chụp đó — nghĩa là dữ liệu mới ghi vào DB sẽ không bao giờ được
 * đọc lại. `force-dynamic` buộc route này chạy lại (truy vấn DB thật) trên
 * mỗi request.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return withApiErrors(async () => {
    const [departments, people, meetings, tasks] = await Promise.all([
      prisma.department.findMany({ orderBy: { name: "asc" } }),
      prisma.person.findMany({ orderBy: { name: "asc" } }),
      prisma.meeting.findMany({ orderBy: { date: "asc" } }),
      prisma.task.findMany({ orderBy: { dueDate: "asc" } }),
    ]);

    return apiOk({
      departments: departments.map(toDepartment),
      people: people.map(toPerson),
      meetings: meetings.map(toMeeting),
      tasks: tasks.map(toTask),
    });
  });
}
