'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Brain, ChevronRight, CheckCircle2 } from 'lucide-react';

const questions = [
  {
    q: 'What is the limit of f(x) = (x\u00b2 - 1)/(x - 1) as x approaches 1?',
    options: ['0', '1', '2', 'Does not exist'],
    correct: 2,
  },
  {
    q: 'Which of the following functions is continuous at x = 0?',
    options: ['1/x', 'sin(x)/x', '|x|/x', '|x|'],
    correct: 3,
  },
  {
    q: 'The derivative of sin(x) is:',
    options: ['-cos(x)', 'cos(x)', 'tan(x)', 'sin(x)'],
    correct: 1,
  },
];

export default function DiagnosticPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const done = answers.length === questions.length;

  function handleNext() {
    if (selected === null) return;
    setAnswers([...answers, selected]);
    setSelected(null);
    setCurrent(current + 1);
  }

  return (
    <div className="max-w-[700px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard/subjects/1/topics/1"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Limits and Continuity
      </Link>

      <div className="flex items-center gap-4 mb-[48px] pb-[48px] border-b-[1px] border-[#222a3514]">
        <div className="w-12 h-12 rounded-[12px] bg-[#f5f5f5] shadow-[var(--shadow-level-1)] flex items-center justify-center shrink-0">
          <Brain size={24} className="text-[#242424]" />
        </div>
        <div>
          <h1 className="heading-sm text-[#242424]">Diagnostic Assessment</h1>
          <p className="text-[14px] font-light text-[#898989] mt-1">
            Quick check to assess your baseline knowledge and calibrate difficulty.
          </p>
        </div>
      </div>

      {!done ? (
        <>
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[14px] font-medium text-[#898989]">
              Question {current + 1} of {questions.length}
            </span>
            <div className="flex gap-2">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-[4px] rounded-[9999px] transition-colors ${
                    i < answers.length ? 'bg-[#242424]' : i === current ? 'bg-[#898989]' : 'bg-[#e5e5e5]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-8 mb-8">
            <p className="text-[18px] font-medium text-[#242424] leading-[1.5] mb-8">
              {questions[current].q}
            </p>
            <div className="space-y-3">
              {questions[current].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left p-4 rounded-[8px] border-[1px] transition-all text-[16px] font-light ${
                    selected === i
                      ? 'border-[#242424] bg-[#f5f5f5] shadow-[var(--shadow-level-2)] font-medium'
                      : 'border-[#222a3514] bg-white hover:bg-[#fafafa] shadow-[var(--shadow-level-5)]'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border-[2px] flex items-center justify-center shrink-0 transition-colors ${
                      selected === i ? 'border-[#242424] bg-[#242424]' : 'border-[#e5e5e5]'
                    }`}>
                      {selected === i && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    {opt}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNext}
              disabled={selected === null}
              className={`bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] transition-opacity shadow-[var(--shadow-level-2)] flex items-center gap-2 ${
                selected === null ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'
              }`}
            >
              {current < questions.length - 1 ? 'Next' : 'Finish'}
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      ) : (
        /* Results */
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-[#f5f5f5] shadow-[var(--shadow-level-2)] flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={36} className="text-[#242424]" />
          </div>
          <h2 className="heading-md text-[#242424] mb-4">Diagnostic Complete</h2>
          <p className="text-[18px] font-light text-[#898989] mb-2">
            Score: <span className="font-semibold text-[#242424]">{answers.filter((a, i) => a === questions[i].correct).length}/{questions.length}</span>
          </p>
          <p className="text-[16px] font-light text-[#898989] leading-[1.5] max-w-[480px] mx-auto mb-12">
            Based on your responses, we&apos;ll tailor quizzes and study guides to match your current level.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard/subjects/1/topics/1/study-guide"
              className="bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)]"
            >
              View Study Guide
            </Link>
            <Link
              href="/dashboard/subjects/1/topics/1"
              className="bg-white text-[#242424] px-6 py-[12px] text-[14px] font-semibold rounded-[8px] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5] transition-colors"
            >
              Back to Topic
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
