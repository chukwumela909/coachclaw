# PRD: CoachClaw MVP — AI-Guided Personalized Study Platform

## Problem Statement

Students (secondary school and university) struggle to learn complex subjects effectively on their own. Existing learning platforms are course-centric — they deliver static content at a fixed level and expect the learner to adapt, rather than adapting to the learner. There is no affordable, accessible tool that acts like a real personal tutor: one that diagnoses your level, explains concepts at your comprehension ability, generates practice from your own study materials, and coaches you in real time through voice and text. Learners are left juggling disconnected tools (YouTube, notes apps, flashcard apps, ChatGPT) with no continuity, no progress tracking, and no adaptation.

## Solution

CoachClaw is a web-based AI study platform that simulates a personal tutor and life coach. It provides:

- **An AI coach** (text + voice) with a natural, adaptive personality that guides learners through any subject, explains concepts at their diagnosed level, and proactively checks in.
- **Resource ingestion** — users upload their own study materials (text, PDFs, images, audio, links) and the AI structures them into personalized learning plans with generative UI.
- **Adaptive quizzes** generated from user resources or any topic, calibrated to the learner's current mastery level.
- **Diagnostic assessment** to establish baseline knowledge before generating study guides.
- **Progress tracking** with per-topic mastery scores that update after every interaction.

The platform is learner-centric (no teacher/admin role). Guest users can interact with the AI coach without signing up (no data persisted). Signed-up users get full resource management, study guides, quizzes, progress tracking, and proactive notifications.

## User Stories

1. As a guest user, I want to chat with the AI coach about any topic so that I can get immediate help without creating an account.
2. As a guest user, I want to switch between text and voice chat so that I can use whichever mode is convenient.
3. As a guest user, I want the AI coach to speak back to me so that the experience feels like a real conversation.
4. As a guest user, I want the AI to quiz me verbally during voice mode so that I can test my knowledge hands-free.
5. As a new user, I want to sign up with email and password so that my data is saved for future sessions.
6. As a signed-in user, I want to create subjects (e.g., "Biology 101") to organize my learning.
7. As a signed-in user, I want to create topics within a subject (e.g., "Cell Division" under "Biology 101") so that I can focus on specific areas.
8. As a signed-in user, I want to upload text notes to a topic so that the AI can study them and generate content from them.
9. As a signed-in user, I want to upload PDF files (up to 200 pages) to a topic so that lecture slides and textbook chapters are ingested.
10. As a signed-in user, I want to upload images (photos of handwritten notes, diagrams, screenshots) so that the AI can extract and understand the content via OCR.
11. As a signed-in user, I want to upload audio recordings (lectures) so that the AI transcribes them and uses the content for learning.
12. As a signed-in user, I want to paste links (articles, YouTube videos) so that the AI scrapes the content or pulls the transcript.
13. As a signed-in user, I want the AI to process my uploaded resources and extract key concepts so that I don't have to organize everything manually.
14. As a signed-in user, I want the AI to generate a personalized learning plan for my topic, based on my diagnosed level and my resources, so that I know what to study and in what order.
15. As a signed-in user, I want the learning plan to use generative UI (dynamic cards, diagrams, timelines, code blocks, math equations, comparison tables) so that the experience is engaging and not static text.
16. As a signed-in user, I want to take a diagnostic assessment when I start a new subject so that the AI knows my baseline level.
17. As a signed-in user, I want the diagnostic to be short and dynamically generated so that it doesn't feel like a long test.
18. As a signed-in user, I want to generate a quiz from selected resources within a topic so that I can test myself on my own material.
19. As a signed-in user, I want to choose the number of questions in a quiz so that I can control session length.
20. As a signed-in user, I want quizzes to include multiple choice, fill-in-the-blank, short answer, and true/false questions so that I'm tested in different ways.
21. As a signed-in user, I want quiz difficulty to adapt based on my current mastery level so that questions are neither too easy nor too hard.
22. As a signed-in user, I want to see my score and a per-question explanation after completing a quiz so that I understand what I got wrong and why.
23. As a signed-in user, I want to retake a quiz and get fresh questions so that I can practice without memorizing answers.
24. As a signed-in user, I want to take quizzes via voice so that the AI reads questions and I answer verbally.
25. As a signed-in user, I want the AI coach to have a natural, adaptive personality so that it feels like talking to a real tutor.
26. As a signed-in user, I want to rename my AI coach so that the experience feels more personal.
27. As a signed-in user, I want the AI coach to be more encouraging when I'm struggling and more challenging when I'm doing well so that the tone matches my needs.
28. As a signed-in user, I want the AI coach to walk me through content as interactive cards so that learning feels guided and structured.
29. As a signed-in user, I want the AI coach to pull from web sources and its own knowledge when I don't have uploaded resources so that I can learn any topic from scratch.
30. As a signed-in user, I want the AI to cite verifiable sources when it pulls information from the web so that I can trust the content.
31. As a signed-in user, I want to see a dashboard with my subjects and per-topic mastery progress so that I know where I stand.
32. As a signed-in user, I want my mastery score to update after every quiz and coaching interaction so that progress tracking is real-time.
33. As a signed-in user, I want the AI to adjust explanation depth based on my tracked mastery level so that I always get content at the right complexity.
34. As a signed-in user, I want to receive email notifications when I haven't studied in a while so that I stay on track.
35. As a signed-in user, I want to receive push notifications with study reminders so that the coach proactively checks in.
36. As a signed-in user, I want to study one topic within a subject at a time so that I can focus deeply.
37. As a signed-in user, I want my conversation history with the AI coach to be saved so that I can continue where I left off.
38. As a signed-in user, I want the AI to render math equations, code blocks, and diagrams inline so that STEM content is properly formatted.

