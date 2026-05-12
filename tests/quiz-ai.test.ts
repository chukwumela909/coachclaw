import mongoose from "mongoose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { __testing as quizGenerationTesting, QuizValidationError } from "../src/lib/quizzes/create-resource-quiz";
import type { GeneratedQuestion } from "../src/lib/quizzes/create-resource-quiz";
import { __testing as quizAttemptTesting, QuizAttemptGradingError } from "../src/lib/quizzes/submit-quiz-attempt";
import type { IQuizQuestion } from "../src/models/Quiz";

const resourceId = new mongoose.Types.ObjectId();
const originalApiKey = process.env.OPENAI_API_KEY;
const originalFetch = global.fetch;
const resources = [
  {
    _id: resourceId,
    title: "Machine learning notes",
    extractedContent:
      "Machine learning systems learn patterns from examples. Supervised learning uses labeled examples. Overfitting happens when a model memorizes training data and performs poorly on new data.",
  },
];

function responseWithQuestions(questions: unknown[]) {
  return {
    ok: true,
    json: async () => ({
      output_text: JSON.stringify({ questions }),
    }),
  };
}

function validQuestions(): GeneratedQuestion[] {
  return [
    {
      type: "multiple_choice",
      prompt: "A model performs perfectly in practice drills but fails on fresh exam problems. What is the best diagnosis?",
      options: ["Overfitting", "Underfitting", "Labeling", "Normalization"],
      correctOptionIndex: 0,
      correctAnswer: "Overfitting",
      acceptedAnswers: [],
      rubric: null,
      sampleAnswer: null,
      difficulty: "intermediate",
      explanation: "The notes describe overfitting as memorizing training examples while failing on new data.",
      sourceResourceId: resourceId.toString(),
    },
    {
      type: "fill_in_blank",
      prompt: "Supervised learning depends on examples that are _____.",
      options: [],
      correctOptionIndex: null,
      correctAnswer: "labeled",
      acceptedAnswers: ["labeled", "labelled"],
      rubric: null,
      sampleAnswer: null,
      difficulty: "beginner",
      explanation: "The source states that supervised learning uses labeled examples.",
      sourceResourceId: resourceId.toString(),
    },
    {
      type: "short_answer",
      prompt: "Why can memorizing training examples make a model unreliable on new cases?",
      options: [],
      correctOptionIndex: null,
      correctAnswer: null,
      acceptedAnswers: [],
      rubric: "A correct answer must connect memorization of training data to poor generalization on unseen examples.",
      sampleAnswer: "Memorization can capture quirks of the training set instead of reusable patterns, so the model fails on new data.",
      difficulty: "advanced",
      explanation: "The notes connect overfitting with poor performance on new data.",
      sourceResourceId: resourceId.toString(),
    },
  ];
}

describe("AI quiz generation", () => {
  beforeEach(() => {
    process.env.OPENAI_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("calls OpenAI and validates mixed quiz questions", async () => {
    const fetchMock = vi.fn().mockResolvedValue(responseWithQuestions(validQuestions()));
    global.fetch = fetchMock as unknown as typeof fetch;

    const questions = await quizGenerationTesting.generateQuizQuestions(resources, 3, 55);

    expect(fetchMock).toHaveBeenCalledWith("https://api.openai.com/v1/responses", expect.any(Object));
    expect(questions.map((question) => question.type)).toEqual(["multiple_choice", "fill_in_blank", "short_answer"]);
    expect(questions[0].correctOptionIndex).toBe(0);
    expect(questions[1].acceptedAnswers).toContain("labeled");
    expect(questions[2].rubric).toContain("generalization");
  });

  it("fails clearly when OpenAI is not configured", async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(quizGenerationTesting.generateQuizQuestions(resources, 3, 0)).rejects.toThrow(QuizValidationError);
  });

  it("rejects boilerplate prompts from the AI response", () => {
    const weakQuestions = validQuestions();
    weakQuestions[0] = {
      ...weakQuestions[0],
      prompt: "According to the introductory note, which statement is best supported?",
    };

    expect(() => quizGenerationTesting.validateGeneratedQuestions(weakQuestions, resources, 3)).toThrow(QuizValidationError);
  });
});

describe("mixed quiz grading helpers", () => {
  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  const fillInQuestion: IQuizQuestion = {
    type: "fill_in_blank",
    prompt: "Supervised learning depends on examples that are _____.",
    correctAnswer: "labeled",
    acceptedAnswers: ["labeled", "labelled"],
    explanation: "The source says supervised learning uses labeled examples.",
  };

  it("normalizes accepted fill-in answers", () => {
    expect(quizAttemptTesting.gradeFillInBlank(fillInQuestion, " Labelled! ")).toBe(true);
    expect(quizAttemptTesting.gradeFillInBlank(fillInQuestion, "unlabeled")).toBe(false);
  });

  it("calls OpenAI when grading short answers", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output_text: JSON.stringify({
          grades: [{ questionIndex: 0, isCorrect: true, feedback: "This identifies the generalization issue." }],
        }),
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const grades = await quizAttemptTesting.gradeShortAnswers(
      [
        {
          type: "short_answer",
          prompt: "Why is overfitting unreliable?",
          explanation: "Overfitting weakens generalization.",
          rubric: "Must mention memorization and poor generalization.",
          sampleAnswer: "It memorizes training quirks and fails on new examples.",
        },
      ],
      ["It memorizes and does not generalize."]
    );

    expect(fetchMock).toHaveBeenCalled();
    expect(grades.get(0)?.isCorrect).toBe(true);
  });

  it("fails clearly when short-answer grading is unavailable", async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(
      quizAttemptTesting.gradeShortAnswers(
        [
          {
            type: "short_answer",
            prompt: "Why is overfitting unreliable?",
            explanation: "Overfitting weakens generalization.",
            rubric: "Must mention memorization and poor generalization.",
            sampleAnswer: "It memorizes training quirks and fails on new examples.",
          },
        ],
        ["It memorizes."]
      )
    ).rejects.toThrow(QuizAttemptGradingError);
  });
});
