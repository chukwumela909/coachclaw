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
    const subject = await Subject.findOne({ _id: id, userId }).lean();

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ subject });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load subject" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (!name) {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
    }

    await connectDB();
    const update = {
      $set: {
        name,
        ...(description.length > 0 ? { description } : {}),
        ...(goal.length > 0 ? { goal } : {}),
      },
      ...(description.length === 0 || goal.length === 0
        ? { $unset: { ...(description.length === 0 ? { description: 1 } : {}), ...(goal.length === 0 ? { goal: 1 } : {}) } }
        : {}),
    };

    const subject = await Subject.findOneAndUpdate(
      { _id: id, userId },
      update,
      { new: true }
    );

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ subject });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to update subject" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();
    const goal = typeof body.goal === "string" ? body.goal.trim() : "";

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (!goal) {
      return NextResponse.json({ error: "Course goal is required" }, { status: 400 });
    }

    await connectDB();
    const subject = await Subject.findOneAndUpdate(
      { _id: id, userId },
      { $set: { goal } },
      { new: true }
    );

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ subject });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to update subject" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await connectDB();
    const subject = await Subject.findOneAndDelete({ _id: id, userId });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    await Topic.deleteMany({ subjectId: subject._id, userId });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to delete subject" }, { status: 500 });
  }
}
