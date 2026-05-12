import mongoose from "mongoose";

import { connectDB } from "@/lib/db/mongoose";
import { Progress } from "@/models/Progress";
import { Quiz, type IQuizQuestion, type QuizQuestionDifficulty, type QuizQuestionType } from "@/models/Quiz";
import { Resource } from "@/models/Resource";
import { Topic } from "@/models/Topic";

export class QuizValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuizValidationError";
  }
}

export class QuizTopicNotFoundError extends Error {
  constructor() {
    super("Topic not found");
    this.name = "QuizTopicNotFoundError";
  }
}

type CreateResourceQuizInput = {
  userId: string;
  subjectId?: string;
  topicId: string;
  resourceIds: string[];
  questionCount: number;
};

type ResourceRow = {
  _id: mongoose.Types.ObjectId;
  title: string;
  extractedContent: string;
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

export type GeneratedQuestion = {
  type: QuizQuestionType;
  prompt: string;
  options: string[];
  correctOptionIndex: number | null;
  correctAnswer: string | null;
  acceptedAnswers: string[];
  rubric: string | null;
  sampleAnswer: string | null;
  difficulty: QuizQuestionDifficulty;
  explanation: string;
  sourceResourceId: string | null;
};

const MAX_RESOURCE_CHARS = 3000;
const MAX_TOTAL_SOURCE_CHARS = 12000;
const QUALITY_BLOCKLIST = [/^according to\b/i, /^true\s+or\s+false\b/i];

const quizSchema = {
  type: "object",
  additionalProperties: false,
  required: ["questions"],
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "type",
          "prompt",
          "options",
          "correctOptionIndex",
          "correctAnswer",
          "acceptedAnswers",
          "rubric",
          "sampleAnswer",
          "difficulty",
          "explanation",
          "sourceResourceId",
        ],
        properties: {
          type: { type: "string", enum: ["multiple_choice", "true_false", "fill_in_blank", "short_answer"] },
          prompt: { type: "string" },
          options: {
            type: "array",
            items: { type: "string" },
          },
          correctOptionIndex: { type: ["number", "null"] },
          correctAnswer: { type: ["string", "null"] },
          acceptedAnswers: {
            type: "array",
            items: { type: "string" },
          },
          rubric: { type: ["string", "null"] },
          sampleAnswer: { type: ["string", "null"] },
          difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
          explanation: { type: "string" },
          sourceResourceId: { type: ["string", "null"] },
        },
      },
    },
  },
};

function clampQuestionCount(value: number) {
  if (!Number.isFinite(value)) return 5;
  return Math.min(10, Math.max(1, Math.round(value)));
}

function compactText(content: string) {
  return content.replace(/\s+/g, " ").trim();
}

function trimText(content: string, maxLength: number) {
  const compact = compactText(content);
  return compact.length > maxLength ? `${compact.slice(0, maxLength).trim()}...` : compact;
}

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

function getDifficultyProfile(masteryScore: number): {
  level: QuizQuestionDifficulty;
  learnerContext: string;
} {
  if (masteryScore >= 70) {
    return {
      level: "advanced",
      learnerContext:
        "The learner has high mastery. Favor transfer, misconception diagnosis, comparison, and short applied explanations.",
    };
  }

  if (masteryScore >= 40) {
    return {
      level: "intermediate",
      learnerContext:
        "The learner has partial mastery. Mix recall with application and require some short explanations.",
    };
  }

  return {
    level: "beginner",
    learnerContext:
      "The learner is early in the topic. Favor clear conceptual checks, simple applications, and a few concise written responses.",
  };
}

function getTargetTypeMix(questionCount: number, masteryScore: number) {
  const trueFalse = masteryScore >= 70 ? (questionCount >= 10 ? 1 : 0) : questionCount >= 4 ? 1 : 0;
  const shortAnswer =
    masteryScore >= 70
      ? Math.max(1, Math.floor(questionCount * 0.4))
      : masteryScore >= 40
        ? Math.max(1, Math.floor(questionCount * 0.25))
        : Math.max(1, Math.floor(questionCount * 0.2));
  const fillInBlank =
    masteryScore >= 70
      ? Math.max(1, Math.floor(questionCount * 0.25))
      : Math.max(1, Math.floor(questionCount * 0.3));
  const multipleChoice = Math.max(0, questionCount - trueFalse - shortAnswer - fillInBlank);

  return {
    multiple_choice: multipleChoice,
    true_false: trueFalse,
    fill_in_blank: fillInBlank,
    short_answer: shortAnswer,
  };
}

