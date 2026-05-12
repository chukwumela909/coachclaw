import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import {
  QuizAttemptGradingError,
  QuizAttemptNotFoundError,
  QuizAttemptValidationError,
  submitQuizAttempt,
} from "@/lib/quizzes/submit-quiz-attempt";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

type AttemptRequestBody = {
  answers?: unknown;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    let body: AttemptRequestBody;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (!Array.isArray(body.answers)) {
      return NextResponse.json({ error: "Answers must be an array" }, { status: 400 });
    }

    const { attempt } = await submitQuizAttempt({ userId, quizId: id, answers: body.answers });

    return NextResponse.json({ attemptId: String(attempt._id) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof QuizAttemptNotFoundError) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (error instanceof QuizAttemptValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof QuizAttemptGradingError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    return NextResponse.json({ error: "Unable to submit quiz attempt" }, { status: 500 });
  }
}
