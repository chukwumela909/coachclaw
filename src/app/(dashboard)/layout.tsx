import Link from 'next/link';
import { MessageCircle, LayoutDashboard, Library, Settings } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex">
      {/* Sidebar (Desktop) */}
      <aside className="w-[240px] bg-white border-r-[1px] border-[#222a3514] flex-col hidden md:flex shrink-0 fixed inset-y-0 z-10 shadow-[var(--shadow-level-5)]">
        <div className="h-16 flex items-center px-6 border-b-[1px] border-[#222a3514]">
          <Link href="/dashboard" className="font-[var(--font-cal)] font-extrabold text-[20px] text-[#242424]">
            CoachClaw
          </Link>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {/* Active Link Example */}
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-3 py-2 text-[#242424] bg-[#f5f5f5] rounded-[8px] font-medium text-[14px]"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          
          <Link 
            href="/dashboard/subjects" 
            className="flex items-center gap-3 px-3 py-2 text-[#898989] hover:text-[#242424] hover:bg-[#f5f5f5] rounded-[8px] font-medium text-[14px] transition-colors"
          >
            <Library size={18} />
            Subjects
          </Link>
          
          <Link 
            href="/dashboard/settings" 
            className="flex items-center gap-3 px-3 py-2 text-[#898989] hover:text-[#242424] hover:bg-[#f5f5f5] rounded-[8px] font-medium text-[14px] transition-colors"
          >
            <Settings size={18} />
            Settings
          </Link>
        </nav>
        
        {/* User Profile Stub */}
        <div className="p-4 border-t-[1px] border-[#222a3514]">
          <div className="flex items-center gap-3 px-3 py-2 text-[#242424] font-medium text-[14px]">
            <div className="w-8 h-8 rounded-[8px] bg-[#e5e5e5] shadow-[var(--shadow-level-1)] shrink-0 flex items-center justify-center text-[12px] font-bold">
              JD
            </div>
            Jane Doe
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[240px] relative">
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-white border-b-[1px] border-[#222a3514] flex items-center px-4 sticky top-0 z-10">
           <Link href="/dashboard" className="font-[var(--font-cal)] font-extrabold text-[20px] text-[#242424]">
            CoachClaw
          </Link>
        </div>
        
        {children}
      </main>

      {/* Persistent AI Coach FAB */}
      <Link 
        href="/dashboard/chat" 
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#242424] text-white rounded-[9999px] shadow-[var(--shadow-level-2)] flex items-center justify-center hover:opacity-80 transition-opacity z-50 group"
      >
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none rounded-t-[9999px]" />
        <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
      </Link>
    </div>
  );
}