function buildSourcePayload(resources: ResourceRow[]) {
  let remaining = MAX_TOTAL_SOURCE_CHARS;

  return resources.map((resource) => {
    const excerpt = trimText(resource.extractedContent, Math.min(MAX_RESOURCE_CHARS, remaining));
    remaining = Math.max(0, remaining - excerpt.length);

    return {
      id: resource._id.toString(),
      title: resource.title,
      excerpt,
    };
  });
}

function parseGeneratedQuiz(payload: OpenAIResponse) {
  const text = extractResponseText(payload);

  if (!text) {
    throw new QuizValidationError("AI returned an empty quiz response");
  }

  try {
    return JSON.parse(text) as { questions?: GeneratedQuestion[] };
  } catch {
    throw new QuizValidationError("AI returned malformed quiz JSON");
  }
}

function cleanString(value: unknown) {
  return typeof value === "string" ? compactText(value) : "";
}

function cleanStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const clean: string[] = [];

  for (const item of value) {
    const text = cleanString(item);
    const key = normalizeText(text);

    if (!text || seen.has(key)) continue;
    seen.add(key);
    clean.push(text);
  }

  return clean;
}

function validateObjectiveQuestion(question: GeneratedQuestion) {
  const options = cleanStringArray(question.options);
  const correctOptionIndex = Number(question.correctOptionIndex);

  if (options.length < 2 || options.length > 4) return null;
  if (!Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= options.length) return null;

  if (question.type === "true_false") {
    const normalizedOptions = options.map((option) => normalizeText(option));
    if (!normalizedOptions.includes("true") || !normalizedOptions.includes("false")) return null;
  }

  return {
    options,
    correctOptionIndex,
    correctAnswer: options[correctOptionIndex],
  };
}

function validateGeneratedQuestions(
  rawQuestions: GeneratedQuestion[] | undefined,
  resources: ResourceRow[],
  desiredCount: number
): IQuizQuestion[] {
  if (!Array.isArray(rawQuestions) || rawQuestions.length !== desiredCount) {
    throw new QuizValidationError("AI did not return the requested number of quiz questions");
  }

  const resourceIds = new Set(resources.map((resource) => resource._id.toString()));
  const prompts = new Set<string>();
  const questions: IQuizQuestion[] = [];

  for (const rawQuestion of rawQuestions) {
    const type = rawQuestion.type;
    const prompt = cleanString(rawQuestion.prompt);
    const explanation = cleanString(rawQuestion.explanation);
    const difficulty = rawQuestion.difficulty;
    const promptKey = normalizeText(prompt);

    if (!["multiple_choice", "true_false", "fill_in_blank", "short_answer"].includes(type)) continue;
    if (!prompt || prompt.length < 18 || prompts.has(promptKey)) continue;
    if (QUALITY_BLOCKLIST.some((pattern) => pattern.test(prompt))) continue;
    if (!["beginner", "intermediate", "advanced"].includes(difficulty)) continue;
    if (!explanation || explanation.length < 24) continue;

    prompts.add(promptKey);

    const sourceResourceId =
      rawQuestion.sourceResourceId && resourceIds.has(rawQuestion.sourceResourceId)
        ? new mongoose.Types.ObjectId(rawQuestion.sourceResourceId)
        : undefined;

    if (type === "multiple_choice" || type === "true_false") {
      const objective = validateObjectiveQuestion(rawQuestion);
      if (!objective) continue;

      questions.push({
        type,
        prompt,
        options: objective.options,
        correctOptionIndex: objective.correctOptionIndex,
        correctAnswer: objective.correctAnswer,
        acceptedAnswers: [],
        rubric: null,
        sampleAnswer: null,
        difficulty,
        explanation,
        sourceResourceId,
      });
      continue;
    }

    if (type === "fill_in_blank") {
      const acceptedAnswers = cleanStringArray(rawQuestion.acceptedAnswers);
      const correctAnswer = cleanString(rawQuestion.correctAnswer);

      if (!prompt.includes("_____") && !prompt.includes("___")) continue;
      if (!correctAnswer || acceptedAnswers.length === 0) continue;

      questions.push({
        type,
        prompt,
        options: [],
        correctOptionIndex: null,
        correctAnswer,
        acceptedAnswers,
        rubric: null,
        sampleAnswer: null,
        difficulty,
        explanation,
        sourceResourceId,
      });
      continue;
    }

    const rubric = cleanString(rawQuestion.rubric);
    const sampleAnswer = cleanString(rawQuestion.sampleAnswer);

    if (!rubric || rubric.length < 30 || !sampleAnswer || sampleAnswer.length < 24) continue;

    questions.push({
      type,
      prompt,
      options: [],
      correctOptionIndex: null,
      correctAnswer: sampleAnswer,
      acceptedAnswers: [],
      rubric,
      sampleAnswer,
      difficulty,
      explanation,
      sourceResourceId,
    });
  }

  if (questions.length !== desiredCount) {
    throw new QuizValidationError("AI returned quiz questions that did not meet quality requirements");
  }

  return questions;
}

