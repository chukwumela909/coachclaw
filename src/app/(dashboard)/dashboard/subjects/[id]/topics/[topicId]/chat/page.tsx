'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Mic, Sparkles, BookOpen } from 'lucide-react';

export default function TopicCoachPage() {
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b-[1px] border-[#222a3514] bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/subjects/1/topics/1"
            className="text-[#898989] hover:text-[#242424] transition-colors p-1"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#242424] flex items-center justify-center shadow-[var(--shadow-level-2)]">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-[16px] font-semibold text-[#242424] leading-tight">AI Coach</h1>
              <span className="text-[12px] text-[#0099ff] font-medium flex items-center gap-1">
                <BookOpen size={10} />
                Limits and Continuity
              </span>
            </div>
          </div>
        </div>
        <div className="text-[12px] text-[#898989] font-medium bg-[#f5f5f5] px-3 py-1 rounded-[9999px]">
          Topic Scope
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-4 py-8 space-y-8">
          {/* AI */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#242424] shrink-0 flex items-center justify-center shadow-[var(--shadow-level-2)]">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="pt-1 space-y-3 flex-1 min-w-0">
              <p className="text-[16px] font-light text-[#242424] leading-[1.6]">
                I&apos;m your AI coach for <span className="font-semibold">Limits and Continuity</span>.
                I have access to your uploaded resources and know your current mastery is at 80%.
              </p>
              <p className="text-[16px] font-light text-[#242424] leading-[1.6]">
                What would you like to explore? I can explain concepts, walk through practice problems,
                or help you prepare for your next quiz.
              </p>
            </div>
          </div>

          {/* Suggested Actions */}
          <div className="ml-12 flex flex-wrap gap-2">
            {[
              'Explain epsilon-delta',
              'Practice problems',
              'Review my mistakes',
              'Prep for quiz',
            ].map((s) => (
              <button
                key={s}
                className="bg-white border-[1px] border-[#222a3514] shadow-[var(--shadow-level-5)] rounded-[9999px] px-4 py-2 text-[14px] font-medium text-[#242424] hover:bg-[#f5f5f5] hover:shadow-[var(--shadow-level-2)] transition-all"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t-[1px] border-[#222a3514] bg-white p-4">
        <div className="max-w-[800px] mx-auto">
          <div className="relative shadow-[var(--shadow-level-2)] rounded-[12px] bg-white border-[1px] border-[#222a3514] focus-within:ring-1 focus-within:ring-[#3b82f6] transition-shadow">
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about limits and continuity..."
              className="w-full resize-none bg-transparent py-4 pl-4 pr-24 outline-none text-[16px] font-light text-[#242424] placeholder-[#898989]"
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <button className="p-2 text-[#898989] hover:text-[#242424] hover:bg-[#f5f5f5] rounded-[8px] transition-colors">
                <Mic size={20} />
              </button>
              <button className="p-2 text-white bg-[#242424] rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)]">
                <Send size={20} />
              </button>
            </div>
          </div>
          <p className="text-center mt-3 text-[12px] text-[#898989]">
            Scoped to your Limits &amp; Continuity resources and progress.
          </p>
        </div>
      </div>
    </div>
  );
}
