import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminConfigured, isAuthed } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAuthed()) redirect("/admin");
  return (
    <div className="mx-auto w-full max-w-lg px-5 py-16 sm:px-8">
      <LoginForm configured={await adminConfigured()} />
    </div>
  );
}
