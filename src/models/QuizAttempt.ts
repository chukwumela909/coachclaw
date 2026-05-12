import mongoose, { Model, Schema } from "mongoose";

export type QuizAnswerValue = number | string | null;

export interface IQuizQuestionResult {
  questionType?: string;
  prompt: string;
  chosenOptionIndex: number | null;
  chosenAnswer: string;
  correctOptionIndex?: number | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  sourceResourceId?: mongoose.Types.ObjectId;
}

export interface IQuizAttempt {
  userId: string;
  subjectId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  answers: QuizAnswerValue[];
  perQuestionResults: IQuizQuestionResult[];
  score: number;
  totalQuestions: number;
  percent: number;
  previousMastery: number;
  masteryScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionResultSchema = new Schema<IQuizQuestionResult>(
  {
    questionType: { type: String },
    prompt: { type: String, required: true },
    chosenOptionIndex: { type: Number, default: null },
    chosenAnswer: { type: String, required: true },
    correctOptionIndex: { type: Number, default: null },
    correctAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    explanation: { type: String, required: true },
    sourceResourceId: { type: Schema.Types.ObjectId, ref: "Resource" },
  },
  { _id: false }
);

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: String, required: true, index: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    answers: [{ type: Schema.Types.Mixed }],
    perQuestionResults: { type: [QuizQuestionResultSchema], required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    percent: { type: Number, required: true },
    previousMastery: { type: Number, required: true, default: 0 },
    masteryScore: { type: Number, required: true },
  },
  { timestamps: true }
);

QuizAttemptSchema.index({ userId: 1, quizId: 1, createdAt: -1 });
QuizAttemptSchema.index({ userId: 1, topicId: 1, createdAt: -1 });

export const QuizAttempt: Model<IQuizAttempt> =
  (mongoose.models.QuizAttempt as Model<IQuizAttempt>) ||
  mongoose.model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);
