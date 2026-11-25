import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/AdminDashboard";
import { isAuthed } from "@/lib/auth";
import { pageValue, queryValue } from "@/lib/format";

export const metadata: Metadata = {
  title: "Lead inbox",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!(await isAuthed())) redirect("/admin/login");
  const params = await searchParams;
  const rawTab = queryValue(params.tab);
  const tab = rawTab === "buyers" || rawTab === "messages" ? rawTab : "sellers";
  return <AdminDashboard tab={tab} query={queryValue(params.q)} page={pageValue(params.page)} />;
}
