'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Send, Mic, Sparkles, BookOpen, Clock } from 'lucide-react';

export default function AuthenticatedCoachPage() {
  const [message, setMessage] = useState('');

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] md:h-screen">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b-[1px] border-[#222a3514] bg-white shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
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
              <span className="text-[12px] text-[#898989] font-medium">General Session</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#898989]">
          <Clock size={14} />
          <span>Session started just now</span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[800px] mx-auto px-4 py-8 space-y-8">
          {/* AI Welcome */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#242424] shrink-0 flex items-center justify-center shadow-[var(--shadow-level-2)]">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="pt-1 space-y-4 flex-1 min-w-0">
              <p className="text-[16px] font-light text-[#242424] leading-[1.6]">
                Welcome back, Jane! I have access to all your subjects and progress.
                What would you like to work on today?
              </p>

              {/* Subject Quick Links */}
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <Link
                  href="/dashboard/subjects/1/topics/1/chat"
                  className="flex items-center gap-3 p-4 bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] transition-shadow group"
                >
                  <BookOpen size={18} className="text-[#898989] group-hover:text-[#242424] transition-colors shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-[#242424] truncate group-hover:text-[#0099ff] transition-colors">
                      Limits &amp; Continuity
                    </div>
                    <div className="text-[12px] text-[#898989]">Calculus 101 &middot; 80% mastery</div>
                  </div>
                </Link>
                <Link
                  href="/dashboard/subjects/2/topics/1/chat"
                  className="flex items-center gap-3 p-4 bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] hover:shadow-[var(--shadow-level-3)] transition-shadow group"
                >
                  <BookOpen size={18} className="text-[#898989] group-hover:text-[#242424] transition-colors shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-[#242424] truncate group-hover:text-[#0099ff] transition-colors">
                      Industrial Revolution
                    </div>
                    <div className="text-[12px] text-[#898989]">World History &middot; 82% mastery</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* User Message Example */}
          <div className="flex gap-4 justify-end">
            <div className="bg-[#f5f5f5] rounded-[12px] rounded-tr-[4px] px-5 py-3 max-w-[75%]">
              <p className="text-[16px] font-light text-[#242424] leading-[1.6]">
                Can you explain the epsilon-delta definition of limits?
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#e5e5e5] shrink-0 flex items-center justify-center text-[12px] font-bold text-[#242424] shadow-[var(--shadow-level-1)]">
              JD
            </div>
          </div>

          {/* AI Response */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-[#242424] shrink-0 flex items-center justify-center shadow-[var(--shadow-level-2)]">
              <Sparkles size={14} className="text-white" />
            </div>
            <div className="pt-1 flex-1 min-w-0 space-y-4">
              <p className="text-[16px] font-light text-[#242424] leading-[1.6]">
                Great question! The epsilon-delta definition is the rigorous mathematical way to define what it means for a function to approach a limit. Let me break it down:
              </p>
              {/* Generative UI Card */}
              <div className="bg-white p-6 rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)]">
                <h4 className="heading-xs text-[#242424] mb-3">Formal Definition</h4>
                <div className="bg-[#fafafa] p-4 rounded-[8px] font-mono text-[14px] text-[#242424] leading-[1.8]">
                  For every &epsilon; &gt; 0, there exists a &delta; &gt; 0 such that
                  if 0 &lt; |x - c| &lt; &delta;, then |f(x) - L| &lt; &epsilon;.
                </div>
                <p className="mt-4 text-[14px] font-light text-[#898989] leading-[1.5]">
                  In plain English: you can make f(x) as close to L as you want by
                  choosing x close enough to c.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="shrink-0 border-t-[1px] border-[#222a3514] bg-white p-4">
        <div className="max-w-[800px] mx-auto">
          <div className="relative shadow-[var(--shadow-level-2)] rounded-[12px] bg-white border-[1px] border-[#222a3514] focus-within:ring-1 focus-within:ring-[#3b82f6] transition-shadow">
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask your coach anything..."
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
            AI can make mistakes. Always verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
