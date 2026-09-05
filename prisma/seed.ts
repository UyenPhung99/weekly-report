/**
 * Seed dữ liệu ban đầu cho database thật — dùng lại đúng bộ mock data đã xây
 * ở các bước trước (`src/data/*.ts`) để trang không bị trống khi mới deploy.
 * ID giữ nguyên như trong mock (vd "dept-sales", "p-01") để tất cả liên kết
 * (departmentId, hostId, assigneeId, meetingId) khớp nhau mà không cần remap.
 *
 * Chạy: `npm run db:seed` (tự động chạy sau `prisma migrate/db push` khi cần).
 * An toàn để chạy lại nhiều lần — xoá sạch 4 bảng trước khi chèn lại.
 */
import { PrismaClient } from "@prisma/client";

import { departments, meetings, people, tasks } from "../src/data";

const prisma = new PrismaClient();

async function main() {
  // Xoá theo đúng thứ tự phụ thuộc để không vướng ràng buộc khoá ngoại.
  await prisma.task.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.person.deleteMany();
  await prisma.department.deleteMany();

  for (const department of departments) {
    await prisma.department.create({ data: department });
  }

  for (const person of people) {
    await prisma.person.create({ data: person });
  }

  for (const meeting of meetings) {
    await prisma.meeting.create({
      data: {
        id: meeting.id,
        departmentId: meeting.departmentId,
        date: meeting.date,
        hostId: meeting.hostId,
        agenda: meeting.agenda,
        notes: meeting.notes,
        decisions: JSON.stringify(meeting.decisions),
      },
    });
  }

  for (const task of tasks) {
    await prisma.task.create({
      data: {
        id: task.id,
        meetingId: task.meetingId ?? null,
        title: task.title,
        description: task.description,
        assigneeId: task.assigneeId,
        departmentId: task.departmentId,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        progress: task.progress,
      },
    });
  }

  console.log(
    `Đã seed ${departments.length} bộ phận, ${people.length} nhân sự, ${meetings.length} cuộc họp, ${tasks.length} công việc.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
