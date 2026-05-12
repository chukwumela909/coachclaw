import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await connectDB();
    const subject = await Subject.exists({ _id: id, userId });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const topics = await Topic.find({ subjectId: id, userId }).sort({ order: 1, createdAt: 1 }).lean();

    return NextResponse.json({ topics });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load topics" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const bodyObject = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
    const topicDrafts = Array.isArray(bodyObject.topics) ? bodyObject.topics : null;
    const name = typeof bodyObject.name === "string" ? bodyObject.name.trim() : "";
    const description =
      typeof bodyObject.description === "string"
        ? bodyObject.description.trim()
        : "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (!topicDrafts && !name) {
      return NextResponse.json({ error: "Topic name is required" }, { status: 400 });
    }

    await connectDB();
    const subject = await Subject.exists({ _id: id, userId });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const topicCount = await Topic.countDocuments({ subjectId: id, userId });

    if (topicDrafts) {
      const topics = topicDrafts
        .slice(0, 4)
        .map((topic) => {
          const topicObject = typeof topic === "object" && topic !== null ? (topic as Record<string, unknown>) : {};
          return {
            name: typeof topicObject.name === "string" ? topicObject.name.trim() : "",
            description: typeof topicObject.description === "string" ? topicObject.description.trim() : "",
          };
        })
        .filter((topic) => topic.name.length > 0);

      if (topics.length === 0) {
        return NextResponse.json({ error: "At least one topic is required" }, { status: 400 });
      }

      const createdTopics = await Topic.insertMany(
        topics.map((topic, index) => ({
          userId,
          subjectId: id,
          name: topic.name,
          description: topic.description || undefined,
          order: topicCount + index,
        }))
      );

      return NextResponse.json({ topics: createdTopics }, { status: 201 });
    }

    const topic = await Topic.create({
      userId,
      subjectId: id,
      name,
      description: description || undefined,
      order: topicCount,
    });

    return NextResponse.json({ topic }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to create topic" }, { status: 500 });
  }
}
