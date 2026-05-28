# Architecture & System Design

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: /app/page.tsx (landing)                      │   │
│  │         /app/audit/page.tsx (form + results)         │   │
│  │         /dashboard/* (auth-protected dashboards)     │   │
│  │         /audit/[resultId] (public shareable)         │   │
│  └──────────────────────────────────────────────────────┘   │
│           (React 19 + Tailwind CSS + Recharts)              │
└─────────────────────────────────────────────────────────────┘
           │                              │
           ▼ (POST /api/audit)     ▼ (GET /api/*)
┌──────────────────────────────────────────────────────────────┐
│                    Backend API Routes                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ POST /api/audit           (run audit engine)           │  │
│  │ GET  /api/analytics       (fetch spend data)           │  │
│  │ GET  /api/ai-insights     (call LLM for summary)       │  │
│  │ POST /api/upload          (file ingestion)             │  │
│  │ POST /api/ingestion-batches (batch status)             │  │
│  │ POST /api/auth/signup     (register user)              │  │
│  │ POST /api/auth/login      (authenticate)               │  │
│  │ GET  /api/auth/me         (verify session)             │  │
│  └────────────────────────────────────────────────────────┘  │
│     (Next.js API routes, all in src/app/api/*)              │
│           │              │              │                    │
│           ▼              ▼              ▼                    │
│  ┌──────────────────┐ ┌───────────┐ ┌──────────────────┐   │
│  │ Audit Engine     │ │Groq LLM   │ │ Database Layer   │   │
│  │ hardcoded rules  │ │API client │ │ (MongoDB+        │   │
│  │ src/lib/audit/   │ │src/lib/ai/│ │ Mongoose)        │   │
│  │ engine.ts        │ │ analyzeSpend.ts  │ src/lib/db.ts│   │
│  └──────────────────┘ └───────────┘ └──────────────────┘   │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│              MongoDB (Atlas or Local)                         │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐   │
│  │ users        │ │financial     │ │ ingestion          │   │
│  │ _id          │ │ records      │ │ batches            │   │
│  │ email        │ │ _id          │ │ _id                │   │
│  │ password     │ │ userId       │ │ userId             │   │
│  │ name         │ │ vendor       │ │ status             │   │
│  └──────────────┘ │ amount       │ │ acceptedCount      │   │
│  ┌──────────────────┐ │ category     │ │ parserConfidence   │   │
│  │ subscription     │ │ date         │ └────────────────────┘   │
│  │ signals          │ └──────────────┘                         │
│  │ _id              │                                          │
│  │ userId           │                                          │
│  │ vendor           │                                          │
│  │ pattern          │                                          │
│  └──────────────────┘                                          │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow: Complete Audit Journey

```
USER FLOW
─────────

1. LANDING
   User lands on / (marketing landing page)

2. NAVIGATE TO AUDIT
   User clicks "Start Audit" → navigates to /audit

3. FORM INPUT
   User fills form:
   - Tool selection (8 options)
   - Plan tier for each tool
   - Monthly spend (currency auto-detect)
   - Number of seats
   - Team size (1-10000)
   - Use case (coding/writing/data/research/mixed)

   Form state saved to localStorage on every onChange event

4. SUBMIT
   User clicks "Run Audit"

5. FRONTEND CALLS BACKEND
   POST /api/audit with:
   {
     "tools": [
       { "tool": "Cursor", "plan": "Pro", "monthlySpend": 40, "seats": 2 },
       { "tool": "Claude", "plan": "Pro", "monthlySpend": 20, "seats": 1 }
     ],
     "teamSize": 5,
     "useCase": "coding"
   }

6. BACKEND: AUDIT ENGINE
   ├─ Parse request payload
   ├─ For each tool, evaluate:
   │  ├─ Plan fit vs. team size
   │  ├─ Cheaper tier from same vendor
   │  ├─ Cross-tool alternatives
   │  └─ API credits opportunity
   ├─ Calculate per-tool savings
   └─ Sum total savings

   Returns structured AuditResult with recommendations

7. BACKEND: LLM SUMMARY
   ├─ Call Groq API with audit data
   ├─ Groq generates ~100-word summary
   └─ If Groq fails, use templated fallback

8. RESPONSE TO FRONTEND
   {
     "id": "abc123xyz",
     "totalMonthlySavings": 120,
     "totalAnnualSavings": 1440,
     "recommendations": [
       {
         "tool": "Cursor",
         "currentSpend": 40,
         "recommended": 20,
         "savings": 20,
         "reason": "Pro for 2 people; downgrade to Hobby"
       }
     ],
     "summary": "Your team's AI spend...",
     "timestamp": "2026-05-28T..."
   }

9. RESULTS PAGE
   Display results with:
   ├─ Hero metric (big green number: $X/month savings)
   ├─ Per-tool cards (current → recommended → savings)
   ├─ Conditional Credex CTA (if savings > $500/mo)
   ├─ Lead capture form (if savings < $100/mo)
   └─ Share buttons

10. LEAD CAPTURE (Optional)
    User enters email + optional fields
    ├─ Frontend validates with Zod
    ├─ POST to /api/lead-capture
    ├─ Backend stores in MongoDB
    └─ Sends confirmation email via Resend

11. SHARE
    User clicks "Share"
    ├─ Generates public URL: /audit/abc123xyz
    ├─ Open Graph tags auto-generate
    ├─ User shares on social media
    └─ Friends visit public audit view (no PII shown)
```

## Why We Chose This Stack

| Decision            | Alternatives Considered          | Tradeoff                                    | Why We Won                                                                         |
| ------------------- | -------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Next.js**         | SvelteKit, Remix, React SPA      | Opinionated vs flexible                     | Built-in API routes, SSR for OG tags, instant deployment on Vercel                 |
| **MongoDB**         | PostgreSQL, Firebase             | Schema flexibility vs. relational integrity | Financial records have varying structures (PDF, CSV, invoice); flexibility crucial |
| **Groq**            | OpenAI, Anthropic API, local LLM | Speed/cost vs. quality                      | 300ms latency acceptable; 70% cheaper; fallback available                          |
| **Resend**          | SendGrid, AWS SES, Mailgun       | Modern API vs. enterprise features          | Purpose-built for transactional emails; Vercel-integrated; simple pricing          |
| **Tailwind**        | Styled-components, CSS modules   | Utility-first vs. semantic CSS              | Fast iteration, mobile-first, zero runtime overhead                                |
| **React Hook Form** | Formik, React Final Form         | Lightweight vs. feature-rich                | Minimal bundle bloat; excellent validation with Zod                                |
| **Zod**             | Joi, Yup, io-ts                  | Runtime validation vs. compile-time         | Works in API routes AND frontend; TypeScript-native                                |

## Scaling to 10k Audits/Day

**Current bottlenecks**:

- Groq API rate limits (~100 req/s)
- MongoDB query performance without proper indexing
- Single Vercel instance

**Scaling plan**:

1. **Caching Layer**

   ```
   Cache audit results by (tool, plan, teamSize, useCase) combination
   TTL: 1 hour
   Expected cache hit rate: ~60% (users repeat common queries)
   Reduces Groq calls from 10k to 4k/day
   ```

2. **Async Summary Generation**

   ```
   Queue summaries with Bull/BullMQ
   Return placeholder instantly: "Your summary is generating..."
   Generate async, send via email when ready
   Result: 10k audits, but only 2k summaries/day
   ```

3. **Database Indexing**

   ```typescript
   FinancialRecord.createIndex({ userId: 1, date: -1 });
   IngestionBatch.createIndex({ userId: 1, createdAt: -1 });
   AuditResult.createIndex({ createdAt: -1 });
   ```

4. **Read Replicas**

   ```
   MongoDB Atlas: 1 primary, 2 read replicas
   Direct analytics queries to replicas
   Lead capture still hits primary
   ```

5. **Vercel Pro + Edge Functions**

   ```
   Automatic scaling to 1000+ concurrent functions
   Edge middleware for auth + rate limiting
   Separates heavy workloads (PDFKit) to dedicated functions
   ```

6. **Groq Failover**

   ```
   If Groq rate-limited, fallback to Ollama (local)
   Or batch summaries via OpenRouter
   Ensures zero audit failures even under load
   ```

7. **CDN + ISR**
   ```
   Pre-generate public audit pages at /audit/[resultId]
   Cache on Vercel edge: 1 hour
   ISR: revalidate on demand
   Saves 1000s of DB queries for share traffic
   ```

## State Management

### Frontend State

- **Form state**: localStorage (survives reload)
- **Auth state**: httpOnly cookie (JWT)
- **UI state**: React hooks (drawer, modal, loading)

### Backend State

- **Session state**: Not stored; calculated on demand
- **User data**: MongoDB (persisted)
- **Audit results**: Ephemeral; stored for sharing only

## Performance Targets

- **Audit calculation**: <200ms (hardcoded rules, no DB calls)
- **Groq LLM call**: <500ms (Groq is fast; has fallback)
- **Total response**: <1s (audit + LLM + DB writes)
- **Page load (Lighthouse)**:
  - Performance: ≥85
  - Accessibility: ≥90
  - Best Practices: ≥90

## Security Model

1. **Authentication**
   - JWT stored in httpOnly cookie
   - Refresh token stored in secure storage
   - Verify token on every protected route

2. **Lead Capture**
   - Rate limit: 5 submissions per IP per hour
   - Honeypot field: `_company_details` (catch bots)
   - Zod validation on both client + server
   - hCaptcha available (optional, currently disabled)

3. **API Keys**
   - All keys in `.env.local` (not in git)
   - Server-side only; never exposed to client
   - Rate limit on Groq calls to prevent abuse

4. **Data Privacy**
   - Public audit URLs strip email + company name
   - Users own their audit data; cannot be accessed by others
   - MongoDB connection encrypted in transit + at rest

## Error Handling & Resilience

1. **Groq API Failure**

   ```
   Try: Call Groq → generate summary
   Catch: Return templated summary
   Result: User never sees 500 error
   ```

2. **MongoDB Connection Failure**

   ```
   Try: Query database
   Catch: Return cached result or "Data unavailable"
   Log: Error to observability platform
   ```

3. **File Upload Validation**

   ```
   Try: Parse PDF/CSV/Excel
   Catch: Return rejection with reason
   Example: "Invalid file format; expected PDF"
   ```

4. **Rate Limit**
   ```
   Hit limit: Return 429 + retry-after header
   Client: Exponential backoff + user notification
   ```
