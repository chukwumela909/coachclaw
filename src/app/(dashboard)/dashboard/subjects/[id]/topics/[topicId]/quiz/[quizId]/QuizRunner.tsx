"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Mic, X } from "lucide-react";

type QuizQuestion = {
  type: "multiple_choice" | "true_false" | "fill_in_blank" | "short_answer";
  prompt: string;
  options?: string[];
};

type QuizAnswer = number | string;

type QuizRunnerProps = {
  backHref: string;
  attemptsHref: string;
  quizId: string;
  questions: QuizQuestion[];
};

function getQuestionTypeLabel(type: QuizQuestion["type"]) {
  switch (type) {
    case "multiple_choice":
      return "Multiple Choice";
    case "true_false":
      return "True / False";
    case "fill_in_blank":
      return "Fill In The Blank";
    case "short_answer":
      return "Short Answer";
  }
}

function isObjectiveQuestion(type: QuizQuestion["type"]) {
  return type === "multiple_choice" || type === "true_false";
}

export function QuizRunner({ backHref, attemptsHref, quizId, questions }: QuizRunnerProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = questions.length;
  const question = questions[current];
  const isObjective = isObjectiveQuestion(question.type);
  const canContinue = isObjective ? selected !== null : textAnswer.trim().length > 0;

  async function handleNext() {
    if (!canContinue || isSubmitting) return;

    const currentAnswer: QuizAnswer = isObjective ? Number(selected) : textAnswer.trim();
    const next = [...answers, currentAnswer];

    setAnswers(next);
    setSelected(null);
    setTextAnswer("");
    setError(null);

    if (current < total - 1) {
      setCurrent(current + 1);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: next }),
      });
      const data = (await response.json()) as { attemptId?: string; error?: string };

      if (!response.ok || !data.attemptId) {
        throw new Error(data.error || "Unable to submit quiz");
      }

      router.push(`${attemptsHref}/${data.attemptId}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit quiz");
      setAnswers(answers);
      setSelected(isObjective ? Number(currentAnswer) : null);
      setTextAnswer(isObjective ? "" : String(currentAnswer));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-[700px] mx-auto p-6 md:p-12">
      <div className="flex items-center justify-between mb-8">
        <Link
          href={backHref}
          className="p-2 text-[#898989] hover:text-[#242424] hover:bg-[#f5f5f5] rounded-[8px] transition-colors"
          aria-label="Exit quiz"
        >
          <X size={20} />
        </Link>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[14px] font-medium text-[#898989]">
            <Clock size={16} />
            <span>Practice</span>
          </div>
          <button className="p-2 text-[#898989] hover:text-[#242424] hover:bg-[#f5f5f5] rounded-[8px] transition-colors" type="button">
            <Mic size={20} />
          </button>
        </div>
      </div>

      <div className="mb-10">
        <div className="flex justify-between text-[12px] font-medium text-[#898989] mb-2">
          <span>
            {current + 1} of {total}
          </span>
          <span>{Math.round((current / total) * 100)}%</span>
        </div>
        <div className="h-[4px] bg-[#f5f5f5] rounded-[9999px] overflow-hidden">
          <div
            className="h-full bg-[#242424] rounded-[9999px] transition-all duration-500"
            style={{ width: `${(current / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-10">
        <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-4">
          {getQuestionTypeLabel(question.type)}
        </div>
        <h2 className="heading-sm text-[#242424] leading-[1.4]">{question.prompt}</h2>
      </div>

      <div className="mb-10">
        {isObjective ? (
          <div className="space-y-3">
            {(question.options ?? []).map((option, index) => (
              <button
                key={`${option}-${index}`}
                onClick={() => setSelected(index)}
                disabled={isSubmitting}
                className={`w-full text-left p-5 rounded-[12px] border-[1px] transition-all ${
                  selected === index
                    ? "border-[#242424] bg-[#fafafa] shadow-[var(--shadow-level-2)]"
                    : "border-[#222a3514] bg-white shadow-[var(--shadow-level-5)] hover:shadow-[var(--shadow-level-2)] hover:bg-[#fafafa]"
                }`}
                type="button"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-8 h-8 rounded-full border-[2px] flex items-center justify-center shrink-0 text-[12px] font-bold transition-colors ${
                      selected === index
                        ? "border-[#242424] bg-[#242424] text-white"
                        : "border-[#e5e5e5] text-[#898989]"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={`text-[16px] font-light ${selected === index ? "font-medium text-[#242424]" : "text-[#242424]"}`}>
                    {option}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : question.type === "fill_in_blank" ? (
          <input
            value={textAnswer}
            onChange={(event) => setTextAnswer(event.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-[12px] border-[1px] border-[#222a3514] bg-white px-5 py-4 text-[16px] font-light text-[#242424] shadow-[var(--shadow-level-5)] outline-none transition-shadow focus:shadow-[var(--shadow-level-2)] focus:ring-1 focus:ring-[#242424]"
            placeholder="Type the missing term"
            type="text"
          />
        ) : (
          <textarea
            value={textAnswer}
            onChange={(event) => setTextAnswer(event.target.value)}
            disabled={isSubmitting}
            className="min-h-[160px] w-full resize-y rounded-[12px] border-[1px] border-[#222a3514] bg-white px-5 py-4 text-[16px] font-light leading-[1.5] text-[#242424] shadow-[var(--shadow-level-5)] outline-none transition-shadow focus:shadow-[var(--shadow-level-2)] focus:ring-1 focus:ring-[#242424]"
            placeholder="Write a concise answer"
          />
        )}
      </div>

      {error ? (
        <div className="mb-6 rounded-[8px] border-[1px] border-[#ef444433] bg-[#fef2f2] px-4 py-3 text-[14px] font-medium text-[#b91c1c]">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!canContinue || isSubmitting}
          className={`bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] transition-opacity shadow-[var(--shadow-level-2)] flex items-center gap-2 ${
            !canContinue || isSubmitting ? "opacity-40 cursor-not-allowed" : "hover:opacity-80"
          }`}
          type="button"
        >
          {isSubmitting ? "Saving Results..." : current < total - 1 ? "Next Question" : "Finish Quiz"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
