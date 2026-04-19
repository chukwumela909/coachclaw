# CoachClaw — Screen Map & UI/UX Definition

> Date: April 19, 2026
> Based on: PRD (docs/prd-coachclaw-mvp.md)
> Design System: DESIGN.md (Cal.com-inspired monochrome)

---

## Screens / Pages

### Public (No Auth Required)

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 1 | **Landing Page** | `/` | Product intro, value prop, CTA to sign up or try the AI coach as guest |
| 2 | **Guest AI Coach** | `/chat` | Full-screen AI chat + voice — no signup required, no data persisted |

### Auth (`(auth)` route group)

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 3 | **Sign Up** | `/signup` | Email/password registration |
| 4 | **Sign In** | `/login` | Email/password login |

### Dashboard (`(dashboard)` route group — requires auth)

| # | Screen | Route | Purpose |
|---|--------|-------|---------|
| 5 | **Dashboard Home** | `/dashboard` | Subject cards with mastery progress + persistent AI coach entry point |
| 6 | **Create Subject** | `/dashboard/subjects/new` | Form to create a new subject |
| 7 | **Subject Detail** | `/dashboard/subjects/[id]` | Topic list within a subject, mastery per topic, add topic |
| 8 | **Topic Detail** | `/dashboard/subjects/[id]/topics/[topicId]` | Resource list, study guide, quiz access, progress for this topic |
| 9 | **Upload Resources** | `/dashboard/subjects/[id]/topics/[topicId]/resources/upload` | Upload text/PDF/image/audio/link to a topic |
| 10 | **Diagnostic Assessment** | `/dashboard/subjects/[id]/topics/[topicId]/diagnostic` | Short adaptive diagnostic to assess baseline level |
| 11 | **Study Guide** | `/dashboard/subjects/[id]/topics/[topicId]/study-guide` | AI-generated learning plan with generative UI (cards, diagrams, code, math, timelines) |
| 12 | **Quiz Setup** | `/dashboard/subjects/[id]/topics/[topicId]/quiz/new` | Select resources, choose question count, start quiz |
| 13 | **Quiz Session** | `/dashboard/subjects/[id]/topics/[topicId]/quiz/[quizId]` | Active quiz — questions rendered one at a time, supports text + voice mode |
| 14 | **Quiz Results** | `/dashboard/subjects/[id]/topics/[topicId]/quiz/[quizId]/results` | Score, per-question breakdown with explanations, retake option |
| 15 | **AI Coach (Authenticated)** | `/dashboard/chat` | Full AI coach with conversation history, linked to subject/topic context |
| 16 | **AI Coach in Topic Context** | `/dashboard/subjects/[id]/topics/[topicId]/chat` | AI coach scoped to a specific topic's resources and progress |
| 17 | **Settings** | `/dashboard/settings` | Profile, coach name customization, notification preferences |

---

## User Flows

### Flow 1 — Guest (no account)
```
Landing Page → Guest AI Coach (chat/voice, no data saved)
```

### Flow 2 — New user onboarding
```
Landing Page → Sign Up → Dashboard Home → Create Subject → Create Topic
  → Upload Resources → Diagnostic Assessment → Study Guide
```

### Flow 3 — Returning user study session
```
Sign In → Dashboard Home → Subject Detail → Topic Detail
  → Study Guide / Quiz Setup → Quiz Session → Quiz Results
```

### Flow 4 — AI coaching (authenticated)
```
Dashboard Home → AI Coach (general)
  or
Topic Detail → AI Coach in Topic Context (scoped to that topic's resources)
```

### Flow 5 — Quiz loop
```
Topic Detail → Quiz Setup → Quiz Session → Quiz Results
  → (Retake → Quiz Session) or → Topic Detail
```

---

## Reusable Components (embedded, not standalone pages)

| Component | Used In | Description |
|-----------|---------|-------------|
| **Chat Interface** | Guest Coach, Dashboard Coach, Topic Coach | Message thread, input bar, voice toggle button |
| **Voice Mode Overlay** | Chat Interface | Microphone UI, waveform visualization, speaking indicator |
| **Generative UI Renderer** | Study Guide, Chat, Quiz | Dynamic card renderer — maps AI JSON to React components |
| **Resource Card** | Topic Detail | Shows resource type icon, name, processing status, extracted content preview |
| **Mastery Progress Ring** | Dashboard, Subject Detail, Topic Detail | Circular progress showing mastery % per topic |
| **Quiz Question Card** | Quiz Session, Diagnostic | Renders MCQ / fill-in / short-answer / true-false questions |
| **Subject Card** | Dashboard Home | Card with subject name, topic count, overall mastery |
| **Topic Card** | Subject Detail | Card with topic name, resource count, mastery score |

---

## Generative UI Card Types

These are the card components the AI can compose dynamically in study guides and coaching sessions:

| Card Type | Description | Used For |
|-----------|-------------|----------|
| **Explanation Card** | Rich text block with heading and body | Concept explanations |
| **Quiz Card** | Inline question with answer input | Quick checks during study |
| **Diagram/Image Card** | Renders an image or AI-generated diagram | Visual concepts |
| **Code Block** | Syntax-highlighted code | Programming topics |
| **Math Equation** | KaTeX-rendered math | STEM content |
| **Comparison Table** | Two or more columns comparing concepts | Contrasts, pros/cons |
| **Timeline** | Ordered sequence of events/steps | Historical, process topics |
| **Summary Card** | Condensed key takeaways | Chapter/section endings |
| **Flashcard** | Front/back flip card | Active recall practice |

---

## Layout Structure

### Public Pages
- Full-width layout, no sidebar
- Landing page: hero section, feature showcase, CTA
- Guest chat: full-screen chat interface

### Auth Pages
- Centered card layout on white background
- Form with email/password fields + submit button
- Link to switch between sign up / sign in

### Dashboard Pages
- **Sidebar** (left): Navigation — Dashboard, Subjects, AI Coach, Settings
- **Main content** (right): Page-specific content
- **AI Coach FAB** (floating action button): Persistent entry point to chat, bottom-right corner
- Dashboard shell wraps all `(dashboard)` routes with sidebar + header

### Mobile Behavior
- Sidebar collapses to hamburger menu
- AI Coach FAB remains visible
- Quiz cards stack vertically
- Chat interface takes full screen

---

## Screen Count Summary

| Category | Count |
|----------|-------|
| Public pages | 2 |
| Auth pages | 2 |
| Dashboard pages | 13 |
| **Total pages** | **17** |
| Reusable components | 8 |
| Generative UI card types | 9 |
