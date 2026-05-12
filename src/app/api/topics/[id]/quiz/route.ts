import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import {
  createResourceQuiz,
  QuizTopicNotFoundError,
  QuizValidationError,
} from "@/lib/quizzes/create-resource-quiz";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

type QuizRequestBody = {
  resourceIds?: unknown;
  questionCount?: unknown;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    let body: QuizRequestBody;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const quiz = await createResourceQuiz({
      userId,
      topicId: id,
      resourceIds: Array.isArray(body.resourceIds)
        ? body.resourceIds.filter((resourceId): resourceId is string => typeof resourceId === "string")
        : [],
      questionCount: typeof body.questionCount === "number" ? body.questionCount : 5,
    });

    return NextResponse.json({ quiz }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof QuizTopicNotFoundError) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    if (error instanceof QuizValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to create quiz" }, { status: 500 });
  }
}
