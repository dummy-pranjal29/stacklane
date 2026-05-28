1. **Hardest bug this week**
   The hardest bug was dealing with Next.js App Router aggressively caching the Groq API summary responses. When users updated their form inputs and re-ran the audit, they were receiving the exact same text summary. I hypothesized it was a state issue, tested it by logging the payload pre-fetch, and realized the fetch call was being statically cached by Vercel. I solved it by explicitly adding `export const dynamic = "force-dynamic"` to the API route and utilizing `revalidate: 0`.

2. **Decision you reversed mid-week**
   I initially planned to save every single form keystroke directly to MongoDB to capture partial leads. I quickly realized this would hammer the database and create thousands of junk records. I reversed course and implemented `localStorage` for the active session, only pushing to MongoDB when the user explicitly finalized the audit or opted into the lead capture.

3. **What you'd build in week 2**
   Assuming the MVP works and validates the core assumption, I would immediately prioritize a Benchmark Mode. Engineering managers want to know not just how to save, but how their spend compares to similar-sized companies. I would aggregate anonymized database records to show percentiles (e.g., "You spend more on AI per developer than 80% of Series A startups").

4. **How you used AI tools**
   I used Claude 3.5 Sonnet to rapidly generate Tailwind CSS class structures for the dashboard UI and Recharts boilerplate. I did not trust the AI with the actual financial math inside the `engine.ts` file. At one point, I asked an AI to write a rule for GitHub Copilot pricing, and it hallucinated a non-existent $15/month tier. I caught it by strictly verifying against the official pricing URLs, which reinforced my decision to use hardcoded, deterministic rules over LLMs for the core logic.

5. **Self-rating (1–10 for each)**

- **Discipline: 9** — Stuck strictly to the MVP scope and didn't get distracted by shiny features.
- **Code quality: 8** — Clean, modular, and type-safe, though test coverage could be expanded beyond the core engine.
- **Design sense: 8** — Utilitarian and focused on the data; exactly what finance/engineering leaders prefer.
- **Problem-solving: 9** — Effectively navigated API rate limits, database connections, and state persistence.
- **Entrepreneurial thinking: 9** — Built a clear, defensible path to generating actual leads for Credex's core business.
