'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Clock, Mic, ChevronRight } from 'lucide-react';

const quizQuestions = [
  {
    q: 'What is the formal definition of a limit?',
    type: 'mcq',
    options: [
      'f(c) = L',
      'For every \u03b5 > 0, there exists \u03b4 > 0 such that |f(x) - L| < \u03b5 when 0 < |x - c| < \u03b4',
      'The derivative at point c equals L',
      'The integral from 0 to c equals L',
    ],
    correct: 1,
  },
  {
    q: 'True or False: If f(2) = 5, then lim(x\u21922) f(x) = 5.',
    type: 'tf',
    options: ['True', 'False'],
    correct: 1,
  },
  {
    q: 'Evaluate: lim(x\u21920) sin(x)/x',
    type: 'mcq',
    options: ['0', '1', '\u221e', 'Does not exist'],
    correct: 1,
  },
];

export default function QuizSessionPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const total = quizQuestions.length;
  const isDone = answers.length === total;

  function handleNext() {
    if (selected === null) return;
    const next = [...answers, selected];
    setAnswers(next);
    setSelected(null);
    if (current < total - 1) setCurrent(current + 1);
  }

  if (isDone) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="heading-md text-[#242424] mb-4">Quiz Complete!</div>
          <p className="text-[16px] font-light text-[#898989] mb-8">Redirecting to results...</p>
          <Link
            href="/dashboard/subjects/1/topics/1/quiz/abc123/results"
            className="bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)]"
          >
            View Results
          </Link>
        </div>
      </div>
    );
  }

  const q = quizQuestions[current];

  return (
    <div className="max-w-[700px] mx-auto p-6 md:p-12">
      {/* Quiz Header */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard/subjects/1/topics/1"
          className="p-2 text-[#898989] hover:text-[#242424] hover:bg-[#f5f5f5] rounded-[8px] transition-colors"
        >
          <X size={20} />
        </Link>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[14px] font-medium text-[#898989]">
            <Clock size={16} />
            <span>4:32</span>
          </div>
          <button className="p-2 text-[#898989] hover:text-[#242424] hover:bg-[#f5f5f5] rounded-[8px] transition-colors">
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between text-[12px] font-medium text-[#898989] mb-2">
          <span>{current + 1} of {total}</span>
          <span>{Math.round(((current) / total) * 100)}%</span>
        </div>
        <div className="h-[4px] bg-[#f5f5f5] rounded-[9999px] overflow-hidden">
          <div
            className="h-full bg-[#242424] rounded-[9999px] transition-all duration-500"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-10">
        <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-4">
          {q.type === 'mcq' ? 'Multiple Choice' : 'True / False'}
        </div>
        <h2 className="heading-sm text-[#242424] leading-[1.4]">{q.q}</h2>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-10">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left p-5 rounded-[12px] border-[1px] transition-all ${
              selected === i
                ? 'border-[#242424] bg-[#fafafa] shadow-[var(--shadow-level-2)]'
                : 'border-[#222a3514] bg-white shadow-[var(--shadow-level-5)] hover:shadow-[var(--shadow-level-2)] hover:bg-[#fafafa]'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className={`w-8 h-8 rounded-full border-[2px] flex items-center justify-center shrink-0 text-[12px] font-bold transition-colors ${
                selected === i
                  ? 'border-[#242424] bg-[#242424] text-white'
                  : 'border-[#e5e5e5] text-[#898989]'
              }`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className={`text-[16px] font-light ${selected === i ? 'font-medium text-[#242424]' : 'text-[#242424]'}`}>
                {opt}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Next */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={selected === null}
          className={`bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] transition-opacity shadow-[var(--shadow-level-2)] flex items-center gap-2 ${
            selected === null ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80'
          }`}
        >
          {current < total - 1 ? 'Next Question' : 'Finish Quiz'}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
