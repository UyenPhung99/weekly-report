import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Weekly Report",
    template: "%s · Weekly Report",
  },
  description:
    "Ứng dụng tổng hợp báo cáo tuần: cuộc họp, công việc và nhắc việc.",
};

export const viewport: Viewport = {
  themeColor: "#FAF9FC",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
