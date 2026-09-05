# Weekly Report

Ứng dụng web tổng hợp báo cáo tuần — Next.js 14 (App Router) + TypeScript +
Tailwind CSS + shadcn/ui + Prisma/Postgres. Dữ liệu lưu thật trong database,
không mất khi restart server.

## Yêu cầu

- Node.js **18.18 trở lên** (đang dùng Node 24 LTS) — cài tại https://nodejs.org
- Một database Postgres (xem mục *Cơ sở dữ liệu* bên dưới để lấy miễn phí qua
  Vercel Postgres, hoặc dùng SQLite tạm thời để chạy thử không cần tài khoản)

## Chạy dự án

```bash
cp .env.example .env   # rồi sửa DATABASE_URL — xem mục "Cơ sở dữ liệu"
npm install
npm run db:push
npm run db:seed
npm run dev
```

Mở http://localhost:3000 (tự chuyển hướng sang `/dashboard`).

## Cấu trúc

```
prisma/
  schema.prisma            # Department / Person / Meeting / Task — provider "postgresql"
  seed.ts                  # Nạp dữ liệu mẫu vào database (npm run db:seed)
src/
  app/
    layout.tsx              # Root layout, font Inter (hỗ trợ tiếng Việt)
    globals.css             # Design tokens dạng CSS variables
    page.tsx                # Redirect -> /dashboard
    api/                    # Route handler — validate input, gọi Prisma, trả JSON
      bootstrap/route.ts    # GET toàn bộ dữ liệu (thay cho getInitialData() cũ)
      departments/          # POST + [id]/route.ts (PATCH, DELETE)
      people/                # POST + [id]/route.ts (PATCH, DELETE)
      meetings/              # POST + [id]/route.ts (PATCH, DELETE)
      tasks/                 # POST + [id]/route.ts (PATCH, DELETE)
    (app)/
      layout.tsx            # Layout chung: sidebar + header + store + toast
      dashboard/            # page.tsx + loading.tsx
      meetings/             # page.tsx + loading.tsx
      tasks/                # page.tsx + loading.tsx
      reminders/            # page.tsx + loading.tsx
      reports/              # page.tsx + loading.tsx
      settings/             # page.tsx + loading.tsx
  components/
    dashboard/              # KPI, biểu đồ recharts, khối lượng công việc
    reports/                # Báo cáo tuần: bản xem trước + bản in PDF
    settings/               # Quản lý bộ phận và nhân sự
    meetings/               # Danh sách theo tuần, form cuộc họp, tạo nhanh công việc
    tasks/                  # Bộ lọc, bảng/thẻ công việc, form, đổi trạng thái nhanh
    reminders/              # Nhắc việc theo mức độ khẩn cấp
    shared/                 # PersonCell, badge trạng thái / ưu tiên, skeleton từng trang
    layout/                 # Brand, sidebar, header, page header, placeholder
    ui/                     # Component shadcn/ui
  data/                     # Dữ liệu mẫu — chỉ còn dùng để SEED database, không dùng lúc runtime
    departments.ts
    people.ts
    meetings.ts
    tasks.ts
    index.ts                # Barrel export cho prisma/seed.ts
  lib/
    store.tsx               # WeeklyReportProvider + useWeeklyReport() — state cục bộ, đồng bộ qua API
    api-client.ts           # Hàm gọi các route /api/* (điểm duy nhất biết URL endpoint)
    db.ts                   # Prisma Client singleton
    db-mappers.ts           # Chuyển đổi row Prisma <-> type dùng trong app
    api-helpers.ts          # Validate input, chuẩn hoá response lỗi cho route handler
    chart.ts                # Màu biểu đồ, ánh xạ từ CSS variable
    report.ts               # Tổng hợp báo cáo tuần + xuất bản text
    report-delivery.ts      # Điểm gắn API gửi email/Slack (CHƯA triển khai)
    date.ts                 # Tiện ích ngày tháng (tuần, hạn chót, số ngày còn lại)
    task-utils.ts           # Trạng thái thực tế, mức khẩn cấp, màu badge
    navigation.ts           # Cấu hình menu (nguồn duy nhất cho sidebar + tiêu đề trang)
    utils.ts                # cn()
  types/index.ts            # Data model
tailwind.config.ts          # Design tokens màu / bo góc / shadow / font
```

