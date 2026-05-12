# CoachClaw Dashboard Design Audit

Date: 2026-05-12
Scope: `/dashboard`
Classifier: App UI

## Baseline Findings

1. High impact - Mobile overflow on the dashboard home
   - Evidence: `screenshots/dashboard-mobile-before.png`
   - The oversized title, CTA, subject cards, and progress rings pushed past the 390px viewport.
   - Status: verified fixed in `screenshots/dashboard-mobile-pass.png`.

2. High impact - Dashboard used a marketing-scale hero
   - Evidence: `screenshots/dashboard-desktop-before.png`
   - `Your Mastery` was visually louder than the work area. App UI should prioritize scanning and task continuation.
   - Status: verified fixed.

3. Medium impact - Subject cards created a sparse card mosaic
   - Evidence: `screenshots/dashboard-desktop-before.png`
   - The grid consumed space without improving comparison. A list is denser, easier to scan, and better for repeated use.
   - Status: verified fixed.

4. Medium impact - Weak workspace hierarchy
   - Evidence: `screenshots/dashboard-desktop-before.png`
   - There was no summary layer between page title and subject cards, so the dashboard did not orient the learner quickly.
   - Status: verified fixed.

## Fixes Applied

- Extracted the authenticated dashboard shell into `DashboardShell` so layout styling can be shared and reviewed cleanly.
- Extracted the dashboard home into `DashboardOverview`, preserving the real data flow from `/dashboard`.
- Reworked the dashboard to use a compact app header, three summary metrics, and a subject list with progress affordances.
- Tightened mobile layout with an explicit mobile content measure and smaller floating coach button.
- Removed the temporary screenshot preview route after verification.

## Verification

- `npm.cmd run lint`: passed with 22 pre-existing warnings outside this dashboard work.
- `npm.cmd run build`: passed.
- Final screenshots:
  - Desktop: `screenshots/dashboard-desktop-pass.png`
  - Mobile: `screenshots/dashboard-mobile-pass.png`

## Scorecard

- Calm surface hierarchy: Yes
- Dense but readable: Yes
- Navigation, workspace, and secondary context separated: Yes
- Cards used only where useful: Mostly yes
- Decorative gradients avoided: Yes
- Mobile layout designed rather than stacked accidentally: Yes

Design score: 4.5/10 -> 7.5/10
AI slop score: 4/10 -> 2/10

PR summary: Design review found 4 dashboard issues, fixed 4. Design score 4.5 -> 7.5, AI slop score 4 -> 2.
