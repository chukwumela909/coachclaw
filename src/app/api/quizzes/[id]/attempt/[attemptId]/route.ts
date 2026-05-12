import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import { Progress } from "@/models/Progress";
import { QuizAttempt } from "@/models/QuizAttempt";
import { Resource } from "@/models/Resource";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string; attemptId: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id, attemptId } = await params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(attemptId)) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    await connectDB();

    const attempt = await QuizAttempt.findOne({ _id: attemptId, quizId: id, userId }).lean();

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    const [progress, reviewResources] = await Promise.all([
      Progress.findOne({
        userId,
        subjectId: attempt.subjectId,
        topicId: attempt.topicId,
      }).lean(),
      Resource.find({
        _id: {
          $in: attempt.perQuestionResults
            .filter((result) => !result.isCorrect && result.sourceResourceId)
            .map((result) => result.sourceResourceId),
        },
        userId,
      })
        .select("title")
        .lean<{ _id: unknown; title: string }[]>(),
    ]);

    return NextResponse.json({
      attempt: {
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percent: attempt.percent,
        perQuestionResults: attempt.perQuestionResults,
        createdAt: attempt.createdAt,
      },
      progress: {
        previousMastery: attempt.previousMastery,
        masteryScore: progress?.masteryScore ?? attempt.masteryScore,
      },
      reviewResources: reviewResources.map((resource) => ({
        id: String(resource._id),
        title: resource.title,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load quiz attempt" }, { status: 500 });
  }
}
