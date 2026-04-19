import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function SubjectDetail() {
  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Dashboard
      </Link>
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-[48px] border-b-[1px] border-[#222a3514] pb-[48px]">
        <div>
          <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">Calculus 101</h1>
          <p className="text-[18px] font-light text-[#898989] leading-[1.5]">Overall Mastery: 45%</p>
        </div>
        <Link
          href="/dashboard/subjects/1/topics/new"
          className="bg-white text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5] transition-colors shrink-0 whitespace-nowrap"
        >
          + Add Topic
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="heading-sm text-[#242424] mb-6">Topics</h2>

        {/* Topic Card */}
        <Link 
          href="/dashboard/subjects/1/topics/1" 
          className="block bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow group"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
            <div>
              <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">
                Limits and Continuity
              </h3>
              <div className="flex items-center gap-3 text-[14px] font-light text-[#898989]">
                <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px] text-[#242424] font-medium">3 Resources</span>
                <span className="text-[#e5e5e5]">•</span>
                <span>Study Guide Generated</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-8 bg-[#fcfcfc] p-4 rounded-[8px] border-[1px] border-[#222a3514]">
              <div className="text-left sm:text-right">
                <div className="text-[12px] font-medium text-[#898989] mb-1 uppercase tracking-wider">MASTERY</div>
                <div className="text-[18px] font-bold text-[#0099ff]">80%</div>
              </div>
              <div className="w-[1px] h-[32px] bg-[#222a3514]" />
              <div className="text-left sm:text-right">
                <div className="text-[12px] font-medium text-[#898989] mb-1 uppercase tracking-wider">QUESTIONS</div>
                <div className="text-[18px] font-bold text-[#242424]">42/50</div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Next Topic Card */}
        <Link 
          href="/dashboard/subjects/1/topics/2" 
          className="block bg-white rounded-[12px] shadow-[var(--shadow-level-2)] border-[1px] border-[#222a3514] p-6 hover:shadow-[var(--shadow-level-3)] transition-shadow group"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
            <div>
              <h3 className="font-[var(--font-cal)] font-semibold text-[24px] text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">
                Intro to Derivatives
              </h3>
              <div className="flex items-center gap-3 text-[14px] font-light text-[#898989]">
                <span className="bg-[#f5f5f5] px-2 py-1 rounded-[6px] text-[#242424] font-medium">1 Resource</span>
                <span className="text-[#e5e5e5]">•</span>
                <span>Not Started</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-8 bg-[#fcfcfc] p-4 rounded-[8px] border-[1px] border-[#222a3514]">
              <div className="text-left sm:text-right">
                <div className="text-[12px] font-medium text-[#898989] mb-1 uppercase tracking-wider">MASTERY</div>
                <div className="text-[18px] font-bold text-[#242424]">0%</div>
              </div>
               <div className="w-[1px] h-[32px] bg-[#222a3514]" />
              <div className="text-left sm:text-right">
                <div className="text-[12px] font-medium text-[#898989] mb-1 uppercase tracking-wider">QUESTIONS</div>
                <div className="text-[18px] font-bold text-[#242424]">0/0</div>
              </div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
