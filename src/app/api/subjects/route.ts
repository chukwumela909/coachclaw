import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth/require-user";
import { connectDB } from "@/lib/db/mongoose";
import { Subject } from "@/models/Subject";
import { Topic } from "@/models/Topic";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await requireUserId();
    await connectDB();

    const subjects = await Subject.aggregate([
      { $match: { userId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: Topic.collection.name,
          localField: "_id",
          foreignField: "subjectId",
          as: "topics",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          createdAt: 1,
          updatedAt: 1,
          topicCount: { $size: "$topics" },
        },
      },
    ]);

    return NextResponse.json({ subjects });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to load subjects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "Subject name is required" }, { status: 400 });
    }

    await connectDB();
    const subject = await Subject.create({
      userId,
      name,
      description: description || undefined,
    });

    return NextResponse.json({ subject }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Unable to create subject" }, { status: 500 });
  }
}
