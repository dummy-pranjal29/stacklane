## Day 1 — 2026-05-22

**Hours worked:** 5
**What I did:** Bootstrapped the Next.js 16 environment. Set up the basic landing page layout and Tailwind CSS configuration. Sketched out the MongoDB schemas.
**What I learned:** Next.js App Router has specific caching behaviors that make building dynamic forms tricky if not handled with client components.
**Blockers / what I'm stuck on:** Figuring out the optimal way to persist the 8-tool form state without a database.
**Plan for tomorrow:** Implement localStorage for form state and build the UI for the spend input.

## Day 2 — 2026-05-23

**Hours worked:** 6
**What I did:** Built the spend input form using React Hook Form and Zod. Wired it up to localStorage so users don't lose data on refresh.
**What I learned:** Zod schemas are incredibly powerful for validating complex nested array states directly on the frontend.
**Blockers / what I'm stuck on:** Handling edge cases where users input string values instead of numbers for spend amounts.
**Plan for tomorrow:** Build the deterministic audit engine logic.

## Day 3 — 2026-05-24

**Hours worked:** 7
**What I did:** Wrote the core audit logic in `engine.ts`. Mapped out hardcoded rules based on the `PRICING_DATA.md` matrix. Added checks for plan fit and cross-tool redundancies.
**What I learned:** Organizing rules deterministically requires strict separation of concerns to avoid spaghetti code when evaluating multiple tools.
**Blockers / what I'm stuck on:** Math precision errors in JavaScript floating points when calculating annual savings.
**Plan for tomorrow:** Integrate Groq API for personalized summaries and fix floating point math.

## Day 4 — 2026-05-25

**Hours worked:** 4
**What I did:** Integrated Groq LLM API. Created a robust fallback mechanism in case the API hits rate limits or fails.
**What I learned:** Groq is blisteringly fast, but their strict rate limits necessitate immediate error boundary and fallback handling on the server side.
**Blockers / what I'm stuck on:** None currently.
**Plan for tomorrow:** Implement lead capture, Resend emails, and MongoDB storage.

## Day 5 — 2026-05-26

**Hours worked:** 6
**What I did:** Wired up MongoDB with Mongoose. Created the lead capture form that triggers conditionally based on the savings threshold. Integrated Resend for confirmation emails.
**What I learned:** Mongoose models in Next.js API routes require caching the connection across hot reloads to prevent connection pool exhaustion.
**Blockers / what I'm stuck on:** Resend domain verification took longer than expected for sandbox testing.
**Plan for tomorrow:** Build the shareable URL functionality and Open Graph tags.

## Day 6 — 2026-05-27

**Hours worked:** 3
**What I did:** Implemented dynamic route `/audit/[resultId]`. Configured `generateMetadata` for dynamic Open Graph link previews. Stripped PII from public URLs.
**What I learned:** Next.js dynamic metadata generation makes building shareable, viral loops extremely straightforward.
**Blockers / what I'm stuck on:** None.
**Plan for tomorrow:** Final testing, Lighthouse optimization, and Vercel deployment.

## Day 7 — 2026-05-28

**Hours worked:** 4
**What I did:** Wrote Vitest unit tests for the audit engine. Cleaned up code, removed console logs, generated missing documentation files.
**What I learned:** Writing tests post-implementation for deterministic logic is much easier than testing UI components.
**Blockers / what I'm stuck on:** None. Project MVP is complete.
**Plan for tomorrow:** Submit assignment.
