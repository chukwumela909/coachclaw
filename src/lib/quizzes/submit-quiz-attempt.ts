import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import { Progress } from "@/models/Progress";
import { type IQuizQuestion } from "@/models/Quiz";
import { Quiz } from "@/models/Quiz";
import { QuizAttempt, type IQuizQuestionResult, type QuizAnswerValue } from "@/models/QuizAttempt";

export class QuizAttemptNotFoundError extends Error {
  constructor() {
    super("Quiz not found");
  }
}

export class QuizAttemptValidationError extends Error {}

export class QuizAttemptGradingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizAttemptGradingError";
  }
}

type SubmitQuizAttemptInput = {
  userId: string;
  quizId: string;
  answers: unknown[];
};

type OpenAIContent = {
  type?: string;
  text?: string;
};

type OpenAIOutputItem = {
  type?: string;
  content?: OpenAIContent[];
};

type OpenAIResponse = {
  output_text?: string;
  output?: OpenAIOutputItem[];
  error?: {
    message?: string;
  };
};

type ShortAnswerGrade = {
  questionIndex: number;
  isCorrect: boolean;
  feedback: string;
};

const shortAnswerGradeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["grades"],
  properties: {
    grades: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["questionIndex", "isCorrect", "feedback"],
        properties: {
          questionIndex: { type: "number" },
          isCorrect: { type: "boolean" },
          feedback: { type: "string" },
        },
      },
    },
  },
};

function extractResponseText(response: OpenAIResponse) {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  for (const item of response.output ?? []) {
    if (item.type === "message") {
      const text = item.content?.find((content) => typeof content.text === "string")?.text;
      if (text) return text;
    }
  }

  return "";
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function cleanTextAnswer(answer: unknown) {
  return typeof answer === "string" ? answer.replace(/\s+/g, " ").trim() : "";
}

function cleanObjectiveAnswer(question: IQuizQuestion, answer: unknown) {
  const options = question.options ?? [];
  const index = typeof answer === "number" ? answer : typeof answer === "string" ? Number(answer) : -1;

  return Number.isInteger(index) && index >= 0 && index < options.length ? index : null;
}

function getCorrectObjectiveAnswer(question: IQuizQuestion) {
  const correctOptionIndex = question.correctOptionIndex ?? -1;
  return question.options?.[correctOptionIndex] ?? question.correctAnswer ?? "Unknown";
}

function gradeFillInBlank(question: IQuizQuestion, answer: string) {
  const acceptedAnswers = [...(question.acceptedAnswers ?? []), question.correctAnswer ?? ""]
    .map((acceptedAnswer) => normalizeText(acceptedAnswer))
    .filter(Boolean);

  return acceptedAnswers.includes(normalizeText(answer));
}

function parseGrades(payload: OpenAIResponse) {
  const text = extractResponseText(payload);

  if (!text) {
    throw new QuizAttemptGradingError("AI returned an empty grading response");
  }

  try {
    return JSON.parse(text) as { grades?: ShortAnswerGrade[] };
  } catch {
    throw new QuizAttemptGradingError("AI returned malformed grading JSON");
  }
}

async function gradeShortAnswers(
  questions: IQuizQuestion[],
  cleanAnswers: QuizAnswerValue[]
): Promise<Map<number, ShortAnswerGrade>> {
  const items = questions
    .map((question, index) => ({ question, index, answer: String(cleanAnswers[index] ?? "") }))
    .filter((item) => item.question.type === "short_answer");

  if (items.length === 0) {
    return new Map();
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_QUIZ_MODEL || process.env.OPENAI_TOPIC_MODEL || "gpt-4.1";

  if (!apiKey) {
    throw new QuizAttemptGradingError("AI short-answer grading is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You are CoachClaw, a strict but fair quiz grader.",
                "Return only JSON that matches the schema.",
                "Grade each learner answer against the rubric and sample answer.",
                "Accept equivalent wording, but mark incorrect if the core idea is missing or contradicted.",
                "Feedback should be concise and explain the grading decision.",
              ].join(" "),
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                items: items.map((item) => ({
                  questionIndex: item.index,
                  prompt: item.question.prompt,
                  rubric: item.question.rubric,
                  sampleAnswer: item.question.sampleAnswer ?? item.question.correctAnswer,
                  learnerAnswer: item.answer,
                })),
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "short_answer_grades",
          strict: true,
          schema: shortAnswerGradeSchema,
        },
      },
    }),
  });

  const payload = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new QuizAttemptGradingError(payload.error?.message || "AI short-answer grading failed");
  }

  const parsed = parseGrades(payload);
  const grades = new Map<number, ShortAnswerGrade>();
  const expectedIndexes = new Set(items.map((item) => item.index));

  for (const grade of parsed.grades ?? []) {
    if (!expectedIndexes.has(grade.questionIndex) || typeof grade.isCorrect !== "boolean") continue;
    const feedback = cleanTextAnswer(grade.feedback);
    grades.set(grade.questionIndex, {
      questionIndex: grade.questionIndex,
      isCorrect: grade.isCorrect,
      feedback: feedback || "Graded against the stored rubric.",
    });
  }

  if (grades.size !== items.length) {
    throw new QuizAttemptGradingError("AI did not grade every short-answer question");
  }

  return grades;
}

