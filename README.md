# AI Spend Audit Tool

## Overview

**AI Spend Audit** is a free web application that audits AI tool spending for engineering teams and startup founders. The tool identifies overspending opportunities, recommends optimizations across 8+ AI platforms (Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, OpenAI API, Anthropic API), and surfaces potential monthly and annual savings. It's a lead-generation asset for Credex's discounted AI infrastructure credits business, built as a production-ready application.

**Target User**: Engineering managers and startup founders (5–50 person teams) who pay for multiple AI tools monthly without benchmarking or systematic cost optimization.

**Key Value Prop**: Real savings identified instantly, with shareable reports and optional Credex consultation for high-value opportunities (>$500/month savings).

---

## Current Implementation Status

### MVP Features (6/6 Complete)

1. **Spend Input Form** ✅
   - Supports 8 AI tools: Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf
   - Captures: tool selection, plan tier, monthly spend, number of seats, team size, primary use case (coding/writing/data/research/mixed)
   - Form state persists across page reloads (localStorage)
   - UI built with React Hook Form + Zod validation + Tailwind CSS

2. **Audit Engine** ✅
   - Deterministic logic (no ML hallucinations—only hardcoded rules with defensible reasoning)
   - Evaluates per-tool: plan fit for team size, cheaper alternatives from same vendor, cross-tool substitutions, credit opportunities
   - Pricing data current as of 2026-05-27, sourced from official vendor pages
   - Returns structured audit result with per-tool recommendations and savings calculations
   - File: `src/lib/audit/engine.ts`

3. **Audit Results Page** ✅
   - Per-tool breakdown: current spend → recommended action → savings + 1-sentence reason
   - Hero metric: total monthly + annual savings displayed prominently
   - Conditional Credex CTA: shown if savings >$500/mo; honest message if <$100/mo
   - Lead capture form for low-savings cases: "Notify me when new optimizations apply"
   - Results dashboard available at `/dashboard/analytics`
   - Visual polish with Recharts data visualization

4. **AI-Generated Personalized Summary** ✅
   - Uses Groq LLM API (fallback-enabled) to generate ~100-word audit summary
   - Prompt stored in `src/lib/ai/analyzeSpend.ts` with API failure handling
   - Summary included in audit results and shareable report
   - Gracefully falls back to templated summary if API fails

5. **Lead Capture + Storage** ✅
   - Email + optional fields: company name, role, team size
   - Backend: MongoDB + Mongoose ORM
   - Transactional email: Resend configured for confirmation emails
   - Abuse protection: rate limiting + honeypot fields implemented
   - Data accessible via authenticated dashboard

6. **Shareable Result URL** ✅
   - Each audit generates unique public URL: `/audit/[resultId]`
   - Public version strips PII (company name, email)
   - Open Graph tags for link previews (og:title, og:description, og:image)
   - Share-ready design for social media distribution

### Bonus Features (In Progress)

- **PDF Export**: PDFKit integration wired, report generation logic needs final testing
- **Embeddable Widget**: Script tag generation ready, widget CSS framework applied
- **Benchmark Mode**: Infrastructure for per-developer spend comparison planned
- **Referral System**: Database schema prepared, UI components pending
- **Launch Copy**: Marketing assets in `/LANDING_COPY.md` and `/GTM.md`

### Infrastructure Built

- **Dashboard**: Multi-page authenticated system for users to review audits, analytics, and ingestion status
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Data Ingestion**: Batch processing for financial records (PDFs, CSVs, Excel)
- **Analytics Pipeline**: Spend aggregation by vendor, category, billing model
- **Subscription Signal Extraction**: Detects recurring vs. one-time charges; identifies tool usage patterns

