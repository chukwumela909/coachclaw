'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, FileText, Sliders, Zap } from 'lucide-react';

export default function QuizSetupPage() {
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedResources, setSelectedResources] = useState<string[]>(['all']);

  const resources = [
    { id: 'all', name: 'All Resources', desc: 'Generate from everything' },
    { id: 'ch2', name: 'Chapter 2: Limits.pdf', desc: '2.4 MB' },
    { id: 'notes', name: 'Lecture Notes - Week 3', desc: 'Text' },
  ];

  return (
    <div className="max-w-[700px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard/subjects/1/topics/1"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Limits and Continuity
      </Link>

      <div className="mb-[48px] pb-[48px] border-b-[1px] border-[#222a3514]">
        <h1 className="heading-lg text-[#242424] tracking-tight">Quiz Setup</h1>
        <p className="mt-4 text-[16px] font-light text-[#898989] leading-[1.5]">
          Configure your quiz and select which resources to draw questions from.
        </p>
      </div>

      <div className="space-y-10">
        {/* Resource Selection */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText size={18} className="text-[#898989]" />
            <h2 className="text-[16px] font-semibold text-[#242424]">Source Materials</h2>
          </div>
          <div className="space-y-3">
            {resources.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  if (r.id === 'all') { setSelectedResources(['all']); return; }
                  const without = selectedResources.filter(x => x !== 'all' && x !== r.id);
                  setSelectedResources(selectedResources.includes(r.id) ? without : [...without, r.id]);
                }}
                className={`w-full text-left p-4 rounded-[8px] border-[1px] transition-all flex items-center gap-4 ${
                  selectedResources.includes(r.id)
                    ? 'border-[#242424] bg-[#fafafa] shadow-[var(--shadow-level-2)]'
                    : 'border-[#222a3514] bg-white shadow-[var(--shadow-level-5)] hover:bg-[#fafafa]'
                }`}
              >
                <div className={`w-5 h-5 rounded-[4px] border-[2px] flex items-center justify-center shrink-0 transition-colors ${
                  selectedResources.includes(r.id) ? 'border-[#242424] bg-[#242424]' : 'border-[#e5e5e5]'
                }`}>
                  {selectedResources.includes(r.id) && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#242424]">{r.name}</p>
                  <p className="text-[12px] text-[#898989]">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Question Count */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Sliders size={18} className="text-[#898989]" />
            <h2 className="text-[16px] font-semibold text-[#242424]">Number of Questions</h2>
          </div>
          <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-light text-[#898989]">Questions</span>
              <span className="heading-sm text-[#242424]">{questionCount}</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              step={5}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full accent-[#242424]"
            />
            <div className="flex justify-between mt-2 text-[12px] text-[#898989]">
              <span>5</span>
              <span>15</span>
              <span>30</span>
            </div>
          </div>
        </section>

        {/* Difficulty */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Zap size={18} className="text-[#898989]" />
            <h2 className="text-[16px] font-semibold text-[#242424]">Difficulty</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['Easy', 'Adaptive', 'Hard'].map((d, i) => (
              <button
                key={d}
                className={`p-4 rounded-[8px] text-[14px] font-semibold text-center transition-all ${
                  i === 1
                    ? 'bg-[#242424] text-white shadow-[var(--shadow-level-2)]'
                    : 'bg-white text-[#242424] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-5)] hover:bg-[#f5f5f5]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-[#898989] font-light">
            Adaptive difficulty adjusts based on your diagnostic results and past performance.
          </p>
        </section>
      </div>

      {/* Start */}
      <div className="flex justify-end gap-4 pt-10 mt-10 border-t-[1px] border-[#222a3514]">
        <Link
          href="/dashboard/subjects/1/topics/1"
          className="bg-transparent text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
        >
          Cancel
        </Link>
        <Link
          href="/dashboard/subjects/1/topics/1/quiz/abc123"
          className="bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] relative overflow-hidden flex items-center gap-2"
        >
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          Start Quiz
        </Link>
      </div>
    </div>
  );
}
