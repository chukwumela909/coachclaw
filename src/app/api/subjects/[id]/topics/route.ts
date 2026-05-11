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
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (!name) {
      return NextResponse.json({ error: "Topic name is required" }, { status: 400 });
    }

    await connectDB();
    const subject = await Subject.exists({ _id: id, userId });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const topicCount = await Topic.countDocuments({ subjectId: id, userId });
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
