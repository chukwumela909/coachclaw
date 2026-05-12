import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { generateTopicSuggestions, TopicSuggestionError } from "@/lib/ai/topic-suggestions";
import { connectDB } from "@/lib/db/mongoose";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    let body: { count?: unknown } = {};

    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await connectDB();
    const [subject, topics] = await Promise.all([
      Subject.findOne({ _id: id, userId }).lean(),
      Topic.find({ subjectId: id, userId })
        .sort({ order: 1, createdAt: 1 })
        .select("name description")
        .lean<{ name: string; description?: string }[]>(),
    ]);

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (!subject.name?.trim()) {
      return NextResponse.json({ error: "Course name is required" }, { status: 400 });
    }

    const suggestions = await generateTopicSuggestions({
      subjectName: subject.name,
      subjectDescription: subject.description,
      subjectGoal: subject.goal,
      existingTopics: topics,
      count: typeof body.count === "number" ? body.count : 4,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof TopicSuggestionError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unable to generate topic suggestions" }, { status: 500 });
  }
}