## Implementation Decisions

### Modules

1. **Auth Module**
   - NextAuth.js (Auth.js v5) with email/password credentials provider.
   - Guest mode: users interact with AI coach without authentication; no data persisted to database.
   - Signed-in mode: full access to all features; data persisted.
   - Session management via NextAuth JWT strategy.

2. **Subject & Resource Module**
   - Subjects are top-level containers created by the user (e.g., "Biology 101").
   - Each subject contains topics (e.g., "Cell Division").
   - Resources are uploaded to a topic. Supported formats: text, PDF, images, audio, links.
   - File storage: Backblaze B2 (S3-compatible API) for original files.
   - Ingestion pipeline processes each resource type:
     - **PDF** → text extraction (pdf-parse or similar)
     - **Image** → OCR (Tesseract.js or cloud OCR)
     - **Audio** → transcription via self-hosted faster-whisper on VPS
     - **Link** → scrape page content; for YouTube, extract transcript
     - **Text** → stored directly
   - Extracted text content stored in MongoDB alongside resource metadata.
   - File size limit: 200 pages (PDF) or equivalent.
   - AI processes extracted content to identify key concepts and tag them.

3. **Study Guide Generator**
   - Takes diagnostic results + ingested resource content for a topic.
   - AI generates a structured learning plan: ordered concepts, prerequisites, and learning steps calibrated to the learner's assessed level.
   - Uses generative UI: the AI returns structured data specifying component types and content. A finite library of React components renders them dynamically.
   - Component library includes: explanation card, quiz card, diagram/image card, code block, math equation (KaTeX), comparison table, timeline, summary card, flashcard.
   - Learning plans are stored in the database and can be revisited.

4. **Quiz Engine**
   - Generates quizzes from selected resources within a topic, or from any topic using AI knowledge + web sources.
   - Question types: multiple choice, fill-in-the-blank, short answer, true/false.
   - User selects number of questions.
   - Untimed.
   - Adaptive difficulty: quiz difficulty adjusts based on the learner's current mastery level from the Learner Model.
   - Grading: automatic for MCQ/true-false/fill-in; AI-graded for short answer.
   - After completion: score + per-question explanation.
   - Retake generates fresh questions from the same resource pool.
   - Voice-compatible: works in both text and voice mode.

