import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import { Resource } from "@/models/Resource";
import { Topic } from "@/models/Topic";

export class ResourceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResourceValidationError";
  }
}

export class TopicNotFoundError extends Error {
  constructor() {
    super("Topic not found");
    this.name = "TopicNotFoundError";
  }
}

type CreateTextResourceInput = {
  userId: string;
  subjectId?: string;
  topicId: string;
  title: string;
  content: string;
};

export async function createTextResource({
  userId,
  subjectId,
  topicId,
  title,
  content,
}: CreateTextResourceInput) {
  const cleanTitle = title.trim();
  const cleanContent = content.trim();

  if (!cleanTitle) {
    throw new ResourceValidationError("Resource title is required");
  }

  if (!cleanContent) {
    throw new ResourceValidationError("Resource content is required");
  }

  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new TopicNotFoundError();
  }

  if (subjectId && !mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new TopicNotFoundError();
  }

  await connectDB();
  const topicQuery = subjectId
    ? { _id: topicId, subjectId, userId }
    : { _id: topicId, userId };
  const topic = await Topic.findOne(topicQuery).select("subjectId").lean();

  if (!topic) {
    throw new TopicNotFoundError();
  }

  return Resource.create({
    userId,
    subjectId: topic.subjectId,
    topicId,
    type: "text",
    title: cleanTitle,
    extractedContent: cleanContent,
    status: "ready",
  });
}
