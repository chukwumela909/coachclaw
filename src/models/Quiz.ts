import mongoose, { Model, Schema } from "mongoose";

export type QuizQuestionType = "multiple_choice" | "true_false" | "fill_in_blank" | "short_answer";
export type QuizQuestionDifficulty = "beginner" | "intermediate" | "advanced";

export interface IQuizQuestion {
  type: QuizQuestionType;
  prompt: string;
  options?: string[];
  correctOptionIndex?: number | null;
  correctAnswer?: string | null;
  acceptedAnswers?: string[];
  rubric?: string | null;
  sampleAnswer?: string | null;
  difficulty?: QuizQuestionDifficulty;
  explanation: string;
  sourceResourceId?: mongoose.Types.ObjectId;
}

export interface IQuiz {
  userId: string;
  subjectId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  resourceIds: mongoose.Types.ObjectId[];
  questionCount: number;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>(
  {
    type: {
      type: String,
      enum: ["multiple_choice", "true_false", "fill_in_blank", "short_answer"],
      required: true,
    },
    prompt: { type: String, required: true },
    options: [{ type: String }],
    correctOptionIndex: { type: Number, default: null },
    correctAnswer: { type: String, default: null },
    acceptedAnswers: [{ type: String }],
    rubric: { type: String, default: null },
    sampleAnswer: { type: String, default: null },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    explanation: { type: String, required: true },
    sourceResourceId: { type: Schema.Types.ObjectId, ref: "Resource" },
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource", required: true }],
    questionCount: { type: Number, required: true },
    questions: { type: [QuizQuestionSchema], required: true },
  },
  { timestamps: true }
);

QuizSchema.index({ userId: 1, topicId: 1, createdAt: -1 });

export const Quiz: Model<IQuiz> =
  (mongoose.models.Quiz as Model<IQuiz>) || mongoose.model<IQuiz>("Quiz", QuizSchema);