## Data model

Khai báo trong [`src/types/index.ts`](src/types/index.ts). Ngày tháng dùng chuỗi
ISO `"yyyy-MM-dd"` cho dễ ánh xạ sang API/DB.

| Type | Trường |
| --- | --- |
| `Department` | `id`, `name` |
| `Person` | `id`, `name`, `avatarInitials`, `departmentId`, `role` (`Trưởng bộ phận` \| `Nhân viên`) |
| `Meeting` | `id`, `departmentId`, `date`, `hostId`, `agenda`, `notes`, `decisions[]` |
| `Task` | `id`, `meetingId?`, `title`, `description`, `assigneeId`, `departmentId`, `dueDate`, `priority`, `status`, `progress` |

`priority`: `Cao` \| `Trung bình` \| `Thấp`.
`status`: `Chưa bắt đầu` \| `Đang làm` \| `Hoàn thành` \| `Trễ hạn`.

> **Trễ hạn là trạng thái suy ra**: `getEffectiveStatus()` trong `lib/task-utils.ts`
> tự chuyển công việc quá hạn mà chưa hoàn thành thành `Trễ hạn`, nên không cần
> cập nhật thủ công trong dữ liệu.

## Cơ sở dữ liệu

App đọc/ghi dữ liệu **thật** qua Postgres, không còn giữ trong bộ nhớ nữa.
Kiến trúc:

```
Component (dialog, bảng, dashboard…)
        │  useWeeklyReport()
        ▼
src/lib/store.tsx        — state cục bộ (cập nhật ngay để UI phản hồi tức thì)
        │  fetch qua src/lib/api-client.ts
        ▼
src/app/api/*/route.ts   — validate input, gọi Prisma
        │
        ▼
Prisma Client (src/lib/db.ts) ──► Postgres
```

- **Optimistic update**: mọi thao tác tạo/sửa/xoá cập nhật giao diện ngay lập
  tức, đồng thời gửi request lên server ở nền. Nếu server từ chối, store tự
  tải lại toàn bộ dữ liệu và báo lỗi qua toast — không cần refresh trang thủ công.
- **Xoá bộ phận/nhân sự** là ngoại lệ: chờ server xác nhận (server mới biết
  chắc còn dữ liệu liên quan hay không) rồi mới cập nhật giao diện — giữ đúng
  hành vi "chặn xoá kèm lý do" đã có từ trước.
- Schema khai báo trong [`prisma/schema.prisma`](prisma/schema.prisma). Ngày
  tháng và danh sách quyết định của cuộc họp lưu dạng `String` (không dùng kiểu
  riêng của Postgres) để logic ứng dụng không phụ thuộc engine cụ thể.

### Chạy cục bộ

```bash
cp .env.example .env
# Sửa DATABASE_URL trong .env trỏ tới Postgres của bạn
npm install          # tự chạy "prisma generate"
npm run db:push       # đồng bộ schema xuống database (tạo bảng)
npm run db:seed       # nạp dữ liệu mẫu — 4 bộ phận · 10 nhân sự · 7 cuộc họp · 20 công việc
npm run dev
```

Không có Postgres sẵn để test cục bộ? Cách nhanh nhất: đổi tạm
`provider = "postgresql"` thành `"sqlite"` trong `schema.prisma` và
`DATABASE_URL="file:./dev.db"` trong `.env` — chạy được ngay, không cần cài gì
thêm (đây cũng chính là cách đã dùng để kiểm thử toàn bộ luồng tạo/sửa/xoá và
xác nhận dữ liệu **sống sót qua việc khởi động lại server** trước khi bàn giao
bản này). Nhớ đổi lại `"postgresql"` trước khi deploy.

### Deploy lên Vercel — các bước cần bạn tự làm

Đây là phần duy nhất không thể tự động hoá: tạo tài khoản và cơ sở dữ liệu là
thao tác gắn với tài khoản cá nhân của bạn.

