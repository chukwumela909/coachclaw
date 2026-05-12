import mongoose from "mongoose";
import { notFound } from "next/navigation";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import { Quiz } from "@/models/Quiz";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

import { QuizRunner } from "./QuizRunner";

type PageProps = {
  params: Promise<{ id: string; topicId: string; quizId: string }>;
};

type QuizRow = {
  questions: {
    type: "multiple_choice" | "true_false" | "fill_in_blank" | "short_answer";
    prompt: string;
    options?: string[];
  }[];
};

export default async function QuizSessionPage({ params }: PageProps) {
  const { id, topicId, quizId } = await params;

  if (
    !mongoose.Types.ObjectId.isValid(id) ||
    !mongoose.Types.ObjectId.isValid(topicId) ||
    !mongoose.Types.ObjectId.isValid(quizId)
  ) {
    notFound();
  }

  const userId = await requireUserId();
  await connectDB();

  const [subject, topic, quiz] = await Promise.all([
    Subject.exists({ _id: id, userId }),
    Topic.exists({ _id: topicId, subjectId: id, userId }),
    Quiz.findOne({ _id: quizId, topicId, subjectId: id, userId }).lean<QuizRow>(),
  ]);

  if (!subject || !topic || !quiz || quiz.questions.length === 0) {
    notFound();
  }

  const backHref = `/dashboard/subjects/${id}/topics/${topicId}`;
  const attemptsHref = `/dashboard/subjects/${id}/topics/${topicId}/quiz/${quizId}/attempts`;

  return (
    <QuizRunner
      backHref={backHref}
      attemptsHref={attemptsHref}
      quizId={quizId}
      questions={quiz.questions.map((question) => ({
        type: question.type,
        prompt: question.prompt,
        options: question.options,
      }))}
    />
  );
}
