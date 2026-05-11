import mongoose, { Model, Schema } from "mongoose";

export interface ISubject {
  userId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

SubjectSchema.index({ userId: 1, createdAt: -1 });

export const Subject: Model<ISubject> =
  (mongoose.models.Subject as Model<ISubject>) ||
  mongoose.model<ISubject>("Subject", SubjectSchema);
