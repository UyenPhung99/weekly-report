import type { Person } from "@/types";

/** Mock — thay bằng `GET /people` khi có API thật. */
export const people: Person[] = [
  {
    id: "p-01",
    name: "Trần Minh Quân",
    avatarInitials: "TQ",
    departmentId: "dept-sales",
    role: "Trưởng bộ phận",
  },
  {
    id: "p-02",
    name: "Lê Thu Hà",
    avatarInitials: "LH",
    departmentId: "dept-sales",
    role: "Nhân viên",
  },
  {
    id: "p-03",
    name: "Phạm Gia Bảo",
    avatarInitials: "PB",
    departmentId: "dept-sales",
    role: "Nhân viên",
  },
  {
    id: "p-04",
    name: "Nguyễn Khánh Linh",
    avatarInitials: "NL",
    departmentId: "dept-marketing",
    role: "Trưởng bộ phận",
  },
  {
    id: "p-05",
    name: "Đỗ Hoàng Nam",
    avatarInitials: "ĐN",
    departmentId: "dept-marketing",
    role: "Nhân viên",
  },
  {
    id: "p-06",
    name: "Vũ Thanh Tùng",
    avatarInitials: "VT",
    departmentId: "dept-tech",
    role: "Trưởng bộ phận",
  },
  {
    id: "p-07",
    name: "Hoàng Mai Anh",
    avatarInitials: "HA",
    departmentId: "dept-tech",
    role: "Nhân viên",
  },
  {
    id: "p-08",
    name: "Bùi Đức Thắng",
    avatarInitials: "BT",
    departmentId: "dept-tech",
    role: "Nhân viên",
  },
  {
    id: "p-09",
    name: "Ngô Phương Thảo",
    avatarInitials: "NT",
    departmentId: "dept-hr",
    role: "Trưởng bộ phận",
  },
  {
    id: "p-10",
    name: "Đặng Quốc Huy",
    avatarInitials: "ĐH",
    departmentId: "dept-hr",
    role: "Nhân viên",
  },
];
