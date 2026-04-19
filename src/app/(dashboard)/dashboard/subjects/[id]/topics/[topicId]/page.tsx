import Link from 'next/link';
import { ChevronLeft, FileText, Activity, BookOpen, Clock, UploadCloud, PlayCircle, ClipboardCheck } from 'lucide-react';

export default function TopicDetail() {
  return (
    <div className="max-w-[1000px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard/subjects/1"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Calculus 101
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-[48px] border-b-[1px] border-[#222a3514] mb-[48px]">
        <div>
          <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">Limits and Continuity</h1>
          <p className="text-[18px] font-light text-[#898989] flex items-center gap-4">
            Topic Mastery: <span className="font-semibold text-[#0099ff]">80%</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/dashboard/subjects/1/topics/1/resources/upload"
            className="bg-white text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5] transition-colors flex items-center gap-2"
          >
            <UploadCloud size={18} />
            Add Resource
          </Link>
          <Link
            href="/dashboard/subjects/1/topics/1/chat"
            className="bg-[#242424] text-white px-5 py-[12px] text-[14px] font-semibold rounded-[8px] shadow-[var(--shadow-level-2)] hover:opacity-80 transition-opacity flex items-center gap-2"
          >
            <PlayCircle size={18} />
            Coach Me
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-12">
          {/* Actions */}
          <section className="grid sm:grid-cols-3 gap-6">
            <Link
              href="/dashboard/subjects/1/topics/1/study-guide"
              className="bg-white p-8 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] transition-shadow group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <BookOpen size={80} />
              </div>
              <BookOpen size={24} className="text-[#242424] mb-6" />
              <h3 className="heading-sm text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">Study Guide</h3>
              <p className="text-[14px] font-light text-[#898989] leading-[1.5]">Review AI-generated concepts synthesized from your resources.</p>
            </Link>

            <Link
              href="/dashboard/subjects/1/topics/1/quiz/new"
              className="bg-[#fafafa] p-8 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] hover:bg-white transition-all group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Activity size={80} />
              </div>
              <Activity size={24} className="text-[#242424] mb-6" />
              <h3 className="heading-sm text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">Take Quiz</h3>
              <p className="text-[14px] font-light text-[#898989] leading-[1.5]">Test your knowledge with adaptive active recall questions.</p>
            </Link>

            <Link
              href="/dashboard/subjects/1/topics/1/diagnostic"
              className="bg-white p-8 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] transition-shadow group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <ClipboardCheck size={80} />
              </div>
              <ClipboardCheck size={24} className="text-[#242424] mb-6" />
              <h3 className="heading-sm text-[#242424] mb-2 group-hover:text-[#0099ff] transition-colors">Diagnostic</h3>
              <p className="text-[14px] font-light text-[#898989] leading-[1.5]">Assess your baseline knowledge with a short adaptive test.</p>
            </Link>
          </section>

          {/* Resources */}
          <section>
            <h2 className="heading-sm text-[#242424] mb-6">Resources</h2>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-5)] transition-shadow flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#fcfcfc] border-[1px] border-[#222a3514] rounded-[8px] flex items-center justify-center text-[#898989] shadow-[var(--shadow-level-1)] shrink-0">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-[16px] text-[#242424] mb-1 group-hover:text-[#0099ff] transition-colors">Chapter 2: Limits.pdf</div>
                    <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-wider">
                      <span className="text-[#10b981]">Parsed</span>
                      <span className="text-[#e5e5e5]">&#8226;</span>
                      <span className="text-[#898989]">2.4 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Topic Stats Sidebar */}
        <aside>
          <div className="bg-[#fcfcfc] p-8 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] sticky top-[96px]">
            <h3 className="heading-xs text-[#242424] mb-8 pb-4 border-b-[1px] border-[#222a3514]">Progress Stats</h3>
            <div className="space-y-6">
              <div>
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">Quizzes Taken</div>
                <div className="flex items-end gap-2 text-[#242424]">
                  <span className="heading-md leading-none">3</span>
                  <span className="font-medium mb-1">sessions</span>
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">Average Score</div>
                <div className="flex items-end gap-2 text-[#0099ff]">
                  <span className="heading-md leading-none">82</span>
                  <span className="font-medium mb-1">%</span>
                </div>
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">Time Studied</div>
                <div className="flex items-center gap-3 text-[#242424]">
                  <Clock size={24} className="text-[#898989]" />
                  <span className="font-semibold text-[24px]">1h 45m</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
