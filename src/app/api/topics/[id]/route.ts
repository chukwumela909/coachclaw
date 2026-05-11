import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
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
    const topic = await Topic.findOne({ _id: id, userId }).lean();

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ topic });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load topic" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    if (!name) {
      return NextResponse.json({ error: "Topic name is required" }, { status: 400 });
    }

    await connectDB();
    const update =
      description.length > 0
        ? { $set: { name, description } }
        : { $set: { name }, $unset: { description: 1 } };

    const topic = await Topic.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true }
    );

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ topic });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to update topic" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    await connectDB();
    const topic = await Topic.findOneAndDelete({ _id: id, userId });

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to delete topic" }, { status: 500 });
  }
}