1. **Tạo tài khoản Vercel** (miễn phí) tại https://vercel.com/signup — đăng
   nhập bằng GitHub là nhanh nhất.
2. **Đưa code lên GitHub**: tạo repo mới, `git remote add origin <url>`,
   `git push -u origin main` (repo cục bộ đã có sẵn commit, xem `git log`).
3. Trên Vercel: **Add New → Project**, chọn repo vừa đẩy lên, bấm **Deploy**
   (không cần đổi cấu hình build, Next.js được Vercel nhận diện tự động).
4. **Tạo database**: vào project vừa tạo → tab **Storage → Create Database →
   Postgres** (Neon). Vài cú click, không cần thẻ tín dụng cho gói miễn phí.
   Vercel tự thêm biến môi trường `DATABASE_URL` (và vài biến liên quan) vào
   project — không cần copy tay.
5. **Đồng bộ schema + nạp dữ liệu mẫu vào database thật**: kéo connection
   string về máy (Storage tab → `.env.local` → copy), rồi chạy cục bộ:
   ```bash
   DATABASE_URL="<connection string vừa copy>" npm run db:push
   DATABASE_URL="<connection string vừa copy>" npm run db:seed
   ```
   (Hoặc dùng `vercel env pull .env` nếu đã cài Vercel CLI — lệnh này tự ghi
   đúng connection string vào `.env`.)
6. Vào tab **Deployments**, bấm **Redeploy** ở bản mới nhất để app nhận biến
   môi trường vừa thêm.

Xong bước 6, link dạng `https://<tên-project>.vercel.app` chạy 24/7, ai có link
đều truy cập được — không cần đăng nhập (app hiện chưa có xác thực, đúng như
yêu cầu). Muốn đổi tên miền, vào **Settings → Domains**.

### Chuyển sang lưu trữ khác (không dùng Vercel)

Vì mọi thứ đi qua `DATABASE_URL` chuẩn Postgres, có thể thay Vercel Postgres
bằng bất kỳ Postgres nào khác (Supabase, Neon trực tiếp, Railway…) mà không
đổi code — chỉ cần connection string đúng định dạng
`postgresql://user:password@host:5432/db?sslmode=require`.

## Tính năng

**Dashboard** (`/dashboard`) — trang chủ, tổng hợp toàn bộ dữ liệu
- 4 thẻ KPI: tổng số công việc, % hoàn thành trung bình, số việc trễ hạn, số cuộc
  họp trong tuần (mỗi thẻ là link sang trang tương ứng)
- Biểu đồ donut: tỷ lệ công việc theo 4 trạng thái, kèm chú giải và tổng ở tâm
- Biểu đồ cột: % hoàn thành theo từng bộ phận
- Bảng **Khối lượng công việc theo người phụ trách**: avatar, số việc đang giữ,
  tiến độ trung bình, số việc trễ hạn — xếp người đang quá tải lên đầu và gắn
  nhãn *Quá tải*
- **Cần chú ý ngay**: 5 công việc khẩn cấp nhất, mỗi dòng link sang
  `/tasks?assignee=…`
- **Cuộc họp gần nhất**: buổi họp mới nhất của từng bộ phận

**Cuộc họp** (`/meetings`)
- Xem theo tuần (tuần trước / tuần này / tuần sau), nhóm theo bộ phận, lọc theo bộ phận
- Tạo / sửa / xoá cuộc họp: bộ phận, người chủ trì, ngày họp, agenda, ghi chú, danh sách quyết định (thêm/bớt từng dòng)
- Mỗi thẻ hiển thị công việc phát sinh kèm trạng thái, và nút **Tạo công việc** gắn sẵn cuộc họp đó

**Công việc** (`/tasks`)
- Lọc theo bộ phận, người phụ trách, trạng thái, khoảng thời gian hạn chót
- Bảng đầy đủ trên desktop, chuyển sang danh sách thẻ trên tablet/mobile
- Tạo / sửa / xoá công việc; thanh kéo % tiến độ (tự khoá ở 100% khi chọn *Hoàn thành*)
- Đổi trạng thái nhanh bằng dropdown ngay trên dòng
- Công việc quá hạn tự động hiện badge **Trễ hạn** tông đỏ san hô

