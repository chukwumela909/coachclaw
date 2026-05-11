import mongoose, { Model, Schema } from "mongoose";

export type ResourceType = "text";
export type ResourceStatus = "ready";

export interface IResource {
  userId: string;
  subjectId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  type: ResourceType;
  title: string;
  extractedContent: string;
  status: ResourceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
    type: { type: String, enum: ["text"], required: true, default: "text" },
    title: { type: String, required: true, trim: true },
    extractedContent: { type: String, required: true },
    status: { type: String, enum: ["ready"], required: true, default: "ready" },
  },
  { timestamps: true }
);

ResourceSchema.index({ userId: 1, topicId: 1, createdAt: -1 });
ResourceSchema.index({ userId: 1, subjectId: 1, topicId: 1 });

export const Resource: Model<IResource> =
  (mongoose.models.Resource as Model<IResource>) ||
  mongoose.model<IResource>("Resource", ResourceSchema);
