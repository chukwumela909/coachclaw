# CoachClaw — Project Guidelines

CoachClaw is an AI-guided study platform for academic learners (in-school and self-study). It helps users study smarter through AI-powered study guides, resource-based quizzes, and learning progress tracking.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **AI**: OpenAI API (or similar) for study guide generation and quiz creation
- **Auth**: NextAuth.js (Auth.js v5)
- **State**: React Server Components by default; client state only when interactivity demands it

## Architecture

```
src/
  app/              # Next.js App Router — pages, layouts, API routes
    (auth)/         # Auth-related pages (login, register)
    (dashboard)/    # Authenticated user pages
    api/            # Route handlers (REST endpoints)
  components/       # Reusable UI components
    ui/             # Primitives (Button, Input, Card, etc.)
  lib/              # Shared utilities, DB connection, AI helpers
  models/           # Mongoose schemas/models
  types/            # Shared TypeScript types/interfaces
```

- **Server Components first**: Default to RSC. Add `"use client"` only for interactivity (forms, state, effects).
- **API routes** live under `src/app/api/` — group by resource (e.g., `api/quizzes/`, `api/progress/`).
- **Database models** in `src/models/` — one file per collection (User, Quiz, StudyGuide, Progress).

## Build and Test

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run tests (Vitest)
```

## Conventions

- Use **named exports** for components and utilities. Default exports only for Next.js page/layout files.
- File naming: `kebab-case.ts` for utilities, `PascalCase.tsx` for components.
- Place API validation at the route handler level using Zod schemas.
- Keep Mongoose models lean — business logic belongs in `src/lib/` service functions, not in model methods.
- Environment variables: prefix client-exposed vars with `NEXT_PUBLIC_`. Store secrets in `.env.local` (never committed).

## Key Patterns

- **AI interactions**: Wrap all AI API calls in `src/lib/ai/` with typed request/response. Always stream long completions.
- **Quiz flow**: Generate quiz from study resource → user answers → grade & store results → update progress.
- **Progress tracking**: Store per-topic scores and streaks in the Progress collection. Surface trends on the dashboard.

## Don'ts

- Don't install Redux, Zustand, or other client state libraries unless a clear need arises.
- Don't use `any` — prefer `unknown` and narrow with type guards.
- Don't put database calls directly in components — use server actions or API routes.
