# CoachClaw Landing Page Design Audit

Date: 2026-05-12
Scope: `/`
Classifier: Marketing / landing page

## Baseline Findings

1. High impact - Mobile hero overflow
   - Evidence: `screenshots/landing-mobile-before.png`
   - The hero headline, CTA row, and nav actions exceeded the 390px viewport. This clipped the first impression and made the page feel untested on mobile.
   - Status: verified fixed.

2. High impact - First viewport lacked a visual anchor
   - Evidence: `screenshots/landing-desktop-before.png`
   - The landing page opened as a mostly blank centered text block. It explained the product, but did not visually show the learning workflow.
   - Status: verified fixed.

3. Medium impact - Brand hierarchy was too quiet
   - Evidence: `screenshots/landing-desktop-before.png`
   - CoachClaw appeared mostly as nav text. The hero did not establish the product identity before the feature promise.
   - Status: verified fixed.

4. Medium impact - Feature section used low-energy generic SaaS styling
   - Evidence: `screenshots/landing-desktop-before.png`
   - The gray section and fake UI mockup read as placeholder material. Broken checkmark glyphs also reduced polish.
   - Status: verified fixed.

## Fixes Applied

- Reworked `src/app/page.tsx` into a stronger landing composition with a full-width textured hero, product-forward copy, a study-path visual, and clearer CTAs.
- Tightened mobile behavior with explicit line breaks, standard breakpoints, capped mobile measures, and safer card widths.
- Replaced broken checkmark glyphs with `lucide-react` icons already available in the project.
- Added shared color/body-font tokens and fluid section heading sizing in `src/app/globals.css`.

## Verification

- `npm.cmd run lint`: passed with 22 pre-existing warnings outside this landing-page work.
- `npm.cmd run build`: passed.
- Final screenshots:
  - Desktop: `screenshots/landing-desktop-final-pass.png`
  - Mobile: `screenshots/landing-mobile-final-pass.png`

## Scorecard

- Brand/product unmistakable in first screen: Yes
- One strong visual anchor present: Yes
- Page understandable by scanning headlines only: Yes
- Each section has one job: Yes
- Cards necessary: Mostly yes, used as product-preview surfaces
- Motion improves hierarchy: Partial, existing hover motion only
- Premium without shadows: Mostly yes

Design score: 4/10 -> 7.5/10
AI slop score: 5/10 -> 2/10

PR summary: Design review found 4 landing-page issues, fixed 4. Design score 4 -> 7.5, AI slop score 5 -> 2.
