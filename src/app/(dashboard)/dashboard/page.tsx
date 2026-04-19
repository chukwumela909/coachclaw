import Link from 'next/link';

export default function DashboardHome() {
  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12">
      {/* Header section with generic 80px bottom margin rule adapted for internals */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-[48px]">
        <div>
          <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">Your Mastery</h1>
          <p className="text-[16px] font-light text-[#898989] leading-[1.5]">
            Welcome back, Jane. Here's your learning progress across all subjects.
          </p>
        </div>
        <Link 
          href="/dashboard/subjects/new" 
          className="bg-[#242424] text-white px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] shrink-0 inline-flex justify-center"
        >
          Add Subject
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Subject Card 1 */}
        <Link 
          href="/dashboard/subjects/1" 
          className="group bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow"
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] group-hover:text-[#0099ff] transition-colors">
              Calculus 101
            </h3>
            
            {/* Fake Mastery Ring */}
            <div className="w-[48px] h-[48px] rounded-full border-[3px] border-[#e5e5e5] border-t-[#242424] border-r-[#242424] flex items-center justify-center shrink-0 shadow-[var(--shadow-level-1)]">
              <span className="text-[12px] font-bold text-[#242424]">45%</span>
            </div>
          </div>
          
          <p className="text-[14px] font-light text-[#898989] mb-6 line-clamp-2">
            Integrals, Derivatives, Limits. A foundation for advanced mathematics.
          </p>
          
          <div className="flex items-center gap-3 text-[14px] font-medium text-[#242424]">
            <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px]">12 Topics</span>
            <span className="text-[#e5e5e5]">•</span>
            <span className="text-[#0099ff]">Continue →</span>
          </div>
        </Link>

        {/* Subject Card 2 */}
        <Link 
          href="/dashboard/subjects/2" 
          className="group bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow"
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] group-hover:text-[#0099ff] transition-colors">
              World History
            </h3>
            
            <div className="w-[48px] h-[48px] rounded-full border-[3px] border-[#e5e5e5] border-t-[#242424] flex items-center justify-center shrink-0 shadow-[var(--shadow-level-1)]">
              <span className="text-[12px] font-bold text-[#242424]">82%</span>
            </div>
          </div>
          
          <p className="text-[14px] font-light text-[#898989] mb-6 line-clamp-2">
            European exploration, Industrial Revolution, World Wars.
          </p>
          
          <div className="flex items-center gap-3 text-[14px] font-medium text-[#242424]">
            <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px]">8 Topics</span>
            <span className="text-[#e5e5e5]">•</span>
            <span className="text-[#0099ff]">Review →</span>
          </div>
        </Link>

        {/* Empty State / Add New Subject Card */}
        <Link 
          href="/dashboard/subjects/new" 
          className="bg-transparent border-[2px] border-dashed border-[#e5e5e5] rounded-[12px] p-6 flex flex-col items-center justify-center text-[#898989] hover:border-[#242424] hover:text-[#242424] transition-colors min-h-[220px]"
        >
          <div className="w-12 h-12 rounded-[8px] bg-white shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] flex items-center justify-center mb-4">
            <span className="font-[var(--font-cal)] text-[24px]">+</span>
          </div>
          <span className="font-semibold text-[16px]">Create New Subject</span>
        </Link>

      </div>
    </div>
  );
}