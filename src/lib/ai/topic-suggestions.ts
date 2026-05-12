export type TopicSuggestionSource = {
  title: string;
  url: string;
};

export type TopicSuggestion = {
  name: string;
  description: string;
  reason: string;
  sources: TopicSuggestionSource[];
};

export class TopicSuggestionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TopicSuggestionError";
  }
}

type ExistingTopic = {
  name: string;
  description?: string;
};

type GenerateTopicSuggestionsInput = {
  subjectName: string;
  subjectDescription?: string;
  subjectGoal?: string;
  existingTopics: ExistingTopic[];
  count?: number;
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

const suggestionSchema = {
  type: "object",
  additionalProperties: false,
  required: ["suggestions"],
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "description", "reason", "sources"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          reason: { type: "string" },
          sources: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "url"],
              properties: {
                title: { type: "string" },
                url: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
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

function sanitizeSuggestions(suggestions: TopicSuggestion[], existingTopics: ExistingTopic[], count: number) {
  const seen = new Set(existingTopics.map((topic) => normalizeName(topic.name)));
  const clean: TopicSuggestion[] = [];

  for (const suggestion of suggestions) {
    const name = suggestion.name.trim();
    const description = suggestion.description.trim();
    const reason = suggestion.reason.trim();
    const key = normalizeName(name);

    if (!name || !description || !reason || !key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    clean.push({
      name,
      description,
      reason,
      sources: suggestion.sources
        .map((source) => ({
          title: source.title.trim(),
          url: source.url.trim(),
        }))
        .filter((source) => source.title && /^https?:\/\//.test(source.url))
        .slice(0, 2),
    });

    if (clean.length >= count) break;
  }

  return clean;
}

export async function generateTopicSuggestions({
  subjectName,
  subjectDescription,
  subjectGoal,
  existingTopics,
  count = 4,
}: GenerateTopicSuggestionsInput) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_TOPIC_MODEL || "gpt-4.1";
  const suggestionCount = Math.min(4, Math.max(1, Math.round(count)));
  const description = subjectDescription?.trim() || "No course description was provided.";
  const goal = subjectGoal?.trim() || "No explicit learner goal was provided; infer a sensible beginner-friendly learning path.";

  if (!apiKey) {
    throw new TopicSuggestionError("AI topic suggestions are not configured");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "You are CoachClaw, an expert academic curriculum planner.",
                "Return JSON that matches the provided schema.",
                "Suggest concise, teachable topic pages for a learner-owned course.",
                "Use web research when it helps identify a standard learning sequence or trusted syllabus shape.",
                "Avoid duplicates and near-duplicates of existing topics.",
                "Prefer the next logical learning sequence over broad survey labels.",
                "Include best-effort source links per topic only when a source informed the suggestion.",
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
                requestedTopicCount: suggestionCount,
                course: {
                  name: subjectName,
                  description,
                  learnerGoal: goal,
                },
                existingTopics,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "topic_suggestions",
          strict: true,
          schema: suggestionSchema,
        },
      },
    }),
  });

  const payload = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new TopicSuggestionError(payload.error?.message || "Unable to generate topic suggestions");
  }

  const text = extractResponseText(payload);

  if (!text) {
    throw new TopicSuggestionError("AI returned an empty suggestion response");
  }

  try {
    const parsed = JSON.parse(text) as { suggestions?: TopicSuggestion[] };
    return sanitizeSuggestions(parsed.suggestions ?? [], existingTopics, suggestionCount);
  } catch {
    throw new TopicSuggestionError("AI returned malformed topic suggestions");
  }
}