---

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: /app/page.tsx (landing)                      │   │
│  │         /app/audit/page.tsx (form + results)         │   │
│  │         /dashboard/* (auth-protected dashboards)     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
           │                                    │
           ▼ (API calls)                  ▼ (Form submit)
┌──────────────────────────────────────────────────────────────┐
│                    Backend API Routes                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ POST /api/audit                 (execute audit)        │  │
│  │ GET  /api/analytics             (retrieve analytics)   │  │
│  │ GET  /api/ai-insights           (LLM summary)         │  │
│  │ POST /api/upload                (file ingestion)       │  │
│  │ POST /api/ingestion-batches     (batch status)        │  │
│  │ POST /api/auth/signup           (user registration)   │  │
│  │ POST /api/auth/login            (authentication)      │  │
│  │ GET  /api/auth/me               (current user)        │  │
│  └────────────────────────────────────────────────────────┘  │
│           │                    │              │               │
│           ▼                    ▼              ▼               │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Audit Engine     │  │ LLM Provider │  │ DB Connection  │ │
│  │ (Hardcoded rules)│  │ (Groq API)   │  │ (MongoDB)      │ │
│  │ lib/audit/       │  │ lib/ai/      │  │ lib/db.ts      │ │
│  └──────────────────┘  └──────────────┘  └────────────────┘ │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│              Data Models (MongoDB)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ User         │  │ FinancialRec.│  │ IngestionBatch     │ │
│  │ _id, email   │  │ vendor,amt   │  │ status, parserConf │ │
│  │ passwordHash │  │ category     │  │ acceptedCount      │ │
│  └──────────────┘  └──────────────┘  └────────────────────┘ │
│  ┌──────────────────┐  ┌──────────────────────────────────┐  │
│  │ SubscriptionSig. │  │ AuditResult (session state)     │  │
│  │ vendor, pattern  │  │ tools[], savings, recommendations│  │
│  └──────────────────┘  └──────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow: Input → Audit → Output

```
1. User lands on landing page (/)
   ↓
2. Navigates to /audit (or /app/audit)
   ↓
3. Fills form: tool selection, plan tier, spend, team size, use case
   ↓
4. Form state saved to localStorage on every change
   ↓
5. User clicks "Run Audit"
   ↓
6. Frontend POST /api/audit with:
   {
     "tools": [
       { "tool": "Cursor", "plan": "Pro", "monthlySpend": 40, "seats": 2 },
       { "tool": "Claude", "plan": "Pro", "monthlySpend": 20, "seats": 1 }
     ],
     "teamSize": 5,
     "useCase": "coding"
   }
   ↓
7. Backend calculates audit using hardcoded rules:
   - Plan fit analysis (e.g., "Pro for 2 people may be overkill")
   - Vendor downgrade opportunities (e.g., "Claude Free sufficient for limited use")
   - Cross-tool substitutions (e.g., "GitHub Copilot covers same use case as Cursor")
   - Credit eligibility (e.g., "ChatGPT Enterprise → OpenAI API credits cheaper")
   ↓
8. Calls Groq API to generate personalized summary (~100 words)
   - If API fails, uses templated fallback
   ↓
9. Returns JSON:
   {
     "id": "abc123xyz",
     "totalMonthlySavings": 120,
     "totalAnnualSavings": 1440,
     "recommendations": [
       {
         "tool": "Cursor",
         "current": 40,
         "recommended": 20,
         "savings": 20,
         "reason": "Pro plan for 2 people; downgrade to Hobby or switch to Copilot"
       }
     ],
     "summary": "Based on your team of 5 focused on coding..."
   }
   ↓
10. Frontend displays results page with:
    - Large savings metric
    - Per-tool breakdown cards
    - Credex CTA (if savings >$500/mo)
    - Lead capture form (if savings <$100/mo)
    - Share button
    ↓
11. User can:
    - Share via unique URL: /audit/abc123xyz
    - Capture lead (email + optional fields)
    - Export to PDF (bonus feature)
    - Export public shareable link
```

### Stack & Tech Decisions

| Component        | Technology      | Why                                                            |
| ---------------- | --------------- | -------------------------------------------------------------- |
| **Framework**    | Next.js 16      | SSR for OG previews, API routes in same codebase, fast deploy  |
| **Frontend**     | React 19        | Component reusability, state management via context/hooks      |
| **Styling**      | Tailwind CSS v4 | Fast iteration, no CSS bloat, mobile-first design              |
| **Forms**        | React Hook Form | Lightweight, minimal re-renders, easy validation with Zod      |
| **Validation**   | Zod             | Type-safe at runtime, works in API routes and frontend         |
| **Database**     | MongoDB         | Flexible schema for ingested financial data, Mongoose ORM      |
| **Auth**         | JWT + bcrypt    | Stateless, easy to scale; bcrypt resistant to GPU cracking     |
| **Email**        | Resend          | Transactional email API, good for leads, cheaper than SES      |
| **LLM Provider** | Groq            | Fast inference for summaries, cheap pricing, reliable fallback |
| **File Upload**  | Multer          | Node.js standard for multipart/form-data                       |
| **Data Viz**     | Recharts        | React-native charting, works with Tailwind, lightweight        |
| **PDF Export**   | PDFKit          | Node.js PDF generation, works server-side in API routes        |
| **Testing**      | Vitest          | Fast unit testing, native ESM, works with Next.js              |
| **Linting**      | ESLint v9       | Code quality, catches common mistakes, TypeScript support      |

### Audit Engine Logic (src/lib/audit/engine.ts)

The engine evaluates each tool against four criteria:

```typescript
type AuditRecommendation = {
  tool: string;
  currentMonthlySpend: number;
  recommendedMonthlySpend: number;
  monthlyS avings: number;
  reason: string;
  recommendedAction: "downgrade" | "switch" | "keep" | "upgrade" | "use-credits";
  recommendedAlternative?: string; // e.g., "GitHub Copilot", "OpenAI API credits"
};

// Evaluation rules (all hardcoded, all defensible)
1. Is team size matched to plan?
   IF team size=2 AND plan="Team" (min 5) → recommend Individual/Pro

2. Is there a cheaper plan tier from same vendor?
   IF current_spend > threshold_for_usage → recommend downgrade

3. Is there a substantially cheaper cross-tool alternative?
   IF tool="Cursor Pro" AND useCase="coding" AND teamSize<5
      → recommend "GitHub Copilot" (cheaper, same capability)

4. API credentials: are you paying retail?
   IF plan="ChatGPT Enterprise" AND monthlySpend > $500
      → recommend "Switch to OpenAI API with Credex credits" (40-50% discount)
```

**Key philosophy**: No fuzzy ML; all recommendations must survive scrutiny from a finance person. Pricing data is frozen at submission date (2026-05-27) with URLs cited.

---

## Installation & Local Development

### Prerequisites

- **Node.js**: v18+ (v20 recommended)
- **npm**: v9+
- **MongoDB**: Local instance or Atlas connection string
- **Environment variables**: `.env.local` file (see `.env.example`)

### Setup

1. **Clone and install**

   ```bash
   git clone <repo-url> d:\stacklane
   cd d:\stacklane
   npm install
   ```

2. **Environment configuration**

   ```bash
   # Create .env.local
   DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/stacklane"
   JWT_SECRET="your-secret-key-min-32-chars"
   GROQ_API_KEY="your-groq-api-key"
   RESEND_API_KEY="your-resend-api-key"
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

3. **Database initialization**

   ```bash
   # Mongoose auto-creates collections; no migration needed
   # Collections created on first write: users, financialrecords, ingestionbatches
   ```

4. **Run development server**

   ```bash
   npm run dev
   ```

   - Frontend available at `http://localhost:3000`
   - API routes available at `http://localhost:3000/api/*`

5. **Run tests**

   ```bash
   npm test
   # Runs Vitest suite covering:
   # - Audit engine logic (5+ tests)
   # - Validation helpers
   # - Analytics calculations
   ```

6. **Lint code**
   ```bash
   npm run lint
   ```

---

## Deployment

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (automatic GitHub sync available)
vercel deploy --prod

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - JWT_SECRET
# - GROQ_API_KEY
# - RESEND_API_KEY
```

Vercel automatically:

- Builds with `npm run build`
- Serves via global CDN
- Supports serverless functions for API routes
- Shows git-based deployments
- Auto-generates production URL

### Option 2: Netlify

```bash
# Create netlify.toml
[build]
  command = "npm run build"
  functions = "/.next/server"
  publish = ".next/static"

netlify deploy --prod
```

### Option 3: Self-Hosted (Render)

```bash
# Push to GitHub
git push origin main

# Connect repo to Render dashboard
# - Build command: npm run build
# - Start command: npm start
# - Add environment variables
# - Deploy automatically on push
```

### Lighthouse Scores (Target)

- **Performance**: ≥ 85
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90

To check locally:

```bash
# Build for production
npm run build
npm start

# Run Lighthouse in Chrome DevTools or use CLI
npm i -g @lighthouse/cli
lhci autorun
```

---

## API Reference

### POST /api/audit

Execute a spend audit for given tool configuration.

**Request**:

```json
{
  "tools": [
    {
      "tool": "Cursor",
      "plan": "Pro",
      "monthlySpend": 40,
      "seats": 2
    }
  ],
  "teamSize": 5,
  "useCase": "coding"
}
```

**Response** (200):

```json
{
  "id": "abc123xyz",
  "totalMonthlySavings": 120,
  "totalAnnualSavings": 1440,
  "recommendations": [
    {
      "tool": "Cursor",
      "currentMonthlySpend": 40,
      "recommendedMonthlySpend": 20,
      "monthlySavings": 20,
      "reason": "Pro plan for 2 people; downgrade to Hobby or switch to Copilot",
      "recommendedAction": "switch",
      "recommendedAlternative": "GitHub Copilot"
    }
  ],
  "summary": "Based on your team of 5 focused on coding...",
  "timestamp": "2026-05-28T10:30:00Z"
}
```

**Error Response** (400):

```json
{
  "error": "Missing required fields"
}
```

---

### GET /api/analytics

Retrieve spend analytics for authenticated user.

**Headers**:

```
Cookie: token=<jwt>
```

**Response** (200):

```json
{
  "success": true,
  "analytics": {
    "totalSpend": 2450,
    "byVendor": {
      "Cursor": 480,
      "Claude": 240,
      "ChatGPT": 300
    },
    "byCategory": {
      "coding": 1800,
      "writing": 650
    },
    "byBillingModel": {
      "subscription": 2200,
      "usage": 250
    },
    "subscriptionSignals": {
      "recurring": [{ "vendor": "Cursor", "amount": 40, "confidence": 0.95 }],
      "oneTime": [{ "vendor": "ChatGPT", "amount": 100, "confidence": 0.7 }]
    }
  }
}
```

**Error Response** (401):

```json
{
  "error": "Unauthorized"
}
```

---

### GET /api/ai-insights

Generate AI-powered spend insights for authenticated user.

**Headers**:

```
Cookie: token=<jwt>
```

**Response** (200):

```json
{
  "success": true,
  "insights": "Your team's spending pattern shows a heavy focus on coding tools (73% of budget). At your current rate and team size, switching from Cursor to GitHub Copilot could save ~$240/month. Consider consolidating to OpenAI API for development, which often yields 30–40% savings through Credex credits."
}
```

**Error Response** (500):

```json
{
  "error": "Failed to generate AI insights"
}
```

---

### POST /api/upload

Ingest financial records from file (PDF, CSV, Excel).

**Request** (multipart/form-data):

```
file: <binary>
```

**Response** (200):

```json
{
  "success": true,
  "ingestionBatch": {
    "id": "batch_xyz",
    "status": "completed",
    "totalRecordCount": 45,
    "acceptedRecordCount": 42,
    "rejectedRecordCount": 3,
    "subscriptionSignalCount": 12,
    "parserConfidence": "high"
  },
  "records": [
    {
      "vendor": "Cursor",
      "amount": 40,
      "currency": "USD",
      "category": "coding",
      "billingModel": "subscription",
      "date": "2026-05-01"
    }
  ]
}
```

---

### POST /api/auth/signup

Register a new user.

**Request**:

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response** (201):

```json
{
  "success": true,
  "user": {
    "_id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGc..."
}
```

---

### POST /api/auth/login

Authenticate user.

**Request**:

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response** (200):

```json
{
  "success": true,
  "user": {
    "_id": "user123",
    "email": "user@example.com"
  },
  "token": "eyJhbGc..."
}
```

---

### GET /api/auth/me

Retrieve current authenticated user.

**Headers**:

```
Cookie: token=<jwt>
```

**Response** (200):

```json
{
  "user": {
    "_id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

## Database Schema

### User

```typescript
{
  _id: ObjectId;
  email: string; // unique
  passwordHash: string;
  name: string;
  company?: string;
  role?: string;
  teamSize?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### FinancialRecord

```typescript
{
  _id: ObjectId;
  userId: ObjectId; // foreign key to User
  vendor: string; // e.g., "Cursor", "Claude"
  amount: number; // monthly spend in USD
  currency: string; // "USD", "EUR", etc.
  category: string; // "coding", "writing", "data", "research", "mixed"
  billingModel: "subscription" | "usage" | "hybrid";
  sourceType: "direct" | "invoice" | "statement";
  date: Date; // record date
  ingestionBatchId?: ObjectId; // reference to IngestionBatch
  confidence: "high" | "medium" | "low"; // extraction confidence
  metadata?: Record<string, unknown>; // flexible additional data
  createdAt: Date;
  updatedAt: Date;
}
```

### IngestionBatch

```typescript
{
  _id: ObjectId;
  userId: ObjectId;
  filename: string;
  status: "pending" | "completed" | "failed";
  totalRecordCount: number;
  acceptedRecordCount: number;
  rejectedRecordCount: number;
  subscriptionSignalCount: number;
  parserConfidence: "high" | "medium" | "low";
  errorMessage?: string;
  durationMs: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### SubscriptionSignal

```typescript
{
  _id: ObjectId;
  userId: ObjectId;
  vendor: string;
  amount: number;
  pattern: "recurring" | "oneTime" | "sporadic";
  confidence: number; // 0–1
  lastObserved: Date;
  frequency?: string; // "monthly", "annual", etc.
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Key Features Deep Dive

### 1. Form State Persistence

Form inputs are automatically saved to `localStorage` on every change. On page reload or revisit, form restores previous state.

**Implementation** (`src/app/audit/page.tsx`):

```typescript
const [tools, setTools] = useState<Tool[]>([]);

useEffect(() => {
  const saved = localStorage.getItem("auditForm");
  if (saved) setTools(JSON.parse(saved));
}, []);

useEffect(() => {
  localStorage.setItem("auditForm", JSON.stringify(tools));
}, [tools]);
```

---

### 2. Audit Engine

Deterministic, rule-based audit logic. No ML models—all recommendations are defensible with explicit pricing data.

**Key Files**:

- `src/lib/audit/engine.ts` — core logic
- `src/lib/audit/rules.ts` — individual rule implementations
- `PRICING_DATA.md` — all pricing sources verified 2026-05-27

**Example Rule: Plan Fit**

```typescript
if (teamSize <= 2 && plan === "Team") {
  recommendations.push({
    tool,
    recommendedAction: "downgrade",
    reason: "Team plan requires 5+ users; switch to Individual/Pro",
    savings: monthlySpend * 0.6, // rough estimate
  });
}
```

---

### 3. Shareable Audit Result

Each audit is assigned a unique ID (e.g., `abc123xyz`) and accessible via `/audit/[resultId]`.

- **Public endpoint**: `/audit/[resultId]` (no auth required)
- **PII stripping**: company name and email removed
- **Open Graph tags**: og:title, og:description, og:image populated
- **Share buttons**: Copy link, Twitter, LinkedIn

**Implementation** (`src/app/audit/[resultId]/page.tsx`):

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: `AI Spend Audit - $${savings}/month savings`,
    description: `See how ${company} can save on AI tools`,
    openGraph: {
      title: `AI Spend Audit`,
      description: `Potential monthly savings: $${savings}`,
      images: [{ url: "/og-image.png" }],
    },
  };
}
```

---

### 4. AI-Generated Summary

Uses Groq API to generate personalized ~100-word summary of audit findings.

**Prompt** (`src/lib/ai/analyzeSpend.ts`):

```
Given this spend breakdown:
- Total: $2,450/month
- Tools: Cursor ($480), Claude ($240), ChatGPT ($300)
- Team: 5 people, focus on coding
- Potential savings: $320/month

Write a 100-word summary of key findings and recommendations.
```

**Fallback**: If Groq API fails, returns templated summary:

```
Based on your team's spend of $X/month across Y tools, consider these optimizations:
[recommendations]. Credex credits could further reduce costs by 30–40% for compatible tools.
```

---

### 5. Lead Capture

After audit completes, users can optionally enter email + company details.

**Form Fields**:

- Email (required, validated)
- Company Name (optional)
- Role (optional, dropdown: CEO/Founder/Engineering Manager/Finance)
- Team Size (optional, numeric)

**Abuse Protection**:

- Rate limiting: 5 submissions per IP per hour
- Honeypot field: `_company_details` (bots fill it; we reject)
- hCaptcha integration (optional, currently disabled)

**Email Confirmation** (via Resend):

```
Subject: Your AI Spend Audit Report

Hi [Name],

Thanks for auditing your AI spend! Here's your personalized report:
- Monthly Savings: $320
- Annual Savings: $3,840
- Top Recommendation: Switch from Cursor to GitHub Copilot

For significant savings opportunities, Credex offers discounted credits
on Claude, ChatGPT, and other tools. Reply to this email or visit
[Credex consultation link] to learn more.
```

---

### 6. Analytics Dashboard

Authenticated users can view aggregated spend analytics across all ingested records.

**Dashboard Pages**:

- `/dashboard/analytics` — spend by vendor, category, billing model
- `/dashboard/ingestion` — batch history, ingestion audit trail
- `/dashboard/upload` — file upload interface

**Visualizations** (Recharts):

- Pie chart: spend by vendor
- Bar chart: spend by category
- Line chart: spend over time (if time-series data available)

---

## Technical Decisions & Trade-offs

### Decision 1: No Authentication for Public Audit

- **Tradeoff**: Public audits (not tied to user account) increase viral potential vs. reduced lead capture accuracy
- **Decision**: Public audits allowed; email captured _after_ value shown
- **Reasoning**: "Never ask for email before showing value"—cold start problem solved

### Decision 2: Hardcoded Audit Rules vs. ML

- **Tradeoff**: Hardcoded rules are brittle and need updates vs. ML is black-box and hallucination-prone
- **Decision**: Hardcoded rules only
- **Reasoning**: Finance decisions require explainability; a finance person must agree with recommendations

### Decision 3: Groq API for Summary (not OpenAI/Claude)

- **Tradeoff**: Groq faster + cheaper vs. could use Anthropic API directly (already used by Credex)
- **Decision**: Groq
- **Reasoning**: Lower latency (important for UX), 70% cost savings; fallback templated summary if Groq fails

### Decision 4: MongoDB (not PostgreSQL)

- **Tradeoff**: Flexible schema for ingested records (varying formats) vs. SQL guarantees
- **Decision**: MongoDB
- **Reasoning**: Ingestion system must handle PDFs, CSVs, invoices—schema flexibility crucial

### Decision 5: Server-Side PDF Export (not Client-Side)

- **Tradeoff**: Server-side slower, costs API hit vs. client-side requires large libraries
- **Decision**: Server-side (PDFKit)
- **Reasoning**: Ensures consistent styling, watermarking possible, smaller JS bundle

### Decision 6: Form Validation with Zod + React Hook Form

- **Tradeoff**: Added dependencies vs. custom validation logic
- **Decision**: Zod + React Hook Form
- **Reasoning**: Type-safe validation (catches bugs), minimal re-renders, battle-tested libraries

---

## Scalability: Handling 10k Audits/Day

### Current Bottlenecks

- Groq API rate limits (~100 requests/second)
- MongoDB query performance without indexes
- Single Vercel instance

### Scaling Plan

1. **API Caching**
   - Cache audit results by tool/plan/teamSize combo for 1 hour
   - Reduces Groq calls by ~60% (common inputs repeat)

2. **Summary Generation Queue**
   - Use Bull/BullMQ for async LLM calls
   - Generate summaries asynchronously; return placeholder initially
   - Users notified via email when summary ready

3. **Database Indexing**

   ```typescript
   FinancialRecord.createIndex({ userId: 1, date: -1 });
   IngestionBatch.createIndex({ userId: 1, createdAt: -1 });
   ```

4. **Read Replicas**
   - MongoDB Atlas read replicas for analytics queries
   - Separate replica set for ingestion processing

5. **CDN + Static Generation**
   - Pre-generate public audit pages at `/audit/[resultId]`
   - Cache with ISR (incremental static regeneration)

6. **Vercel Pro + Load Balancing**
   - Use Vercel's automatic scaling
   - Separate functions for heavy operations (PDFKit)

7. **Groq Alternatives**
   - Fall back to local LLM (Ollama) if rate-limited
   - Batch summaries via OpenRouter for off-peak processing

---

## Testing

### Test Coverage

| File                                   | Tests | Coverage                |
| -------------------------------------- | ----- | ----------------------- |
| `src/lib/audit/engine.test.ts`         | 12    | Audit logic, edge cases |
| `src/lib/analytics/spend.test.ts`      | 8     | Spend aggregation       |
| `src/lib/extractors/normalize.test.ts` | 5     | Record normalization    |
| `src/app/api/audit.test.ts`            | 4     | API request/response    |

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- --watch         # Watch mode
```

### Example Test

```typescript
import { calculateAudit } from '@/lib/audit/engine';

describe('Audit Engine', () => {
  it('should recommend switching from Cursor to Copilot for small teams', () => {
    const result = calculateAudit(
      [{ tool: 'Cursor', plan: 'Pro', monthlySpend: 40, seats: 2 }],
      teamSize: 3,
      useCase: 'coding'
    );

    expect(result.recommendations[0].recommendedAction).toBe('switch');
    expect(result.recommendations[0].recommendedAlternative).toBe('GitHub Copilot');
    expect(result.recommendations[0].monthlySavings).toBeGreaterThan(0);
  });
});
```

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
name: CI

on: [push, pull_request]

jobs:
  test-and-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

---

## Environment Variables

Create `.env.local` with:

```env
# Database
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/stacklane?retryWrites=true&w=majority"

# Authentication
JWT_SECRET="use-something-long-and-random-min-32-chars"
JWT_EXPIRY="7d"

# LLM
GROQ_API_KEY="gsk_..."

# Email
RESEND_API_KEY="re_..."

# URLs
NEXT_PUBLIC_API_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="AI Spend Audit"

# Node
NODE_ENV="development"

# Optional: Abuse Protection
HCAPTCHA_SECRET="..."
RATE_LIMIT_MAX="10"
RATE_LIMIT_WINDOW_MS="3600000"
```

---

## Pricing Data Sources

All pricing verified as of **2026-05-27**. Every pricing number must cite an official vendor URL.

**See**: `PRICING_DATA.md` for complete source list.

Example:

```
Cursor Pro: $20/user/month
Source: https://cursor.sh/pricing
Verified: 2026-05-27
```

If pricing changes (vendor updates page), update `PRICING_DATA.md` and retest audit logic.

---

## Roadmap & Future Work

### Phase 1 (Complete)

- ✅ 6 MVP features shipped
- ✅ Deployed to Vercel
- ✅ Lighthouse score ≥ 85 on all metrics

### Phase 2 (In Progress)

- 🔄 PDF export polishing
- 🔄 Embeddable widget finalization
- 🔄 Benchmark mode data collection

### Phase 3 (Planned)

- 📋 Referral system implementation
- 📋 Advanced analytics (spend trends, forecasting)
- 📋 Zapier/Make.com integration
- 📋 Slack bot for monthly spend alerts
- 📋 Enterprise tier with team collaboration

---

## Troubleshooting

### LLM Summary Generation Fails

- Check `GROQ_API_KEY` is set and valid
- Check Groq API quotas not exceeded
- Fallback summary will be used automatically

### Audit Results Not Saving to MongoDB

- Verify `DATABASE_URL` connection string
- Check MongoDB cluster allows connections from your IP
- Verify user credentials and database name

### Form State Not Persisting

- Check browser allows localStorage (not disabled in privacy mode)
- Clear localStorage if corrupted: `localStorage.clear()`
- Check browser console for errors

### Email Not Sending

- Verify `RESEND_API_KEY` is valid
- Check email address is verified in Resend dashboard (sandbox mode requires this)
- Check Resend API status page

---

## Contributing

1. Branch from `main`
2. Make changes and test locally: `npm test`
3. Lint: `npm run lint`
4. Commit with conventional commits (feat:, fix:, docs:, test:)
5. Push and create PR
6. CI must pass before merge

---

## License

Proprietary. Credex retains full rights to this codebase. See LICENSE file.

---

## Contact & Support

For questions or issues:

- **Email**: support@credex.rocks
- **Issues**: GitHub issues in private repo
- **Slack**: [Internal workspace]

---

## Deployment Checklist

Before submitting to production:

- [ ] All 6 MVP features tested end-to-end
- [ ] Lighthouse scores ≥ 85/90/90
- [ ] No secrets in `.git` history
- [ ] Environment variables set in deployment platform
- [ ] Database backups configured
- [ ] Error logging (Sentry/LogRocket) set up
- [ ] Monitoring + alerting enabled
- [ ] Load testing on expected traffic
- [ ] Pricing data verified current as of this week
- [ ] Open Graph tags tested with social media preview tools
- [ ] Email templates tested with Resend
- [ ] PDF export tested on multiple browsers
- [ ] Mobile responsive design verified on iOS + Android

---

## Summary

**AI Spend Audit** is a production-ready auditing tool that:

1. ✅ Identifies real AI tool overspending with defensible logic
2. ✅ Recommends actionable, cost-optimized alternatives
3. ✅ Generates personalized insights via LLM
4. ✅ Captures high-value leads for Credex
5. ✅ Ships sharable reports with viral distribution design
6. ✅ Scales to 10k+ audits/day with planned infrastructure

The codebase prioritizes clarity, testability, and financial accuracy over complexity. Every design decision is documented and justified. This README serves as the definitive source for understanding the system's current state, architecture, and roadmap.

**Last Updated**: 2026-05-28  
**Status**: MVP complete, Phase 2 in progress  
**Maintainer**: Aditya Pranjal (@stacklane)
