import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import {
  createTextResource,
  ResourceValidationError,
  TopicNotFoundError,
} from "@/lib/resources/create-text-resource";
import { Resource } from "@/models/Resource";
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
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    await connectDB();
    const topic = await Topic.exists({ _id: id, userId });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const resources = await Resource.find({ topicId: id, userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ resources });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load resources" }, { status: 500 });
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

    const resource = await createTextResource({
      userId,
      topicId: id,
      title: typeof body === "object" && body && "title" in body && typeof body.title === "string" ? body.title : "",
      content: typeof body === "object" && body && "content" in body && typeof body.content === "string" ? body.content : "",
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (error instanceof TopicNotFoundError) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    if (error instanceof ResourceValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to create resource" }, { status: 500 });
  }
}
