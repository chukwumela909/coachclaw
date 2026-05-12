import mongoose, { Model, Schema } from "mongoose";

export interface IProgress {
  userId: string;
  subjectId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  masteryScore: number;
  quizAttemptCount: number;
  lastQuizAttemptId?: mongoose.Types.ObjectId;
  lastStudiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
    masteryScore: { type: Number, required: true, default: 0 },
    quizAttemptCount: { type: Number, required: true, default: 0 },
    lastQuizAttemptId: { type: Schema.Types.ObjectId, ref: "QuizAttempt" },
    lastStudiedAt: { type: Date },
  },
  { timestamps: true }
);

ProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
ProgressSchema.index({ userId: 1, subjectId: 1 });

export const Progress: Model<IProgress> =
  (mongoose.models.Progress as Model<IProgress>) ||
  mongoose.model<IProgress>("Progress", ProgressSchema);
