# CoachClaw — Initial Product Discovery Brainstorm

> Date: April 10, 2026
> Stage: Initial Discovery
> Input: Perplexity AI research on personalized/adaptive learning platforms

---

## 1. Opportunity Summary

| | |
|---|---|
| **Product** | CoachClaw — AI-guided study platform |
| **Target segment** | Academic learners (K–12, university) and self-study professionals studying any subject |
| **Core problem** | Complex topics are hard to learn alone; existing platforms are course-centric, not learner-centric |
| **Desired outcome** | Distill any subject to the learner's level using AI; adapt continuously; let users bring their own resources |
| **Competitors** | Coursera, DreamBox, Squirrel AI, Smart Sparrow, 360Learning, Pearson MyLab |
| **Differentiation angle** | "Any subject, any level" + user-supplied resources + AI-powered concept distillation |

### Base Features Identified (from research)

- Learner profile (goals, level, strengths, weaknesses, history)
- Initial diagnostic assessment
- Learning path engine (prerequisites, next-best actions)
- Content modularization (small tagged units)
- Adaptive delivery (difficulty, pacing, format)
- Assessment & immediate feedback
- Progress tracking (mastery, not just completion)
- Content recommendation (based on learner model)
- Analytics dashboard
- AI explanation layer (rephrase hard ideas simply)
- User-supplied resource ingestion (notes, links, PDFs)

---

## 2. Feature Ideas — Three Perspectives

### Product Manager (Market fit, value, competitive advantage)

1. **Resource-to-Quiz Pipeline** — Users upload notes, PDFs, or paste links; AI instantly generates quizzes calibrated to their assessed level. Turns passive material into active recall.
2. **Adaptive Difficulty Engine** — After each interaction, the system adjusts question difficulty and explanation depth. Moves the learner through a challenge zone, not a fixed curriculum.
3. **Topic Mastery Score** — A visible, per-topic competency score (not just completion %) that updates in real time. Learners and employers can trust it as evidence of understanding.
4. **"Explain Like I'm at Level X"** — AI rewrites any concept at the learner's diagnosed level. A university-level explanation can be distilled to a high-school version on demand.
5. **Study Streak & Spaced Repetition** — Track daily study streaks and auto-schedule review sessions based on forgetting curves. Drives retention and daily engagement.

### Product Designer (UX, onboarding, engagement)

1. **60-Second Onboarding Diagnostic** — A fast, interactive mini-assessment during signup that feels like a game, not a test. Immediately shows the learner their starting point and a personalized path.
2. **Learning Dashboard with "Next Best Action"** — A single home screen showing: current mastery map, weak areas, and one clear call-to-action ("Review X" or "Try quiz on Y").
3. **Resource Inbox** — A drag-and-drop zone where users can paste links, upload files, or snap photos of handwritten notes. The system parses them and slots content into the learning graph.
4. **Micro-Lesson Cards** — Bite-sized content cards (< 5 min each) with swipe-to-continue flow. Each card ends with a quick check question. Designed for mobile-first, busy learners.
5. **Progress Celebration & Milestone Nudges** — Visual milestones (e.g., "You've mastered 3/8 subtopics in Calculus"), animated progress rings, and smart nudges when the learner hasn't studied in 2 days.

### Software Engineer (Technical innovation, integrations, platform)

1. **Concept Graph Engine** — A knowledge graph that maps concepts and prerequisites per topic. Powers adaptive sequencing: the system knows "you need fractions before algebra." Built on a graph data structure stored in MongoDB.
2. **AI Content Ingestion Pipeline** — An async pipeline that takes user-uploaded PDFs, URLs, and text, extracts key concepts via LLM, tags them against the concept graph, and generates learning units automatically.
3. **Real-Time Learner Model (Knowledge Tracing)** — A per-user model that updates after every answer/interaction. Tracks concept-level mastery probabilities using Bayesian Knowledge Tracing or a simpler decay model. Stored in a Progress collection.
4. **Streaming AI Explanations** — Use OpenAI streaming API to deliver long explanations incrementally. The UI shows text appearing in real time, keeping perceived latency low for "explain this concept" interactions.
5. **Pluggable Assessment Engine** — A generic quiz/assessment runner that supports multiple question types (MCQ, fill-in, short answer, matching). AI generates questions from the concept graph; the engine grades them and feeds results back to the learner model.

---

## 3. Prioritized Top 5