function buildCleanAnswers(questions: IQuizQuestion[], answers: unknown[]): QuizAnswerValue[] {
  return questions.map((question, index) => {
    const answer = answers[index];

    if (question.type === "multiple_choice" || question.type === "true_false") {
      return cleanObjectiveAnswer(question, answer);
    }

    return cleanTextAnswer(answer);
  });
}

function buildQuestionResult(
  question: IQuizQuestion,
  cleanAnswer: QuizAnswerValue,
  shortAnswerGrade: ShortAnswerGrade | undefined
): IQuizQuestionResult {
  if (question.type === "multiple_choice" || question.type === "true_false") {
    const chosenOptionIndex = typeof cleanAnswer === "number" ? cleanAnswer : null;
    const correctOptionIndex = question.correctOptionIndex ?? null;
    const chosenAnswer = chosenOptionIndex === null ? "No answer" : question.options?.[chosenOptionIndex] ?? "No answer";
    const correctAnswer = getCorrectObjectiveAnswer(question);

    return {
      questionType: question.type,
      prompt: question.prompt,
      chosenOptionIndex,
      chosenAnswer,
      correctOptionIndex,
      correctAnswer,
      isCorrect: chosenOptionIndex !== null && chosenOptionIndex === correctOptionIndex,
      explanation: question.explanation,
      sourceResourceId: question.sourceResourceId,
    };
  }

  if (question.type === "fill_in_blank") {
    const chosenAnswer = typeof cleanAnswer === "string" && cleanAnswer ? cleanAnswer : "No answer";
    const correctAnswer = question.correctAnswer ?? question.acceptedAnswers?.[0] ?? "Unknown";

    return {
      questionType: question.type,
      prompt: question.prompt,
      chosenOptionIndex: null,
      chosenAnswer,
      correctOptionIndex: null,
      correctAnswer,
      isCorrect: typeof cleanAnswer === "string" && cleanAnswer ? gradeFillInBlank(question, cleanAnswer) : false,
      explanation: question.explanation,
      sourceResourceId: question.sourceResourceId,
    };
  }

  const chosenAnswer = typeof cleanAnswer === "string" && cleanAnswer ? cleanAnswer : "No answer";
  const correctAnswer = question.sampleAnswer ?? question.correctAnswer ?? "See explanation.";

  return {
    questionType: question.type,
    prompt: question.prompt,
    chosenOptionIndex: null,
    chosenAnswer,
    correctOptionIndex: null,
    correctAnswer,
    isCorrect: shortAnswerGrade?.isCorrect ?? false,
    explanation: shortAnswerGrade?.feedback || question.explanation,
    sourceResourceId: question.sourceResourceId,
  };
}

export async function submitQuizAttempt({ userId, quizId, answers }: SubmitQuizAttemptInput) {
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    throw new QuizAttemptNotFoundError();
  }

  if (!Array.isArray(answers)) {
    throw new QuizAttemptValidationError("Answers must be an array");
  }

  await connectDB();

  const quiz = await Quiz.findOne({ _id: quizId, userId });

  if (!quiz || quiz.questions.length === 0) {
    throw new QuizAttemptNotFoundError();
  }

  const cleanAnswers = buildCleanAnswers(quiz.questions, answers);
  const shortAnswerGrades = await gradeShortAnswers(quiz.questions, cleanAnswers);
  const perQuestionResults = quiz.questions.map((question, index) =>
    buildQuestionResult(question, cleanAnswers[index], shortAnswerGrades.get(index))
  );

  const score = perQuestionResults.filter((result) => result.isCorrect).length;
  const totalQuestions = perQuestionResults.length;
  const percent = Math.round((score / totalQuestions) * 100);
  const existingProgress = await Progress.findOne({
    userId,
    subjectId: quiz.subjectId,
    topicId: quiz.topicId,
  });
  const previousMastery = existingProgress?.masteryScore ?? 0;
  const masteryScore = existingProgress ? Math.round(previousMastery * 0.7 + percent * 0.3) : percent;

  const attempt = await QuizAttempt.create({
    userId,
    subjectId: quiz.subjectId,
    topicId: quiz.topicId,
    quizId: quiz._id,
    answers: cleanAnswers,
    perQuestionResults,
    score,
    totalQuestions,
    percent,
    previousMastery,
    masteryScore,
  });

  await Progress.findOneAndUpdate(
    {
      userId,
      subjectId: quiz.subjectId,
      topicId: quiz.topicId,
    },
    {
      $set: {
        masteryScore,
        lastQuizAttemptId: attempt._id,
        lastStudiedAt: attempt.createdAt,
      },
      $inc: { quizAttemptCount: 1 },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { attempt };
}

export const __testing = {
  buildCleanAnswers,
  buildQuestionResult,
  gradeFillInBlank,
  gradeShortAnswers,
};
