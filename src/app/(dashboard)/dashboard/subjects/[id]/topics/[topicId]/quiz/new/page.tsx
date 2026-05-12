import mongoose from "mongoose";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, FileText, Sliders, Zap } from "lucide-react";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import {
  createResourceQuiz,
  QuizTopicNotFoundError,
  QuizValidationError,
} from "@/lib/quizzes/create-resource-quiz";
import { Resource } from "@/models/Resource";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

type PageProps = {
  params: Promise<{ id: string; topicId: string }>;
  searchParams?: Promise<{ error?: string }>;
};

type ResourceRow = {
  _id: unknown;
  title: string;
  extractedContent: string;
  createdAt: Date;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

async function createQuiz(subjectId: string, topicId: string, formData: FormData) {
  "use server";

  const userId = await requireUserId();
  const selectedResources = formData.getAll("resourceIds").map(String);
  const questionCount = Number(formData.get("questionCount") ?? 5);

  try {
    const quiz = await createResourceQuiz({
      userId,
      subjectId,
      topicId,
      resourceIds: selectedResources,
      questionCount,
    });

    redirect(`/dashboard/subjects/${subjectId}/topics/${topicId}/quiz/${quiz._id.toString()}`);
  } catch (error) {
    if (error instanceof QuizTopicNotFoundError) {
      notFound();
    }

    if (error instanceof QuizValidationError) {
      redirect(`/dashboard/subjects/${subjectId}/topics/${topicId}/quiz/new?error=${encodeURIComponent(error.message)}`);
    }

    throw error;
  }
}

export default async function QuizSetupPage({ params, searchParams }: PageProps) {
  const { id, topicId } = await params;
  const errorMessage = (await searchParams)?.error;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(topicId)) {
    notFound();
  }

  const userId = await requireUserId();
  await connectDB();

  const [subject, topic, resources] = await Promise.all([
    Subject.findOne({ _id: id, userId }).lean(),
    Topic.findOne({ _id: topicId, subjectId: id, userId }).lean(),
    Resource.find({ topicId, userId, status: "ready", type: "text" })
      .sort({ createdAt: -1 })
      .lean<ResourceRow[]>(),
  ]);

  if (!subject || !topic) {
    notFound();
  }

  return (
    <div className="max-w-[700px] mx-auto p-6 md:p-12">
      <Link
        href={`/dashboard/subjects/${id}/topics/${topicId}`}
        className="inline-flex items-center gap-2 text-[14px] font-medium text-[#898989] hover:text-[#242424] mb-8 group transition-colors"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        {topic.name}
      </Link>

      <div className="mb-[48px] pb-[48px] border-b-[1px] border-[#222a3514]">
        <h1 className="heading-lg text-[#242424] tracking-tight">Quiz Setup</h1>
        <p className="mt-4 text-[16px] font-light text-[#898989] leading-[1.5]">
          Generate an AI-authored, source-grounded practice quiz from ready text resources in {subject.name}.
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-8 text-center">
          <FileText size={28} className="text-[#898989] mx-auto mb-4" />
          <h2 className="heading-sm text-[#242424] mb-3">No ready resources yet</h2>
          <p className="text-[14px] font-light text-[#898989] leading-[1.5] max-w-[420px] mx-auto mb-8">
            Add typed notes to this topic first, then CoachClaw can turn them into a quiz.
          </p>
          <Link
            href={`/dashboard/subjects/${id}/topics/${topicId}/resources/upload`}
            className="inline-flex items-center justify-center bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)]"
          >
            Add Text Notes
          </Link>
        </div>
      ) : (
        <form action={createQuiz.bind(null, id, topicId)}>
          <div className="space-y-10">
            {errorMessage ? (
              <div className="rounded-[8px] border-[1px] border-[#ef444433] bg-[#fef2f2] px-4 py-3 text-[14px] font-medium text-[#b91c1c]">
                {errorMessage}
              </div>
            ) : null}

            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText size={18} className="text-[#898989]" />
                <h2 className="text-[16px] font-semibold text-[#242424]">Source Materials</h2>
              </div>
              <div className="space-y-3">
                {resources.map((resource) => {
                  const resourceId = String(resource._id);
                  const wordCount = resource.extractedContent.trim().split(/\s+/).filter(Boolean).length;

                  return (
                    <label
                      key={resourceId}
                      className="w-full text-left p-4 rounded-[8px] border-[1px] transition-all flex items-center gap-4 border-[#222a3514] bg-white shadow-[var(--shadow-level-5)] hover:bg-[#fafafa] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        name="resourceIds"
                        value={resourceId}
                        defaultChecked
                        className="size-5 accent-[#242424] shrink-0"
                      />
                      <span>
                        <span className="block text-[14px] font-medium text-[#242424]">{resource.title}</span>
                        <span className="block text-[12px] text-[#898989]">
                          Text resource &#8226; {wordCount} words &#8226; {formatDate(resource.createdAt)}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Sliders size={18} className="text-[#898989]" />
                <h2 className="text-[16px] font-semibold text-[#242424]">Number of Questions</h2>
              </div>
              <div className="bg-white rounded-[12px] border-[1px] border-[#222a3514] shadow-[var(--shadow-level-2)] p-6">
                <select
                  name="questionCount"
                  defaultValue="5"
                  className="w-full bg-white shadow-[var(--shadow-level-1)] border-[1px] border-[#222a3514] rounded-[8px] px-4 py-3 text-[16px] font-light text-[#242424] focus:outline-none focus:ring-1 focus:ring-[#3b82f6] transition-shadow"
                >
                  <option value="3">3 questions</option>
                  <option value="5">5 questions</option>
                  <option value="10">10 questions</option>
                </select>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4">
                <Zap size={18} className="text-[#898989]" />
                <h2 className="text-[16px] font-semibold text-[#242424]">Difficulty</h2>
              </div>
              <div className="bg-[#242424] text-white p-4 rounded-[8px] text-[14px] font-semibold text-center shadow-[var(--shadow-level-2)]">
                Resource-based practice
              </div>
              <p className="mt-3 text-[12px] text-[#898989] font-light">
                CoachClaw uses your mastery level to mix multiple choice, fill-in, short-answer, and focused true/false questions.
              </p>
            </section>
          </div>

          <div className="flex justify-end gap-4 pt-10 mt-10 border-t-[1px] border-[#222a3514]">
            <Link
              href={`/dashboard/subjects/${id}/topics/${topicId}`}
              className="bg-transparent text-[#242424] px-5 py-[12px] text-[14px] font-semibold rounded-[8px] hover:bg-[#f5f5f5] transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="bg-[#242424] text-white px-6 py-[12px] text-[14px] font-semibold rounded-[8px] hover:opacity-80 transition-opacity shadow-[var(--shadow-level-2)] relative overflow-hidden flex items-center gap-2"
            >
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              Start Quiz
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
