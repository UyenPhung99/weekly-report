import type { WeeklyReportSummary } from "@/lib/report";

/* -------------------------------------------------------------------------- */
/*  Gửi báo cáo tự động — CHƯA TRIỂN KHAI                                      */
/*                                                                            */
/*  File này là điểm gắn API gửi thật (email / Slack) ở bước sau. Toàn bộ phần  */
/*  tổng hợp và định dạng nội dung đã xong ở `@/lib/report`:                    */
/*    - buildWeeklyReport(...)  -> dữ liệu báo cáo                             */
/*    - buildReportText(...)    -> bản text đã định dạng sẵn để gửi            */
/*  Nên khi nối API chỉ cần cài đặt phần vận chuyển, không phải viết lại nội    */
/*  dung báo cáo.                                                             */
/* -------------------------------------------------------------------------- */

export type ReportDeliveryPayload = {
  /** Tiêu đề gợi ý, ví dụ "Báo cáo tuần 31/08 – 06/09/2026 · Toàn công ty". */
  subject: string;
  /** Nội dung dạng text thuần (kết quả của `buildReportText`). */
  body: string;
  /** Dữ liệu có cấu trúc, dùng khi cần dựng HTML email hoặc Slack Block Kit. */
  summary: WeeklyReportSummary;
};

export type DeliveryResult =
  | { ok: true; messageId?: string }
  | { ok: false; reason: string };

/** Tiêu đề chuẩn dùng chung cho email và Slack. */
export function buildReportSubject(summary: WeeklyReportSummary): string {
  return `Báo cáo tuần ${summary.weekLabel.replace(/^Tuần\s*/i, "")} · ${summary.scopeLabel}`;
}

/**
 * TODO(bước sau — tích hợp email): gắn API gửi email thật tại đây.
 *
 * Gợi ý triển khai:
 *  1. Tạo route handler `src/app/api/reports/email/route.ts` (chạy phía server,
 *     để không lộ API key ra client).
 *  2. Trong route đó gọi nhà cung cấp email (Resend / SendGrid / SMTP nội bộ):
 *       - to:      danh sách người nhận (lấy từ Cài đặt hoặc tham số)
 *       - subject: payload.subject
 *       - text:    payload.body
 *       - html:    dựng từ payload.summary nếu muốn giữ theme tím pastel
 *  3. Hàm này chỉ cần `fetch("/api/reports/email", { method: "POST", ... })`
 *     và map kết quả về `DeliveryResult`.
 *  4. Biến môi trường cần thêm vào `.env.local`: khoá API và địa chỉ người gửi.
 */
export async function sendReportByEmail(
  payload: ReportDeliveryPayload,
  recipients: string[],
): Promise<DeliveryResult> {
  void payload;
  void recipients;
  return {
    ok: false,
    reason: "Chức năng gửi email chưa được tích hợp.",
  };
}

/**
 * TODO(bước sau — tích hợp Slack): gắn API gửi Slack thật tại đây.
 *
 * Gợi ý triển khai:
 *  1. Tạo Slack app + Incoming Webhook (hoặc bot token với `chat:write`).
 *  2. Tạo route handler `src/app/api/reports/slack/route.ts` giữ webhook URL /
 *     token ở phía server.
 *  3. Gửi `{ text: payload.body }` cho webhook, hoặc dựng Block Kit từ
 *     `payload.summary` để có tiêu đề, bảng số liệu và danh sách việc trễ hạn.
 *  4. Biến môi trường cần thêm: SLACK_WEBHOOK_URL hoặc SLACK_BOT_TOKEN.
 *
 * Lưu ý: Slack giới hạn ~3000 ký tự cho một text block, báo cáo dài cần cắt
 * thành nhiều block hoặc đính kèm dạng snippet.
 */
export async function sendReportToSlack(
  payload: ReportDeliveryPayload,
  channel: string,
): Promise<DeliveryResult> {
  void payload;
  void channel;
  return {
    ok: false,
    reason: "Chức năng gửi Slack chưa được tích hợp.",
  };
}
