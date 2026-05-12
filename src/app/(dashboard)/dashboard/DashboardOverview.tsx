import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Plus, Target } from "lucide-react";

export type DashboardSubjectSummary = {
  _id: unknown;
  name: string;
  description?: string;
  topicCount: number;
};

type DashboardOverviewProps = {
  firstName: string;
  subjects: DashboardSubjectSummary[];
};

export function DashboardOverview({ firstName, subjects }: DashboardOverviewProps) {
  const totalTopics = subjects.reduce((sum, subject) => sum + subject.topicCount, 0);
  const activeSubjects = subjects.length;

  return (
    <div className="mx-auto w-full max-w-[300px] px-0 py-6 sm:max-w-[1120px] sm:px-6 md:px-10 md:py-10">
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#6f6f6f]">
            Welcome back, {firstName}
          </p>
          <h1 className="font-[var(--font-cal)] text-[40px] leading-[1] tracking-[0] text-[#242424] sm:text-[52px]">
            Dashboard
          </h1>
          <p className="mt-3 max-w-[640px] text-[16px] leading-[1.55] text-[#656565]">
            Scan progress, pick the next subject, and keep your study loop moving.
          </p>
        </div>
        <Link
          href="/dashboard/subjects/new"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[8px] bg-[#242424] px-4 py-2.5 text-[14px] font-semibold text-white shadow-[var(--shadow-level-2)] transition-transform hover:-translate-y-0.5"
        >
          <Plus aria-hidden="true" size={17} strokeWidth={2.5} />
          Add subject
        </Link>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[8px] border border-[#222a3514] bg-[#fffdf8] p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#ece6d9] text-[#355943]">
            <BookOpen aria-hidden="true" size={17} strokeWidth={2.3} />
          </div>
          <p className="text-[28px] font-semibold leading-none text-[#242424]">{activeSubjects}</p>
          <p className="mt-1 text-[13px] font-medium text-[#6f6f6f]">Active subjects</p>
        </div>
        <div className="rounded-[8px] border border-[#222a3514] bg-[#fffdf8] p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#e8f0e9] text-[#355943]">
            <Target aria-hidden="true" size={17} strokeWidth={2.3} />
          </div>
          <p className="text-[28px] font-semibold leading-none text-[#242424]">{totalTopics}</p>
          <p className="mt-1 text-[13px] font-medium text-[#6f6f6f]">Topics mapped</p>
        </div>
        <div className="rounded-[8px] border border-[#222a3514] bg-[#fffdf8] p-4">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#f2eadc] text-[#9f5725]">
            <Clock3 aria-hidden="true" size={17} strokeWidth={2.3} />
          </div>
          <p className="text-[28px] font-semibold leading-none text-[#242424]">0%</p>
          <p className="mt-1 text-[13px] font-medium text-[#6f6f6f]">Average mastery</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[10px] border border-[#222a3514] bg-white shadow-[var(--shadow-level-5)]">
        <div className="flex items-center justify-between border-b border-[#222a3514] px-4 py-3 sm:px-5">
          <div>
            <h2 className="text-[15px] font-semibold text-[#242424]">Subjects</h2>
            <p className="text-[13px] text-[#6f6f6f]">Choose where to continue.</p>
          </div>
          <span className="hidden rounded-[999px] bg-[#f0eee8] px-3 py-1 text-[13px] font-semibold text-[#57534e] sm:inline-flex">
            {activeSubjects} active
          </span>
        </div>

        <div className="divide-y divide-[#222a3514]">
          {subjects.map((subject) => {
            const subjectId = String(subject._id);
          return (
            <Link
              key={subjectId}
              href={`/dashboard/subjects/${subjectId}`}
                className="group grid gap-4 px-4 py-4 transition-colors hover:bg-[#fbfaf6] sm:grid-cols-[1fr_auto] sm:items-center sm:px-5"
            >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-[var(--font-cal)] text-[22px] font-semibold text-[#242424] transition-colors group-hover:text-[#355943]">
                      {subject.name}
                    </h3>
                    <span className="rounded-[999px] bg-[#f0eee8] px-2.5 py-1 text-[12px] font-semibold text-[#57534e]">
                      {subject.topicCount} {subject.topicCount === 1 ? "topic" : "topics"}
                    </span>
                  </div>

                  <p className="mt-2 max-w-[640px] text-[14px] leading-[1.5] text-[#656565]">
                    {subject.description || "No description yet. Add topics to start building this subject."}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-24 overflow-hidden rounded-[999px] bg-[#e8e8e3]">
                      <div className="h-full w-0 rounded-[999px] bg-[#355943]" />
                    </div>
                    <span className="text-[13px] font-semibold text-[#57534e]">0%</span>
                  </div>
                  <ArrowRight aria-hidden="true" className="text-[#355943] transition-transform group-hover:translate-x-0.5" size={18} strokeWidth={2.4} />
                </div>
            </Link>
          );
        })}

        <Link
          href="/dashboard/subjects/new"
            className="flex items-center gap-3 px-4 py-4 text-[14px] font-semibold text-[#6f6f6f] transition-colors hover:bg-[#fbfaf6] hover:text-[#242424] sm:px-5"
        >
            <div className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-dashed border-[#b9b4aa] bg-[#fffdf8]">
              <Plus aria-hidden="true" size={17} strokeWidth={2.4} />
          </div>
            Create new subject
        </Link>
      </div>
      </section>
    </div>
  );
}
