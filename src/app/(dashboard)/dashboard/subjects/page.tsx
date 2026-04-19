import Link from 'next/link';
import { Library } from 'lucide-react';

export default function SubjectsListing() {
  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-[48px] border-b-[1px] border-[#222a3514] pb-[48px]">
        <div>
          <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">Subjects</h1>
          <p className="text-[16px] font-light text-[#898989] leading-[1.5]">
            All your subjects in one place. Select one to view topics and progress.
          </p>
        </div>
        <Link
          href="/dashboard/subjects/new"
          className="bg-[#242424] text-white px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] shrink-0 inline-flex justify-center relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          + New Subject
        </Link>
      </div>

      <div className="space-y-4">
        {/* Subject Row 1 */}
        <Link
          href="/dashboard/subjects/1"
          className="block bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow group"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#fcfcfc] border-[1px] border-[#222a3514] rounded-[8px] flex items-center justify-center text-[#898989] shadow-[var(--shadow-level-1)] shrink-0">
                <Library size={20} />
              </div>
              <div>
                <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] group-hover:text-[#0099ff] transition-colors">
                  Calculus 101
                </h3>
                <div className="flex items-center gap-3 text-[14px] font-light text-[#898989] mt-1">
                  <span className="bg-[#f5f5f5] px-2 py-0.5 rounded-[6px] text-[#242424] font-medium text-[12px]">12 Topics</span>
                  <span className="text-[#e5e5e5]">&#8226;</span>
                  <span>Integrals, Derivatives, Limits</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 bg-[#fcfcfc] p-4 rounded-[8px] border-[1px] border-[#222a3514] shrink-0">
              <div className="text-right">
                <div className="text-[12px] font-medium text-[#898989] uppercase tracking-wider mb-1">Mastery</div>
                <div className="text-[18px] font-bold text-[#0099ff]">45%</div>
              </div>
              <div className="w-[1px] h-[32px] bg-[#222a3514]" />
              <div className="text-right">
                <div className="text-[12px] font-medium text-[#898989] uppercase tracking-wider mb-1">Last Active</div>
                <div className="text-[14px] font-medium text-[#242424]">2h ago</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Subject Row 2 */}
        <Link
          href="/dashboard/subjects/2"
          className="block bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow group"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#fcfcfc] border-[1px] border-[#222a3514] rounded-[8px] flex items-center justify-center text-[#898989] shadow-[var(--shadow-level-1)] shrink-0">
                <Library size={20} />
              </div>
              <div>
                <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] group-hover:text-[#0099ff] transition-colors">
                  World History
                </h3>
                <div className="flex items-center gap-3 text-[14px] font-light text-[#898989] mt-1">
                  <span className="bg-[#f5f5f5] px-2 py-0.5 rounded-[6px] text-[#242424] font-medium text-[12px]">8 Topics</span>
                  <span className="text-[#e5e5e5]">&#8226;</span>
                  <span>European exploration, Industrial Revolution</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 bg-[#fcfcfc] p-4 rounded-[8px] border-[1px] border-[#222a3514] shrink-0">
              <div className="text-right">
                <div className="text-[12px] font-medium text-[#898989] uppercase tracking-wider mb-1">Mastery</div>
                <div className="text-[18px] font-bold text-[#0099ff]">82%</div>
              </div>
              <div className="w-[1px] h-[32px] bg-[#222a3514]" />
              <div className="text-right">
                <div className="text-[12px] font-medium text-[#898989] uppercase tracking-wider mb-1">Last Active</div>
                <div className="text-[14px] font-medium text-[#242424]">1d ago</div>
              </div>
            </div>
          </div>
        </Link>

        {/* Empty state card */}
        <Link
          href="/dashboard/subjects/new"
          className="block border-[2px] border-dashed border-[#e5e5e5] rounded-[12px] p-8 text-center hover:border-[#242424] hover:text-[#242424] transition-colors group"
        >
          <div className="w-12 h-12 rounded-[8px] bg-white shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] flex items-center justify-center mx-auto mb-4">
            <span className="font-[var(--font-cal)] text-[24px] text-[#898989] group-hover:text-[#242424] transition-colors">+</span>
          </div>
          <span className="font-semibold text-[16px] text-[#898989] group-hover:text-[#242424] transition-colors">Add Another Subject</span>
        </Link>
      </div>
    </div>
  );
}
