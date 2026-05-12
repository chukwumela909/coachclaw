import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const initials = session.user.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CC";

  return (
    <DashboardShell initials={initials} displayName={session.user.name ?? session.user.email}>
      {children}
    </DashboardShell>
  );
}
