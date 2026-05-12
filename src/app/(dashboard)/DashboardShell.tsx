import Link from "next/link";
import { LayoutDashboard, Library, MessageCircle, Settings } from "lucide-react";

type DashboardShellProps = {
  children: React.ReactNode;
  displayName?: string | null;
  initials?: string;
};

export function DashboardShell({ children, displayName, initials = "CC" }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[#f7f6f2]">
      <aside className="fixed inset-y-0 z-10 hidden w-[252px] shrink-0 flex-col border-r border-[#222a3514] bg-[#fffdf8] shadow-[var(--shadow-level-5)] md:flex">
        <div className="flex h-16 items-center border-b border-[#222a3514] px-6">
          <Link href="/dashboard" className="font-[var(--font-cal)] font-extrabold text-[20px] text-[#242424]">
            CoachClaw
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-[8px] bg-[#ece6d9] px-3 py-2.5 text-[14px] font-semibold text-[#242424]"
          >
            <LayoutDashboard size={18} strokeWidth={2.2} />
            Dashboard
          </Link>

          <Link
            href="/dashboard/subjects"
            className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-[#6f6f6f] transition-colors hover:bg-[#f0eee8] hover:text-[#242424]"
          >
            <Library size={18} strokeWidth={2.2} />
            Subjects
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[14px] font-medium text-[#6f6f6f] transition-colors hover:bg-[#f0eee8] hover:text-[#242424]"
          >
            <Settings size={18} strokeWidth={2.2} />
            Settings
          </Link>
        </nav>

        <div className="border-t border-[#222a3514] p-4">
          <div className="flex items-center gap-3 rounded-[8px] px-2 py-2 text-[14px] font-medium text-[#242424]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#355943] text-[12px] font-bold text-white shadow-[var(--shadow-level-1)]">
              {initials}
            </div>
            <span className="truncate">{displayName ?? "Learner"}</span>
          </div>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 md:ml-[252px]">
        <div className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#222a3514] bg-[#fffdf8]/95 px-4 backdrop-blur-md md:hidden">
          <Link href="/dashboard" className="font-[var(--font-cal)] font-extrabold text-[20px] text-[#242424]">
            CoachClaw
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#355943] text-[11px] font-bold text-white">
            {initials}
          </div>
        </div>

        {children}
      </main>

      <Link
        href="/dashboard/chat"
        className="group fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-[9999px] bg-[#242424] text-white shadow-[var(--shadow-level-2)] transition-transform hover:-translate-y-0.5 md:bottom-6 md:right-6 md:h-14 md:w-14"
        aria-label="Open AI coach"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-t-[9999px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <MessageCircle size={22} className="transition-transform group-hover:scale-110" />
      </Link>
    </div>
  );
}