5. **AI Coach (Chat + Voice)**
   - Conversational AI with a natural, adaptive personality.
   - Default name: "CoachClaw" (user can rename).
   - Text chat interface with streaming responses.
   - Voice mode: self-hosted STT (faster-whisper) + TTS (Piper or CosyVoice) on VPS.
   - Real-time bidirectional voice conversation: user speaks → STT → LLM → TTS → AI speaks back.
   - User can switch freely between text and voice.
   - The AI walks through content as interactive cards (generative UI).
   - Can teach from scratch without uploaded resources — pulls from web + LLM knowledge, cites verifiable sources.
   - Tone adapts: encouraging when the learner is struggling, challenging when they're breezing through.
   - Guest mode: full chat/voice, no data persisted.
   - Signed-in mode: conversation history stored, linked to subject/topic.
   - The Next.js web app communicates with the VPS voice service via WebSocket or API.

6. **Learner Model & Progress**
   - Diagnostic assessment at subject onboarding to establish baseline level.
   - Per-topic mastery score updated after every quiz and coaching interaction.
   - Signals tracked: quiz scores, per-question correctness, question difficulty, time on task.
   - Mastery score drives: quiz adaptive difficulty, AI explanation depth, study guide calibration.
   - Dashboard displays per-subject/topic mastery progress.
   - Stored in a Progress collection in MongoDB.

7. **Notification Module**
   - Email notifications (e.g., "You haven't studied in 2 days — want to review Cell Division?").
   - Push notifications for study reminders.
   - Coach-initiated: triggered by inactivity or scheduled study plans.
   - Requires signup (not available to guests).

8. **Dashboard**
   - Home screen for signed-in users.
   - Subject cards showing mastery progress per topic.
   - Persistent entry point to the AI coach (chat/voice) — always one click away.
   - Per-topic drill-down showing quiz history and mastery trend.

### Technical Decisions

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB with Mongoose ODM
- **AI:** OpenAI API (or compatible) for LLM; streaming for long completions
- **Auth:** NextAuth.js (Auth.js v5) with credentials provider
- **File Storage:** Backblaze B2 (S3-compatible)
- **Voice STT:** Self-hosted faster-whisper on VPS
- **Voice TTS:** Self-hosted Piper (lightweight, fast) or CosyVoice (more expressive) on VPS
- **Audio Transcription (ingestion):** Same faster-whisper instance
- **OCR:** Tesseract.js (server-side) for image-to-text
- **PDF Parsing:** pdf-parse or equivalent
- **Web Scraping:** cheerio + fetch for article content; YouTube transcript API for videos
- **Validation:** Zod schemas at API route handler level
- **Generative UI:** AI returns structured JSON; finite React component library renders dynamically
- **Real-time Voice:** WebSocket connection between Next.js client and VPS voice service

### Data Model (Collections)

- **User** — email, password hash, display name, coach name preference, created/updated timestamps
- **Subject** — userId, name, description, created/updated timestamps
- **Topic** — subjectId, name, description, order, created/updated timestamps
- **Resource** — topicId, type (text/pdf/image/audio/link), originalUrl (Backblaze), extractedContent, concepts[], metadata, status (processing/ready/error), created/updated timestamps
- **StudyGuide** — topicId, userId, learnerLevel, plan (structured JSON for generative UI), created/updated timestamps
- **Quiz** — topicId, userId, resourceIds[], questions[], questionCount, created/updated timestamps
- **QuizAttempt** — quizId, userId, answers[], score, perQuestionResults[], created/updated timestamps
- **Progress** — userId, topicId, masteryScore, diagnosticLevel, quizHistory[], interactionCount, lastStudiedAt, created/updated timestamps
- **Conversation** — userId, topicId (optional), messages[], mode (text/voice), created/updated timestamps

### API Design (Route Groups)

