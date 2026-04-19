import Link from 'next/link';
import { ChevronLeft, BookOpen, Lightbulb, CheckSquare, ArrowRight } from 'lucide-react';

export default function StudyGuidePage() {
  return (
    <div className="max-w-[800px] mx-auto p-6 md:p-12">
      <Link
        href="/dashboard/subjects/1/topics/1"
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Limits and Continuity
      </Link>

      <div className="mb-[48px] pb-[48px] border-b-[1px] border-[#222a3514]">
        <div className="flex items-center gap-4 mb-4">
          <BookOpen size={24} className="text-[#242424]" />
          <h1 className="heading-lg text-[#242424] tracking-tight">Study Guide</h1>
        </div>
        <p className="text-[16px] font-light text-[#898989] leading-[1.5]">
          AI-generated learning plan based on your uploaded resources and diagnostic results.
        </p>
      </div>

      {/* Generative UI Cards */}
      <div className="space-y-8">
        {/* Explanation Card */}
        <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-8">
          <h2 className="heading-sm text-[#242424] mb-4">What is a Limit?</h2>
          <p className="text-[16px] font-light text-[#898989] leading-[1.7] mb-4">
            A limit describes the value a function approaches as the input approaches a particular point. It is the foundational concept of calculus, underpinning both derivatives and integrals.
          </p>
          <div className="bg-[#fafafa] p-5 rounded-[8px] border-[1px] border-[#222a3514] font-mono text-[14px] text-[#242424] leading-[1.8]">
            lim (x &rarr; c) f(x) = L
          </div>
          <p className="mt-4 text-[14px] font-light text-[#898989] leading-[1.5]">
            This means: as x gets arbitrarily close to c, f(x) gets arbitrarily close to L.
          </p>
        </div>

        {/* Key Concept Card */}
        <div className="bg-[#fafafa] rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-8">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb size={20} className="text-[#242424]" />
            <h3 className="heading-xs text-[#242424]">Key Insight</h3>
          </div>
          <p className="text-[16px] font-light text-[#242424] leading-[1.7]">
            A function does <span className="font-semibold">not</span> need to be defined at a point for the limit to exist there. The limit only cares about the <span className="font-semibold">behavior near</span> the point, not at the point itself.
          </p>
        </div>

        {/* Comparison Table Card */}
        <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-8">
          <h3 className="heading-sm text-[#242424] mb-6">Types of Discontinuity</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b-[1px] border-[#222a3514]">
                  <th className="text-left py-3 pr-6 font-semibold text-[#242424] text-[12px] uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 pr-6 font-semibold text-[#242424] text-[12px] uppercase tracking-wider">Description</th>
                  <th className="text-left py-3 font-semibold text-[#242424] text-[12px] uppercase tracking-wider">Limit Exists?</th>
                </tr>
              </thead>
              <tbody className="text-[#898989] font-light">
                <tr className="border-b-[1px] border-[#222a3514]">
                  <td className="py-3 pr-6 font-medium text-[#242424]">Removable</td>
                  <td className="py-3 pr-6">Hole in the graph</td>
                  <td className="py-3 font-medium text-[#10b981]">Yes</td>
                </tr>
                <tr className="border-b-[1px] border-[#222a3514]">
                  <td className="py-3 pr-6 font-medium text-[#242424]">Jump</td>
                  <td className="py-3 pr-6">Left and right limits differ</td>
                  <td className="py-3 font-medium text-[#ef4444]">No</td>
                </tr>
                <tr>
                  <td className="py-3 pr-6 font-medium text-[#242424]">Infinite</td>
                  <td className="py-3 pr-6">Function approaches &plusmn;&infin;</td>
                  <td className="py-3 font-medium text-[#ef4444]">No</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Inline Quiz Card */}
        <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-8">
          <div className="flex items-center gap-3 mb-4">
            <CheckSquare size={20} className="text-[#242424]" />
            <h3 className="heading-xs text-[#242424]">Quick Check</h3>
          </div>
          <p className="text-[16px] font-light text-[#242424] leading-[1.5] mb-6">
            What is the limit of (x&sup2; - 4)/(x - 2) as x approaches 2?
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-6">
            {['0', '2', '4', 'Does not exist'].map((opt) => (
              <button
                key={opt}
                className="p-3 rounded-[8px] border-[1px] border-[#222a3514] bg-white shadow-[var(--shadow-level-5)] hover:bg-[#f5f5f5] transition-colors text-[14px] font-medium text-[#242424] text-left"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-[#242424] rounded-[12px] shadow-[var(--shadow-level-2)] p-8 text-white">
          <h3 className="heading-sm text-white mb-4">Summary</h3>
          <ul className="space-y-3 text-[16px] font-light leading-[1.6] opacity-80">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
              Limits describe approaching behavior, not evaluation at a point
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
              Continuity requires the limit to equal the function value
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
              Three types of discontinuity: removable, jump, and infinite
            </li>
          </ul>
          <div className="mt-8">
            <Link
              href="/dashboard/subjects/1/topics/1/quiz/new"
              className="inline-flex items-center gap-2 bg-white text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
            >
              Test Your Knowledge
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
