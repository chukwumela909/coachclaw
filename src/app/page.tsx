import Link from 'next/link';
import { ArrowRight, Check, MessageCircle, UploadCloud } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-canvas)] text-[var(--color-charcoal)]">
      <nav className="sticky top-0 z-50 border-b border-[#222a3514] bg-white/88 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="font-[var(--font-cal)] text-[20px] font-extrabold tracking-tight text-[#242424]">
            CoachClaw
          </div>
          <div className="hidden gap-6 text-[14px] font-medium text-[#696969] md:flex">
            <Link href="#features" className="transition-colors hover:text-[#111111]">
              Features
            </Link>
            <Link href="/chat" className="transition-colors hover:text-[#111111]">
              Try Guest Coach
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <Link href="/login" className="text-[14px] font-medium text-[#111111]">
              Log in
            </Link>
            <Link
              href="/signup"
              className="relative hidden items-center gap-2 overflow-hidden rounded-[8px] bg-[#242424] px-4 py-[10px] text-[14px] font-semibold text-white shadow-[var(--shadow-level-2)] transition-opacity hover:opacity-85 sm:flex"
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative isolate overflow-hidden bg-[linear-gradient(120deg,#f8f3ea_0%,#ffffff_46%,#eaf3ee_100%)]">
        <div className="absolute inset-0 -z-10 opacity-[0.38] [background-image:linear-gradient(90deg,rgba(36,36,36,0.07)_1px,transparent_1px),linear-gradient(rgba(36,36,36,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="mx-auto grid min-h-[calc(100svh-64px)] max-w-[1200px] items-center gap-10 px-6 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-20">
          <div className="w-full min-w-0 max-w-[340px] sm:max-w-full lg:max-w-[680px]">
            <p className="mb-5 font-[var(--font-cal)] text-[18px] font-semibold tracking-tight text-[#355943]">
              CoachClaw
            </p>
            <h1 className="font-[var(--font-cal)] text-[clamp(2.8rem,11vw,5.75rem)] leading-[0.94] tracking-[0] text-[#242424]">
              <span className="block">Turn any</span>
              <span className="block">resource into</span>
              <span className="block">a coach-led</span>
              <span className="block">study path.</span>
            </h1>
            <p className="mt-6 max-w-full text-[17px] leading-[1.55] text-[#585858] sm:text-[18px] lg:max-w-[620px]">
              Upload PDFs, links, or notes. CoachClaw builds the guide, checks recall, and keeps the lesson moving when you get stuck.
            </p>
            <div className="mt-9 flex w-full max-w-full flex-col gap-3 sm:max-w-none sm:flex-row">
              <Link
                href="/signup"
                className="relative inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-[8px] bg-[#242424] px-5 py-[13px] text-[16px] font-semibold text-white shadow-[var(--shadow-level-2)] transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                Start learning
                <ArrowRight aria-hidden="true" size={18} strokeWidth={2.4} />
              </Link>
              <Link
                href="/chat"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[8px] bg-white/85 px-5 py-[13px] text-[16px] font-semibold text-[#242424] shadow-[var(--shadow-level-2)] transition-colors hover:bg-white sm:w-auto"
              >
                Try guest coach
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full min-w-0 max-w-[300px] sm:max-w-[520px] lg:justify-self-end" aria-label="A CoachClaw study path preview">
            <div className="absolute -left-6 top-8 hidden h-[84%] w-[2px] bg-gradient-to-b from-transparent via-[#355943] to-transparent opacity-40 sm:block" />
            <div className="relative max-w-full space-y-4 overflow-hidden rounded-[20px] border border-[#d7d1c4] bg-[#fffdf8]/92 p-4 shadow-[0_26px_80px_rgba(36,36,36,0.14)] sm:p-5">
              <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[#e6dfd2] pb-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#6b735f]">Today&apos;s path</p>
                  <p className="mt-1 truncate font-[var(--font-cal)] text-[24px] font-semibold text-[#242424]">Photosynthesis</p>
                </div>
                <div className="hidden shrink-0 rounded-full bg-[#355943] px-3 py-1.5 text-[13px] font-semibold text-white sm:block">68%</div>
              </div>

              <div className="grid gap-3">
                <div className="flex gap-3 rounded-[12px] bg-[#f2eadc] p-4">
                  <UploadCloud aria-hidden="true" className="mt-0.5 shrink-0 text-[#355943]" size={22} strokeWidth={2.2} />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#242424]">Resource mapped</p>
                    <p className="mt-1 text-[14px] leading-[1.45] text-[#626262]">Chapter 8 split into 5 coachable concepts.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-[12px] bg-white p-4 shadow-[var(--shadow-level-5)]">
                  <MessageCircle aria-hidden="true" className="mt-0.5 shrink-0 text-[#9f5725]" size={22} strokeWidth={2.2} />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#242424]">Coach prompt</p>
                    <p className="mt-1 text-[14px] leading-[1.45] text-[#626262]">Explain why chlorophyll looks green before the quiz unlocks.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#e6dfd2] bg-white/80 p-4">
                  <span className="text-[14px] font-semibold text-[#242424]">Next recall check</span>
                  <span className="shrink-0 text-[14px] font-semibold text-[#355943]">4 questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#15211b] py-[72px] sm:py-24">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <h2 className="heading-md mb-5 max-w-[11ch] text-white">
                Transform resources into mastery.
              </h2>
              <p className="mb-8 max-w-[560px] text-[17px] leading-[1.6] text-[#d8dfd6]">
                Drop in a syllabus or a dense textbook. CoachClaw maps the topic, diagnoses weak spots, and brings the next question forward at the right time.
              </p>

              <ul className="space-y-4 text-[15px] font-medium text-white">
                <li className="flex items-center gap-3">
                  <Check aria-hidden="true" size={19} className="text-[#f3b36a]" strokeWidth={2.5} />
                  Generative study cards for each concept
                </li>
                <li className="flex items-center gap-3">
                  <Check aria-hidden="true" size={19} className="text-[#f3b36a]" strokeWidth={2.5} />
                  Real-time voice coaching
                </li>
                <li className="flex items-center gap-3">
                  <Check aria-hidden="true" size={19} className="text-[#f3b36a]" strokeWidth={2.5} />
                  Spaced repetition tracking
                </li>
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-[16px] border border-white/12 bg-[#f7f1e8] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
              <div className="mb-6 flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#dfd6c8]" />
                <div className="h-3 w-3 rounded-full bg-[#dfd6c8]" />
                <div className="h-3 w-3 rounded-full bg-[#dfd6c8]" />
              </div>
              <div className="space-y-4">
                <div className="h-6 w-[62%] rounded-[4px] bg-[#242424]" />
                <div className="h-3 w-full rounded-[2px] bg-[#dfd6c8]" />
                <div className="h-3 w-[86%] rounded-[2px] bg-[#dfd6c8]" />
                <div className="mt-6 rounded-[10px] border border-[#ded4c4] bg-white p-4 shadow-[var(--shadow-level-5)]">
                  <div className="mb-3 h-4 w-[40%] rounded-[4px] bg-[#355943]" />
                  <div className="mb-2 h-3 w-full rounded-[2px] bg-[#e8e1d5]" />
                  <div className="h-3 w-[70%] rounded-[2px] bg-[#e8e1d5]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
