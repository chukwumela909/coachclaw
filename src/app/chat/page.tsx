import Link from 'next/link';

export default function GuestCoachPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Fast Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b-[1px] border-[#222a3514] shrink-0">
        <Link href="/" className="font-[var(--font-cal)] font-extrabold text-[20px] text-[#242424]">
          CoachClaw
        </Link>
        <div className="flex gap-4 items-center">
          <span className="text-[#898989] text-[14px] font-medium hidden sm:inline-block">Guest Session</span>
          <Link href="/signup" className="text-[14px] font-semibold text-white bg-[#242424] px-4 py-2 rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)]">
            Save Progress
          </Link>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col items-center pt-8 px-4">
        
        <div className="w-full max-w-[800px] flex-1 flex flex-col">
          {/* Chat History Placeholder */}
          <div className="flex-1 overflow-y-auto pb-4 space-y-6">
            
            {/* AI Message */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-[8px] bg-[#f5f5f5] shrink-0 flex items-center justify-center font-bold text-[#242424] shadow-[var(--shadow-level-1)]">
                AI
              </div>
              <div className="pt-1">
                <p className="text-[16px] font-light text-[#242424] leading-[1.5]">
                  Hello! I&apos;m your AI learning coach. What would you like to study today?
                  You can upload a document, paste a link, or just ask me a question.
                </p>
              </div>
            </div>

            {/* Generative UI Component Placeholder: Diagnostic Card */}
            <div className="ml-12 p-6 bg-white border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] rounded-[12px]">
              <h3 className="heading-xs text-[#242424] mb-2">Quick Concept Check</h3>
              <p className="text-[14px] font-light text-[#898989] mb-4">
                Before we begin, try answering this to gauge your level.
              </p>
              <div className="p-4 bg-[#f5f5f5] rounded-[8px] mb-4">
                <span className="text-[14px] font-medium">What is the capital of France?</span>
              </div>
              <button className="bg-white border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] rounded-[8px] py-2 px-4 text-[14px] font-medium hover:bg-[#f5f5f5] transition-colors">
                Answer Question
              </button>
            </div>

          </div>

          {/* Input Area */}
          <div className="shrink-0 pb-8 pt-4">
            <div className="relative shadow-[var(--shadow-level-2)] rounded-[12px] bg-white border-[1px] border-[#222a3514] focus-within:ring-1 focus-within:ring-[#3b82f6] transition-shadow">
              <textarea 
                rows={1}
                placeholder="Message your coach..."
                className="w-full resize-none bg-transparent py-4 pl-4 pr-24 outline-none text-[16px] font-light text-[#242424] placeholder-[#898989]"
              />
              <div className="absolute right-2 bottom-2 flex gap-2">
                <button className="p-2 text-[#898989] hover:text-[#242424] hover:bg-[#f5f5f5] rounded-[8px] transition-colors">
                  {/* Mic Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </button>
                <button className="p-2 text-white bg-[#242424] rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)]">
                  {/* Send Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-[12px] text-[#898989]">
                AI can make mistakes. Always verify important information.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