**Nhắc việc** (`/reminders`)
- Công việc đã trễ hạn và sắp đến hạn trong 3 ngày tới, xếp theo mức độ khẩn cấp
  (trễ lâu nhất trước, rồi tới gần hạn nhất; cùng mức thì ưu tiên cao lên trước)
- Mỗi dòng: tên công việc, người phụ trách, bộ phận, số ngày trễ / còn lại, tiến độ
- Badge cảnh báo: **vàng** cho sắp đến hạn, **đỏ san hô** cho trễ hạn

**Báo cáo tuần** (`/reports`)
- Chọn tuần (◀ ▶ / *Tuần này*) và phạm vi (toàn công ty hoặc một bộ phận)
- Tự động tổng hợp: số cuộc họp, số quyết định, tóm tắt nội dung – ghi chú –
  quyết định – công việc phát sinh của từng cuộc họp, số việc hoàn thành / đang
  làm / chưa bắt đầu / trễ hạn, và % hoàn thành theo từng người phụ trách
- Tách riêng **việc trễ hạn tồn từ tuần trước** để không bị lẫn với việc của tuần này
- Hai chế độ xem: **Bản trình bày** (bố cục báo cáo, đúng theme tím pastel) và
  **Bản text** (đúng nội dung sẽ được sao chép)
- **Xuất PDF** và **Sao chép nội dung** — xem mục *Xuất báo cáo* bên dưới

**Cài đặt** (`/settings`)
- Quản lý bộ phận: thêm / sửa / xoá, kèm số nhân sự – cuộc họp – công việc của mỗi bộ phận
- Quản lý nhân sự: thêm / sửa / xoá, chọn bộ phận và vai trò, chữ viết tắt avatar
  tự sinh từ họ tên nếu để trống
- Chặn xoá khi còn dữ liệu liên quan (bộ phận còn nhân sự/họp/việc, người còn việc
  đang phụ trách hoặc cuộc họp đang chủ trì) và giải thích lý do bằng toast

**Xuyên suốt ứng dụng**
- **Tìm kiếm nhanh** trên header: tìm công việc, cuộc họp và nhân sự, không phụ
  thuộc dấu tiếng Việt (gõ "bao gia" ra "Gửi báo giá…"); trên mobile mở bằng hộp thoại
- **Toast** xác nhận mọi thao tác tạo / sửa / xoá và đổi trạng thái
- **Empty state** riêng cho từng ngữ cảnh: chưa có dữ liệu, chưa có bộ phận/nhân sự,
  và không khớp bộ lọc
- **Loading state**: mỗi route có `loading.tsx` với skeleton đúng bố cục trang
- **Deep link**: `/tasks` nhận query `?department=`, `?assignee=`, `?status=` để
  mở sẵn bộ lọc

## Xuất báo cáo

**Phạm vi "trong tuần"** — data model hiện **không có trường thời điểm hoàn
thành**, nên mốc duy nhất dùng được là hạn chót: một công việc thuộc tuần báo cáo
khi `dueDate` rơi trong tuần đó. Khi bổ sung `completedAt` vào `Task`, chỉ cần đổi
điều kiện ở `buildWeeklyReport()` trong [`src/lib/report.ts`](src/lib/report.ts).

**Xuất PDF** dùng hộp thoại in của trình duyệt (*Đích đến → Lưu dưới dạng PDF*),
không dùng thư viện ngoài. Đổi lại:

- chữ giữ nguyên dạng vector, dấu tiếng Việt sắc nét, chọn/tìm được trong file PDF
- màu pastel giữ đúng nhờ `print-color-adjust: exact` trong `globals.css`
- khổ A4, lề 14mm khai báo bằng `@page`
- sidebar / header / bộ điều khiển / footer app được ẩn bằng biến thể `print:`
  của Tailwind, chỉ còn đúng bản báo cáo

