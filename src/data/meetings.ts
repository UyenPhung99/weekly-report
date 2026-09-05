import { getWeekRange, shiftISODate, today } from "@/lib/date";
import type { Meeting } from "@/types";

/**
 * Mock — thay bằng `GET /meetings` khi có API thật.
 * Ngày họp được neo theo đầu tuần hiện tại để dữ liệu luôn rơi vào
 * "tuần trước / tuần này / tuần sau" khi xem giao diện.
 */
const weekStart = getWeekRange(today()).start;
const d = (offset: number) => shiftISODate(weekStart, offset);

export const meetings: Meeting[] = [
  {
    id: "mt-01",
    departmentId: "dept-sales",
    date: d(-5),
    hostId: "p-01",
    agenda:
      "Rà soát doanh số tuần, chốt danh sách khách hàng ưu tiên và phân bổ chỉ tiêu tháng.",
    notes:
      "Doanh số đạt 82% kế hoạch tuần. Nhóm khách hàng doanh nghiệp phản hồi tốt với gói dịch vụ mới.",
    decisions: [
      "Tăng tần suất chăm sóc 10 khách hàng trọng điểm lên 2 lần/tuần",
      "Chuyển 3 hợp đồng chờ ký sang xử lý ưu tiên",
    ],
  },
  {
    id: "mt-02",
    departmentId: "dept-tech",
    date: d(-3),
    hostId: "p-06",
    agenda:
      "Tổng kết sprint, review lỗi tồn đọng và thống nhất phạm vi sprint kế tiếp.",
    notes:
      "Còn 4 lỗi mức nghiêm trọng chưa xử lý. Môi trường staging đã ổn định sau khi nâng cấp hạ tầng.",
    decisions: [
      "Ưu tiên xử lý toàn bộ lỗi nghiêm trọng trước khi mở sprint mới",
      "Áp dụng quy trình review code 2 người cho các thay đổi ở module thanh toán",
    ],
  },
  {
    id: "mt-03",
    departmentId: "dept-marketing",
    date: d(0),
    hostId: "p-04",
    agenda:
      "Kế hoạch truyền thông quý IV: chủ đề nội dung, ngân sách quảng cáo và lịch đăng bài.",
    notes:
      "Chi phí quảng cáo tháng trước vượt 12% so với dự kiến, cần tối ưu lại nhóm từ khoá.",
    decisions: [
      "Chốt chủ đề nội dung tháng: chuyển đổi số cho doanh nghiệp vừa và nhỏ",
      "Giảm 15% ngân sách kênh hiệu quả thấp, dồn sang kênh có tỷ lệ chuyển đổi cao",
    ],
  },
  {
    id: "mt-04",
    departmentId: "dept-sales",
    date: d(2),
    hostId: "p-01",
    agenda:
      "Họp giao ban giữa tuần: tiến độ hợp đồng, vướng mắc và hỗ trợ liên bộ phận.",
    notes: "Cần phối hợp với Kỹ thuật để demo sản phẩm cho 2 khách hàng lớn.",
    decisions: [
      "Đề nghị Kỹ thuật bố trí người hỗ trợ demo trong tuần này",
    ],
  },
  {
    id: "mt-05",
    departmentId: "dept-hr",
    date: d(4),
    hostId: "p-09",
    agenda:
      "Kế hoạch tuyển dụng và đánh giá năng lực định kỳ cho các bộ phận.",
    notes:
      "Đã nhận 46 hồ sơ cho 3 vị trí đang mở. Lịch phỏng vấn vòng 1 bắt đầu tuần sau.",
    decisions: [
      "Chốt bộ tiêu chí đánh giá năng lực áp dụng từ kỳ này",
      "Tổ chức buổi đào tạo nội bộ về quy trình onboarding",
    ],
  },
  {
    id: "mt-06",
    departmentId: "dept-tech",
    date: d(8),
    hostId: "p-06",
    agenda:
      "Kick-off sprint mới: phân chia hạng mục, ước lượng thời gian và rủi ro kỹ thuật.",
    notes: "",
    decisions: [],
  },
  {
    id: "mt-07",
    departmentId: "dept-marketing",
    date: d(10),
    hostId: "p-04",
    agenda: "Đánh giá hiệu quả chiến dịch và chuẩn bị báo cáo cho ban giám đốc.",
    notes: "",
    decisions: [],
  },
];
