import type { Metadata } from "next";

import { RemindersView } from "@/components/reminders/reminders-view";

export const metadata: Metadata = { title: "Nhắc việc" };

export default function RemindersPage() {
  return <RemindersView />;
}
