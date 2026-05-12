import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronLeft, FileText, RotateCcw, XCircle } from "lucide-react";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import { QuizAttempt } from "@/models/QuizAttempt";
import { Resource } from "@/models/Resource";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

type PageProps = {
  params: Promise<{ id: string; topicId: string; quizId: string; attemptId: string }>;
};

type AttemptRow = {
  score: number;
  totalQuestions: number;
  percent: number;
  previousMastery: number;
  masteryScore: number;
  createdAt: Date;
  perQuestionResults: {
    questionType?: string;
    prompt: string;
    chosenAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    sourceResourceId?: mongoose.Types.ObjectId;
  }[];
};

function masteryDelta(previousMastery: number, masteryScore: number) {
  const delta = masteryScore - previousMastery;
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export default async function QuizAttemptResultsPage({ params }: PageProps) {
  const { id, topicId, quizId, attemptId } = await params;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(topicId) ||
    !mongoose.Types.ObjectId.isValid(quizId) ||
    !mongoose.Types.ObjectId.isValid(attemptId)
  ) {
    notFound();
  }

  const userId = await requireUserId();
  await connectDB();

  const [subject, topic, attempt] = await Promise.all([
    Subject.exists({ _id: id, userId }),
    Topic.findOne({ _id: topicId, subjectId: id, userId }).select("name").lean(),
    QuizAttempt.findOne({
      _id: attemptId,
      quizId,
      topicId,
      subjectId: id,
      userId,
    }).lean<AttemptRow>(),
  ]);

  if (!subject || !topic || !attempt) {
    notFound();
  }

  const reviewResourceIds = [
    ...new Set(
      attempt.perQuestionResults
        .filter((result) => !result.isCorrect && result.sourceResourceId)
        .map((result) => String(result.sourceResourceId))
    ),
  ];
  const reviewResources =
    reviewResourceIds.length > 0
      ? await Resource.find({ _id: { $in: reviewResourceIds }, topicId, userId })
          .select("title")
          .lean<{ _id: unknown; title: string }[]>()
      : [];
  const topicHref = `/dashboard/subjects/${id}/topics/${topicId}`;
  const masteryChange = masteryDelta(attempt.previousMastery, attempt.masteryScore);

  return (
    <div className="max-w-[850px] mx-auto p-6 md:p-12">
      <Link
        href={topicHref}
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        {topic.name}
      </Link>

      <div className="mb-[48px] border-b-[1px] border-[#222a3514] pb-[48px]">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="w-28 h-28 rounded-full border-[4px] border-[#242424] flex items-center justify-center shadow-[var(--shadow-level-2)] shrink-0">
            <span className="heading-md text-[#242424]">{attempt.percent}%</span>
          </div>
          <div>
            <h1 className="heading-lg text-[#242424] mb-2 tracking-tight">Quiz Results</h1>
            <p className="text-[18px] font-light text-[#898989]">
              You answered <span className="font-semibold text-[#242424]">{attempt.score}</span> out of{" "}
              <span className="font-semibold text-[#242424]">{attempt.totalQuestions}</span> correctly.
            </p>
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              <div className="rounded-[8px] bg-[#fafafa] border-[1px] border-[#222a3514] p-4">
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">Previous Mastery</div>
                <div className="text-[22px] font-bold text-[#242424]">{attempt.previousMastery}%</div>
              </div>
              <div className="rounded-[8px] bg-[#fafafa] border-[1px] border-[#222a3514] p-4">
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">New Mastery</div>
                <div className="text-[22px] font-bold text-[#242424]">{attempt.masteryScore}%</div>
              </div>
              <div className="rounded-[8px] bg-[#fafafa] border-[1px] border-[#222a3514] p-4">
                <div className="text-[12px] font-bold text-[#898989] uppercase tracking-wider mb-1">Change</div>
                <div className="text-[22px] font-bold text-[#242424]">{masteryChange}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {reviewResources.length > 0 ? (
        <section className="mb-12 rounded-[12px] border-[1px] border-[#222a3514] bg-white p-6 shadow-[var(--shadow-level-2)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#fcfcfc] border-[1px] border-[#222a3514] rounded-[8px] flex items-center justify-center text-[#898989] shadow-[var(--shadow-level-1)] shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="heading-sm text-[#242424] mb-2">Review Next</h2>
              <p className="text-[14px] font-light text-[#898989] leading-[1.5] mb-4">
                Before retaking, revisit the resources connected to missed questions.
              </p>
              <div className="flex flex-wrap gap-2">
                {reviewResources.map((resource) => (
                  <span
                    key={String(resource._id)}
                    className="rounded-[6px] bg-[#f5f5f5] px-3 py-2 text-[13px] font-semibold text-[#242424]"
                  >
                    {resource.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-12 rounded-[12px] border-[1px] border-[#222a3514] bg-white p-6 shadow-[var(--shadow-level-2)]">
          <h2 className="heading-sm text-[#242424] mb-2">Review Next</h2>
          <p className="text-[14px] font-light text-[#898989] leading-[1.5]">
            Strong run. Keep the topic warm with a later retake or add more resources for deeper questions.
          </p>
        </section>
      )}

      <div className="space-y-4 mb-12">
        <h2 className="heading-sm text-[#242424] mb-6">Question Breakdown</h2>
        {attempt.perQuestionResults.map((result, index) => {
          const isTextAnswer = result.questionType === "fill_in_blank" || result.questionType === "short_answer";

          return (
            <div
              key={`${result.prompt}-${index}`}
              className={`bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-6 ${
                result.isCorrect ? "border-l-[3px] border-l-[#10b981]" : "border-l-[3px] border-l-[#ef4444]"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                {result.isCorrect ? (
                  <CheckCircle2 size={20} className="text-[#10b981] shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={20} className="text-[#ef4444] shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-medium text-[#242424] leading-[1.4]">{result.prompt}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[14px]">
                    <span className="font-medium text-[#898989]">Your answer:</span>
                    <span className={`font-semibold ${result.isCorrect ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                      {result.chosenAnswer}
                    </span>
                  </div>
                  {isTextAnswer || !result.isCorrect ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px]">
                      <span className="font-medium text-[#898989]">{isTextAnswer ? "Model answer:" : "Correct answer:"}</span>
                      <span className="font-semibold text-[#10b981]">{result.correctAnswer}</span>
                    </div>
                  ) : null}
                  <p className="mt-3 text-[14px] font-light text-[#898989] leading-[1.5] bg-[#fafafa] p-3 rounded-[8px]">
                    {result.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t-[1px] border-[#222a3514]">
        <Link
          href={`/dashboard/subjects/${id}/topics/${topicId}/quiz/new`}
          className="inline-flex items-center justify-center gap-2 bg-white text-[#242424] px-6 py-[12px] text-[14px] font-semibold rounded-[8px] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5] transition-colors"
        >
          <RotateCcw size={16} />
          Retake Quiz
        </Link>
        <Link
          href={topicHref}
          className="inline-flex items-center justify-center gap-2 bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)]"
        >
          Back to Topic
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