| Rank | Idea | Source | Why |
|------|------|--------|-----|
| **1** | **AI Content Ingestion Pipeline** | Engineer | Core differentiator — "bring your own resources" only works if the system can ingest and structure anything. Without this, the product is just another course platform. |
| **2** | **Resource-to-Quiz Pipeline** | PM | Immediate value — upload notes, get a quiz. Fastest way to prove the product works. Users feel the AI "understands" their material. |
| **3** | **60-Second Onboarding Diagnostic** | Designer | Critical first impression — measures starting level and immediately personalizes the experience. Without it, adaptation has no baseline. |
| **4** | **"Explain Like I'm at Level X"** | PM | The headline differentiator — no competitor lets you take any concept and have it rewritten at your diagnosed comprehension level. |
| **5** | **Real-Time Learner Model** | Engineer | The adaptation engine — everything else depends on knowing what the learner knows right now. Makes the platform genuinely adaptive. |

---

## 4. Reasoning & Key Assumptions

### #1 — AI Content Ingestion Pipeline

**Reasoning:** The research identified user-supplied resources as a key requirement. The platform must convert raw uploads (PDFs, links, notes) into structured learning units. Without this, the product cannot serve "any subject" — it would be limited to pre-built content.

**Assumptions to test:**
- LLMs can reliably extract key concepts from messy, user-uploaded material (handwritten notes, varied PDF formats).
- Extracted concepts can be accurately mapped to a prerequisite structure without manual curation.
- Users actually have materials to upload (vs. expecting the platform to find content for them).
- Ingestion latency (< 30s for a typical PDF) is acceptable.

### #2 — Resource-to-Quiz Pipeline

**Reasoning:** Fastest path to demonstrating value. A user uploads their lecture notes and immediately gets a personalized quiz. Closes the loop between "I have material" and "Am I actually learning it?"

**Assumptions to test:**
- AI-generated questions from user content are pedagogically sound (not just trivia).
- Users prefer quizzes generated from *their* material over generic topic quizzes.
- The quiz quality is high enough that users trust it for exam preparation.
- Grading short-answer and open-ended responses with AI is accurate enough.

### #3 — 60-Second Onboarding Diagnostic

**Reasoning:** Adaptation must start from a measured baseline. A fast, engaging diagnostic at signup gives the system its first learner model and gives the user an immediate reason to trust the platform.

**Assumptions to test:**
- A short diagnostic (5–8 questions) can meaningfully estimate level for a broad range of subjects.
- Users are willing to take a diagnostic before seeing content (vs. wanting to browse first).
- The diagnostic can be generated dynamically for any topic the user chooses.
- The assessed level is accurate enough that the first recommended content feels right.

### #4 — "Explain Like I'm at Level X"

**Reasoning:** The product's "magic moment." The research frames the core value as "distill knowledge at the user's level." A university student studying quantum mechanics gets an explanation tuned to their assessed physics level — qualitatively different from any course platform.

**Assumptions to test:**
- LLMs can reliably produce explanations at distinct, calibrated difficulty levels.
- Users perceive the level-adjusted explanation as genuinely helpful, not dumbed-down.
- The system can determine the right level automatically (vs. requiring manual selection).
- This works across domains (STEM, humanities, professional skills).

### #5 — Real-Time Learner Model (Knowledge Tracing)

**Reasoning:** The research describes a "closed-loop adaptive learning system" that updates after every interaction. This is the engine that makes everything else adaptive. Without it, the platform is personalized once at signup but static afterward.

**Assumptions to test:**
- A simplified knowledge tracing model (per-concept mastery with decay) is sufficient for MVP.
- Enough signal is available from quiz answers + time-on-task to update the model meaningfully.
- The model improves recommendations noticeably within the first 10–15 interactions.
- Users perceive the adaptation ("it's getting harder because I'm improving") as positive.

---

## 5. Suggested MVP Build Order

```
1. AI Content Ingestion Pipeline  →  lets users upload resources
2. Resource-to-Quiz Pipeline      →  instant value from uploaded content
3. Onboarding Diagnostic          →  measures starting level
4. Real-Time Learner Model        →  makes adaptation work
5. "Explain Like I'm at Level X"  →  the wow moment
```

This order delivers a testable product at each step. After step 2, you can already validate whether users find value in "upload notes → get quiz." Steps 3–5 layer on true personalization.

---

## 6. Remaining Ideas (Backlog)

These are strong ideas that didn't make the top 5 but should be built once the core is validated:

- **Adaptive Difficulty Engine** — extend the learner model to adjust question difficulty automatically
- **Topic Mastery Score** — surface mastery as a trusted, shareable metric
- **Learning Dashboard with Next Best Action** — the primary navigation UX
- **Concept Graph Engine** — powers prerequisite-aware sequencing
- **Micro-Lesson Cards** — mobile-first content format
- **Study Streak & Spaced Repetition** — retention and engagement mechanics
- **Resource Inbox** — polished drag-and-drop UX for uploads
- **Streaming AI Explanations** — real-time explanation delivery
- **Pluggable Assessment Engine** — multi-format quiz support
- **Progress Celebration & Milestone Nudges** — engagement layer
