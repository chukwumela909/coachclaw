import Link from 'next/link';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, ChevronLeft } from 'lucide-react';

const results = [
  {
    q: 'What is the formal definition of a limit?',
    chosen: 'For every \u03b5 > 0, there exists \u03b4 > 0...',
    correct: true,
    explanation: 'The epsilon-delta definition is the standard rigorous formulation of limits.',
  },
  {
    q: 'If f(2) = 5, then lim(x\u21922) f(x) = 5.',
    chosen: 'False',
    correct: true,
    explanation: 'Correct! The function value at a point does not determine the limit.',
  },
  {
    q: 'Evaluate: lim(x\u21920) sin(x)/x',
    chosen: '0',
    correct: false,
    answer: '1',
    explanation: 'This is a fundamental limit in calculus. As x approaches 0, sin(x)/x approaches 1.',
  },
];

export default function QuizResultsPage() {
  const score = results.filter(r => r.correct).length;
  const total = results.length;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="max-w-[800px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard/subjects/1/topics/1"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Limits and Continuity
      </Link>

      {/* Score Header */}
      <div className="text-center mb-[48px] pb-[48px] border-b-[1px] border-[#222a3514]">
        <div className="w-24 h-24 rounded-full border-[4px] border-[#242424] flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-level-2)]">
          <span className="heading-md text-[#242424]">{pct}%</span>
        </div>
        <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">Quiz Results</h1>
        <p className="text-[18px] font-light text-[#898989]">
          You answered <span className="font-semibold text-[#242424]">{score}</span> out of <span className="font-semibold text-[#242424]">{total}</span> correctly
        </p>
      </div>

      {/* Per-Question Breakdown */}
      <div className="space-y-4 mb-12">
        <h2 className="heading-sm text-[#242424] mb-6">Question Breakdown</h2>
        {results.map((r, i) => (
          <div
            key={i}
            className={`bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-6 ${
              !r.correct ? 'border-l-[3px] border-l-[#ef4444]' : 'border-l-[3px] border-l-[#10b981]'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              {r.correct ? (
                <CheckCircle2 size={20} className="text-[#10b981] shrink-0 mt-0.5" />
              ) : (
                <XCircle size={20} className="text-[#ef4444] shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-medium text-[#242424] leading-[1.4]">{r.q}</p>
                <div className="mt-2 flex items-center gap-2 text-[14px]">
                  <span className="font-medium text-[#898989]">Your answer:</span>
                  <span className={`font-semibold ${r.correct ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {r.chosen}
                  </span>
                </div>
                {!r.correct && (
                  <div className="mt-1 flex items-center gap-2 text-[14px]">
                    <span className="font-medium text-[#898989]">Correct answer:</span>
                    <span className="font-semibold text-[#10b981]">{r.answer}</span>
                  </div>
                )}
                <p className="mt-3 text-[14px] font-light text-[#898989] leading-[1.5] bg-[#fafafa] p-3 rounded-[8px]">
                  {r.explanation}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t-[1px] border-[#222a3514]">
        <Link
          href="/dashboard/subjects/1/topics/1/quiz/new"
          className="inline-flex items-center justify-center gap-2 bg-white text-[#242424] px-6 py-[12px] text-[14px] font-semibold rounded-[8px] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5] transition-colors"
        >
          <RotateCcw size={16} />
          Retake Quiz
        </Link>
        <Link
          href="/dashboard/subjects/1/topics/1"
          className="inline-flex items-center justify-center gap-2 bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)]"
        >
          Back to Topic
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