> Nếu muốn tải thẳng file PDF không qua hộp thoại in, cần thêm `jspdf` +
> `html2canvas` (ảnh raster, chữ không chọn được) hoặc dựng PDF phía server.

**Sao chép nội dung** dùng Clipboard API, có 2 lớp dự phòng: `execCommand("copy")`
cho trang không chạy HTTPS, và cuối cùng là tự mở tab *Bản text* + bôi đen sẵn nội
dung để người dùng nhấn Ctrl+C.

## Bước sau: gửi email / Slack tự động

Chưa triển khai. Toàn bộ điểm gắn API nằm trong
[`src/lib/report-delivery.ts`](src/lib/report-delivery.ts) với 2 hàm đã có sẵn kiểu
dữ liệu và hướng dẫn chi tiết trong comment `TODO`:

- `sendReportByEmail(payload, recipients)`
- `sendReportToSlack(payload, channel)`

Nội dung báo cáo đã sẵn sàng (`buildWeeklyReport` → dữ liệu, `buildReportText` →
bản text), nên bước sau chỉ cần cài đặt phần vận chuyển: tạo route handler trong
`src/app/api/reports/*` để giữ API key phía server, rồi nối vào 2 hàm trên.

## Design system — "Tím pastel"

Toàn bộ màu được khai báo trong `tailwind.config.ts` và `src/app/globals.css`
(**không hard-code màu trong component**).

| Nhóm | Token | Giá trị |
| --- | --- | --- |
| Tím pastel (chính) | `lavender-50…950` | `lavender-500` = `#B5A8D5` |
| Hồng pastel (accent) | `blossom-50…900` | dùng cho tag/trạng thái |
| Mint pastel (accent) | `mint-50…900` | dùng cho tag/trạng thái |
| Đỏ san hô pastel | `coral-50…900` | cảnh báo trễ hạn |
| Nền | `bg-background` | `#FAF9FC` |
| Card | `bg-card` | `#F3F0FA` |
| Biểu đồ | `chart-not-started`, `chart-in-progress`, `chart-done`, `chart-overdue` | recharts đọc qua `src/lib/chart.ts` |

Token ngữ nghĩa của shadcn/ui (`primary`, `secondary`, `muted`, `accent`,
`success`, `warning`, `info`, `danger`, `sidebar`…) được điều khiển bằng CSS
variables ở `globals.css`, có sẵn cả bộ giá trị cho chế độ tối (thêm class `dark`
vào `<html>`).

- Bo góc: `--radius: 1rem` → `rounded-2xl` cho card, `rounded-xl` cho control
- Shadow: `shadow-soft`, `shadow-card`, `shadow-lift`, `shadow-glow`
- Font: Inter (`next/font`) với subset `latin` + `vietnamese`

## Component shadcn/ui đã cài

`button`, `card`, `badge`, `avatar`, `progress`, `dialog`, `sheet`,
`dropdown-menu`, `table`, `tabs`, `input`, `textarea`, `select`, `calendar`,
`separator`, `label`, `skeleton`.

Thêm `toast` là component tự viết (`src/components/ui/toast.tsx`) — provider +
`useToast()`, không dùng thư viện ngoài, màu lấy từ đúng bảng pastel.

Thêm component mới:

```bash
npx shadcn@latest add <tên-component>
```

## Thư viện khác

- `lucide-react` — icon
- `recharts` — biểu đồ donut và cột ở Dashboard; màu lấy từ CSS variable qua
  `src/lib/chart.ts`
- `react-day-picker` + `date-fns` — `date-fns` dùng cho toàn bộ xử lý ngày tháng;
  `react-day-picker` là nền tảng cho component `calendar`

## Responsive

- `lg` trở lên: sidebar cố định rộng 16rem; bảng công việc, khối lượng theo người
  và danh sách bộ phận/nhân sự hiển thị dạng table
- Dưới `lg`: sidebar thu gọn thành nút hamburger (Sheet), mọi bảng chuyển sang
  danh sách thẻ; đã kiểm tra không tràn ngang ở 375px trên cả 5 trang
