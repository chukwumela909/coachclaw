import mongoose, { Model, Schema } from "mongoose";

export interface ITopic {
  userId: string;
  subjectId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

TopicSchema.index({ userId: 1, subjectId: 1, order: 1 });

export const Topic: Model<ITopic> =
  (mongoose.models.Topic as Model<ITopic>) ||
  mongoose.model<ITopic>("Topic", TopicSchema);