async function generateQuizQuestions(resources: ResourceRow[], desiredCount: number, masteryScore: number) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_QUIZ_MODEL || process.env.OPENAI_TOPIC_MODEL || "gpt-4.1";

  if (!apiKey) {
    throw new QuizValidationError("AI quiz generation is not configured");
  }

  const difficultyProfile = getDifficultyProfile(masteryScore);
  const typeMix = getTargetTypeMix(desiredCount, masteryScore);
  const sourceMaterials = buildSourcePayload(resources);

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
                "You are CoachClaw, an expert assessment designer.",
                "Return only JSON that matches the provided schema.",
                "Create source-grounded quiz questions from the provided learner notes.",
                "Do not use boilerplate openings such as 'According to', 'Based on the notes', or 'True or false:'.",
                "Do not copy full source sentences as answer options.",
                "Make distractors plausible misconceptions, not random unrelated statements.",
                "Test understanding, comparison, application, and error diagnosis.",
                "For true_false items, write the statement only; the UI already labels the type.",
                "For fill_in_blank items, include a blank as _____ and provide accepted answer variants.",
                "For short_answer items, provide a concrete grading rubric and sample answer.",
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
                requestedQuestionCount: desiredCount,
                masteryScore,
                difficultyProfile: difficultyProfile.level,
                learnerContext: difficultyProfile.learnerContext,
                targetTypeMix: typeMix,
                sourceMaterials,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "resource_quiz",
          strict: true,
          schema: quizSchema,
        },
      },
    }),
  });

  const payload = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new QuizValidationError(payload.error?.message || "AI quiz generation failed");
  }

  const parsed = parseGeneratedQuiz(payload);
  return validateGeneratedQuestions(parsed.questions, resources, desiredCount);
}

export async function createResourceQuiz({
  userId,
  subjectId,
  topicId,
  resourceIds,
  questionCount,
}: CreateResourceQuizInput) {
  if (!mongoose.Types.ObjectId.isValid(topicId)) {
    throw new QuizTopicNotFoundError();
  }

  if (subjectId && !mongoose.Types.ObjectId.isValid(subjectId)) {
    throw new QuizTopicNotFoundError();
  }

  await connectDB();

  const topicQuery = subjectId ? { _id: topicId, subjectId, userId } : { _id: topicId, userId };
  const topic = await Topic.findOne(topicQuery).select("subjectId").lean();

  if (!topic) {
    throw new QuizTopicNotFoundError();
  }

  const validResourceObjectIds = resourceIds
    .filter((resourceId) => mongoose.Types.ObjectId.isValid(resourceId))
    .map((resourceId) => new mongoose.Types.ObjectId(resourceId));

  const resourceQuery =
    validResourceObjectIds.length > 0
      ? { _id: { $in: validResourceObjectIds }, topicId, userId, status: "ready", type: "text" }
      : { topicId, userId, status: "ready", type: "text" };

  const [resources, progress] = await Promise.all([
    Resource.find(resourceQuery).sort({ createdAt: -1 }).lean<ResourceRow[]>(),
    Progress.findOne({ topicId, userId }).select("masteryScore").lean<{ masteryScore: number }>(),
  ]);

  if (resources.length === 0) {
    throw new QuizValidationError("Select at least one ready text resource");
  }

  const count = clampQuestionCount(questionCount);
  const questions = await generateQuizQuestions(resources, count, progress?.masteryScore ?? 0);

  return Quiz.create({
    userId,
    subjectId: topic.subjectId,
    topicId,
    resourceIds: resources.map((resource) => resource._id),
    questionCount: questions.length,
    questions,
  });
}

export const __testing = {
  generateQuizQuestions,
  getTargetTypeMix,
  validateGeneratedQuestions,
};