- `POST /api/auth/register` — email/password signup
- `POST /api/auth/[...nextauth]` — NextAuth handlers
- `GET/POST /api/subjects` — list/create subjects
- `GET/PUT/DELETE /api/subjects/[id]` — subject CRUD
- `GET/POST /api/subjects/[id]/topics` — list/create topics
- `GET/PUT/DELETE /api/topics/[id]` — topic CRUD
- `POST /api/topics/[id]/resources` — upload resource
- `GET /api/topics/[id]/resources` — list resources
- `POST /api/topics/[id]/study-guide` — generate study guide
- `GET /api/topics/[id]/study-guide` — get existing study guide
- `POST /api/topics/[id]/quiz` — generate quiz
- `POST /api/quizzes/[id]/attempt` — submit quiz attempt
- `GET /api/quizzes/[id]/attempt/[attemptId]` — get attempt results
- `POST /api/topics/[id]/diagnostic` — run diagnostic assessment
- `GET /api/progress` — get all progress for user
- `GET /api/progress/[topicId]` — get progress for topic
- `POST /api/chat` — send message to AI coach (streaming response)
- `WS /api/voice` — WebSocket for real-time voice (via VPS proxy)

## Testing Decisions

### What makes a good test
- Tests should verify **external behavior**, not implementation details.
- Tests should be deterministic — mock AI/LLM responses rather than calling live APIs.
- Tests should cover both success paths and meaningful failure modes (bad file uploads, invalid inputs, edge cases in grading).

### Modules to test

1. **Quiz Engine**
   - Grading logic for each question type (MCQ, fill-in, true/false, short answer).
   - Adaptive difficulty selection based on mastery level.
   - Quiz generation from resource content (with mocked AI).
   - Retake generates different questions.
   - Voice-mode quiz flow.

2. **Resource Ingestion Pipeline**
   - Each resource type processes correctly (PDF → text, image → OCR, audio → transcript, link → content).
   - Handles invalid/corrupt files gracefully.
   - Respects file size limits.
   - YouTube link extracts transcript.
   - Concept extraction from processed text (with mocked AI).

3. **Learner Model & Progress**
   - Mastery score updates correctly after quiz attempts.
   - Diagnostic assessment produces a valid baseline level.
   - Mastery score influences quiz difficulty selection.
   - Progress aggregation across multiple quizzes/interactions.

4. **Auth Module**
   - Email/password registration and login.
   - Guest access allows AI chat without persisting data.
   - Protected routes reject unauthenticated access.
   - Signed-in routes persist data correctly.

### Test framework
- Vitest (already in project conventions).

## Out of Scope

- **Teacher/admin roles** — the platform is learner-centric only for this release.
- **Mobile app** — web-first; mobile responsiveness is expected but no native app.
- **Paid plans / feature gating** — all features are free for now; no billing infrastructure.
- **Social/collaborative features** — no study groups, sharing, or peer interaction.
- **Spaced repetition scheduling** — backlogged; mastery tracking is the priority.
- **"Continue where you left off" prompt** — not included in MVP.
- **Adaptive difficulty engine beyond quiz** — the full adaptive content engine (adjusting all content, not just quizzes) is backlogged.
- **Content marketplace or pre-built courses** — all content is either user-supplied or AI-generated.
- **Multi-language support** — English only for MVP.

## Further Notes

- **Voice service architecture:** The faster-whisper (STT) and Piper/CosyVoice (TTS) run on a separate VPS. The Next.js app communicates with them via WebSocket for real-time voice and HTTP API for audio transcription (resource ingestion). This keeps the main web server lightweight.
- **Generative UI component library** should be designed as an extensible system — new card types can be added without changing the AI prompt structure. The AI returns a JSON array of `{ type: string, props: object }` and a React renderer maps types to components.
- **AI personality:** The coach's system prompt should encode the personality traits (encouraging, natural, adaptive tone). The user's chosen coach name should be injected into the system prompt. Tone adaptation is driven by the learner model's mastery signals.
- **Resource processing is async** — uploads return immediately with a "processing" status. The client polls or uses server-sent events to know when processing is complete.
- **Concept extraction** from resources feeds into the study guide generator. Concepts should be stored as structured data (name, description, prerequisites) to enable future features like concept graphs and prerequisite-aware sequencing.
