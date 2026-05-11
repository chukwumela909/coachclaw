import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b-[1px] border-[#222a3514]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-extrabold text-[20px] tracking-tight text-[#242424] font-[var(--font-cal)]">
            CoachClaw
          </div>
          <div className="hidden md:flex gap-6 font-medium text-[14px] text-[#898989]">
            <Link href="#features" className="hover:text-[#111111] transition-colors">Features</Link>
            <Link href="/chat" className="hover:text-[#111111] transition-colors">Try Guest Coach</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-medium text-[14px] text-[#111111]">Log in</Link>
            <Link 
              href="/signup" 
              className="bg-[#242424] text-white px-4 py-[10px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity flex items-center gap-2 shadow-[var(--shadow-level-2)] relative overflow-hidden group"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-6 pt-[120px] pb-[96px] text-center">
        <h1 className="heading-lg mx-auto max-w-[800px] text-[#242424] tracking-tight">
          Learn anything deeply with an AI coach that adapts to you.
        </h1>
        <p className="mt-[24px] mx-auto max-w-[600px] text-[18px] font-light text-[#898989] leading-[1.5] -tracking-[0.2px]">
          Upload any resource &mdash; PDFs, links, or text &mdash; and let the AI build personalized study guides, active recall quizzes, and guide you through a conversational learning journey.
        </p>
        <div className="mt-[48px] flex justify-center gap-4">
          <Link 
            href="/signup" 
            className="bg-[#242424] text-white px-6 py-[14px] text-[16px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] relative overflow-hidden flex items-center gap-2"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
            Start Learning
          </Link>
          <Link 
            href="/chat" 
            className="bg-white text-[#242424] shadow-[var(--shadow-level-2)] px-6 py-[14px] text-[16px] font-semibold rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
          >
            Try without account
          </Link>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="bg-[#f5f5f5] py-[96px]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-[80px] items-center">
            {/* Text Side */}
            <div>
              <h2 className="heading-md text-[#242424] mb-[24px]">
                Transform resources into mastery.
              </h2>
              <p className="text-[16px] font-light text-[#898989] leading-[1.5] mb-[32px]">
                Drop in your syllabus or that 100-page dense textbook. CoachClaw maps it out, generates adaptive diagnostics, and tracks your retention per topic over time. Next-gen spaced repetition.
              </p>
              
              <ul className="space-y-[16px] text-[14px] font-medium text-[#242424]">
                <li className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-[var(--shadow-level-2)]">✓</div>
                  Dynamic Generative UI Study Cards
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-[var(--shadow-level-2)]">✓</div>
                  Realtime Voice Coaching
                </li>
                <li className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-[var(--shadow-level-2)]">✓</div>
                  Spaced Repetition Tracking
                </li>
              </ul>
            </div>
            
            {/* Mockup */}
            <div className="bg-white rounded-[12px] shadow-[var(--shadow-level-2)] aspect-[4/3] border-[1px] border-[#222a3514] p-6 relative overflow-hidden select-none">
              {/* Window dots */}
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-[#f5f5f5]"></div>
                <div className="w-3 h-3 rounded-full bg-[#f5f5f5]"></div>
                <div className="w-3 h-3 rounded-full bg-[#f5f5f5]"></div>
              </div>
              {/* Fake UI */}
              <div className="space-y-4">
                <div className="w-[60%] h-[24px] bg-[#f5f5f5] rounded-[4px]"></div>
                <div className="w-full h-[12px] bg-[#f5f5f5] rounded-[2px]"></div>
                <div className="w-[85%] h-[12px] bg-[#f5f5f5] rounded-[2px]"></div>
                <div className="mt-6 p-4 rounded-[8px] border border-[#222a3514] shadow-[var(--shadow-level-5)]">
                  <div className="w-[40%] h-[16px] bg-[#242424] rounded-[4px] mb-3"></div>
                  <div className="w-full h-[12px] bg-[#f5f5f5] rounded-[2px] mb-2"></div>
                  <div className="w-[70%] h-[12px] bg-[#f5f5f5] rounded-[2px]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
