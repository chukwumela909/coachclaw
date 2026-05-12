"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Plus, Sparkles } from "lucide-react";

type TopicSuggestion = {
  id: string;
  name: string;
  description: string;
  reason: string;
  sources: { title: string; url: string }[];
};

type TopicRecommendationsProps = {
  subjectId: string;
  subjectName: string;
  hasGoal: boolean;
  topicCount: number;
};

function suggestionId(index: number) {
  return `subject-suggestion-${index}`;
}

export function TopicRecommendations({ subjectId, subjectName, hasGoal, topicCount }: TopicRecommendationsProps) {
  const router = useRouter();
  const hasAutoRun = useRef(false);
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "loading" | "creating">("idle");
  const [error, setError] = useState("");

  const selectedSuggestions = useMemo(
    () => suggestions.filter((suggestion) => selectedIds.has(suggestion.id)),
    [selectedIds, suggestions]
  );

  const generateSuggestions = useCallback(async () => {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(`/api/subjects/${subjectId}/topic-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 4 }),
      });
      const data = (await response.json()) as { suggestions?: Omit<TopicSuggestion, "id">[]; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to suggest topics right now.");
      }

      const nextSuggestions = (data.suggestions ?? []).map((suggestion, index) => ({
        ...suggestion,
        id: suggestionId(index),
      }));
      setSuggestions(nextSuggestions);
      setSelectedIds(new Set(nextSuggestions.map((suggestion) => suggestion.id)));
    } catch (err) {
      setSuggestions([]);
      setSelectedIds(new Set());
      setError(err instanceof Error ? err.message : "Unable to suggest topics right now.");
    } finally {
      setStatus("idle");
    }
  }, [subjectId]);

  async function createSelectedTopics() {
    if (selectedSuggestions.length === 0) {
      setError("Select at least one suggested topic to create.");
      return;
    }

    setStatus("creating");
    setError("");

    try {
      const response = await fetch(`/api/subjects/${subjectId}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: selectedSuggestions.map((suggestion) => ({
            name: suggestion.name,
            description: suggestion.description,
          })),
        }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to create selected topics.");
      }

      router.refresh();
      setSuggestions([]);
      setSelectedIds(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create selected topics.");
    } finally {
      setStatus("idle");
    }
  }

  function updateSuggestion(id: string, patch: Partial<Pick<TopicSuggestion, "name" | "description">>) {
    setSuggestions((current) =>
      current.map((suggestion) => (suggestion.id === id ? { ...suggestion, ...patch } : suggestion))
    );
  }

  function toggleSuggestion(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  useEffect(() => {
    if (hasAutoRun.current || topicCount > 0) return;
    hasAutoRun.current = true;
    void generateSuggestions();
  }, [generateSuggestions, topicCount]);

  const isBusy = status !== "idle";

  return (
    <section className="mb-8 rounded-[12px] border border-[#222a3514] bg-white p-5 shadow-[var(--shadow-level-2)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-[999px] bg-[#f5f5f5] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#57534e]">
            <Sparkles size={14} />
            AI topic suggestions
          </div>
          <h3 className="heading-xs text-[#242424]">Recommended topics for {subjectName}</h3>
          <p className="mt-2 max-w-[620px] text-[14px] font-light leading-[1.5] text-[#898989]">
            {topicCount === 0
              ? "CoachClaw is preparing a starter set from the course name, description, and goal."
              : "Generate more topics that continue the sequence you already started."}
          </p>
          {!hasGoal ? (
            <p className="mt-2 text-[13px] font-medium text-[#898989]">
              Tip: adding a course goal later will make these recommendations more personal.
            </p>
          ) : null}
        </div>
        {topicCount > 0 ? (
          <button
            type="button"
            onClick={generateSuggestions}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#242424] px-5 py-[12px] text-[14px] font-semibold text-white shadow-[var(--shadow-level-2)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === "loading" ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Suggest More Topics
          </button>
        ) : null}
      </div>

      {status === "loading" ? (
        <div className="mt-6 flex items-center gap-3 rounded-[8px] bg-[#fafafa] p-4 text-[14px] font-medium text-[#57534e]">
          <Loader2 className="animate-spin" size={18} />
          CoachClaw is generating topics.
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-[8px] border border-[#ef444433] bg-[#fff7f7] p-4 text-[14px] leading-[1.5] text-[#9f1d1d]">
          {error} You can still add a topic manually.
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="mt-6 space-y-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              className={`rounded-[10px] border p-4 shadow-[var(--shadow-level-5)] ${
                selectedIds.has(suggestion.id) ? "border-[#242424] bg-[#fafafa]" : "border-[#222a3514] bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(suggestion.id)}
                  onChange={() => toggleSuggestion(suggestion.id)}
                  className="mt-1 size-5 accent-[#242424]"
                  aria-label={`Select ${suggestion.name}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-[#898989]">
                    Suggested topic {index + 1}
                  </div>
                  <input
                    value={suggestion.name}
                    onChange={(event) => updateSuggestion(suggestion.id, { name: event.target.value })}
                    className="w-full rounded-[8px] border border-[#222a3514] bg-white px-3 py-2 text-[16px] font-semibold text-[#242424] outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  />
                  <textarea
                    value={suggestion.description}
                    onChange={(event) => updateSuggestion(suggestion.id, { description: event.target.value })}
                    rows={3}
                    className="mt-3 w-full resize-none rounded-[8px] border border-[#222a3514] bg-white px-3 py-2 text-[14px] leading-[1.5] text-[#57534e] outline-none focus:ring-1 focus:ring-[#3b82f6]"
                  />
                  <p className="mt-3 text-[13px] leading-[1.5] text-[#898989]">
                    <span className="font-semibold text-[#57534e]">Why:</span> {suggestion.reason}
                  </p>
                  {suggestion.sources.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestion.sources.map((source) => (
                        <a
                          key={source.url}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-full items-center gap-1 rounded-[999px] bg-[#f0eee8] px-3 py-1 text-[12px] font-semibold text-[#57534e] hover:text-[#242424]"
                        >
                          <span className="truncate">{source.title}</span>
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-3 border-t border-[#222a3514] pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-[#898989]">
              {selectedSuggestions.length} of {suggestions.length} selected. Topics will be added in this order.
            </p>
            <button
              type="button"
              onClick={createSelectedTopics}
              disabled={isBusy || selectedSuggestions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#242424] px-5 py-[12px] text-[14px] font-semibold text-white shadow-[var(--shadow-level-2)] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === "creating" ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              Create Selected Topics
            </button>
          </div>
        </div>
      ) : topicCount === 0 && status !== "loading" ? (
        <div className="mt-6 rounded-[8px] border border-dashed border-[#e5e5e5] p-6 text-center">
          <p className="text-[14px] font-medium text-[#898989]">
            Suggestions will appear here. You can also use the manual Add Topic page.
          </p>
          <Link
            href={`/dashboard/subjects/${subjectId}/topics/new`}
            className="mt-4 inline-flex items-center justify-center rounded-[8px] bg-white px-4 py-2 text-[14px] font-semibold text-[#242424] shadow-[var(--shadow-level-2)] hover:bg-[#f5f5f5]"
          >
            Add Topic Manually
          </Link>
        </div>
      ) : null}
    </section>
  );
}
