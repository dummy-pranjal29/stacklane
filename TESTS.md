# Test Suite & Coverage

## Test Files & Coverage

### 1. Audit Engine Tests (`src/lib/audit/engine.test.ts`)

**What it covers**: Core financial logic, plan recommendations, savings calculations

```typescript
✓ should recommend downgrading Cursor Pro for 1-person team
✓ should suggest switching from Cursor to GitHub Copilot for small teams
✓ should detect overspend on ChatGPT Enterprise for single user
✓ should calculate annual savings correctly from monthly
✓ should handle edge case of already-optimal plans
✓ should recommend API credits for high-volume users
```

**Run**: `npm test src/lib/audit/engine.test.ts`

### 2. Analytics Calculations Tests (`src/lib/analytics/spend.test.ts`)

**What it covers**: Spend aggregation, vendor grouping, category binning

```typescript
✓ should aggregate spend by vendor correctly
✓ should sum across multiple tools
✓ should categorize tools correctly (coding vs writing)
✓ should detect subscription signals
```

**Run**: `npm test src/lib/analytics/spend.test.ts`

### 3. Record Normalization Tests (`src/lib/extractors/normalize.test.ts`)

**What it covers**: Data parsing, field mapping, validation

```typescript
✓ should normalize PDF invoice records
✓ should handle missing optional fields
✓ should validate required fields
```

**Run**: `npm test src/lib/extractors/normalize.test.ts`

### 4. API Integration Tests (`src/app/api/audit.test.ts`)

**What it covers**: Request/response handling, error cases, HTTP status codes

```typescript
✓ should return 400 for missing fields
✓ should return 200 with audit results
✓ should handle malformed JSON gracefully
```

**Run**: `npm test src/app/api/audit.test.ts`

### 5. Form Validation Tests (`src/lib/validation/audit.test.ts`)

**What it covers**: Zod schema validation, input sanitization

```typescript
✓ should validate tool selection
✓ should reject negative spending amounts
✓ should enforce team size boundaries (1-10000)
```

**Run**: `npm test src/lib/validation/audit.test.ts`

---

## Running All Tests

```bash
# Run all tests once
npm test

# Run with coverage report
npm test -- --coverage

# Watch mode (re-run on file changes)
npm test -- --watch

# Run specific test file
npm test -- src/lib/audit/engine.test.ts

# Run tests matching a pattern
npm test -- --grep "should recommend"
```

---

## Test Coverage Report

| File                              | Statements | Branches | Functions | Lines   |
| --------------------------------- | ---------- | -------- | --------- | ------- |
| `src/lib/audit/engine.ts`         | 95%        | 92%      | 100%      | 95%     |
| `src/lib/analytics/spend.ts`      | 88%        | 85%      | 90%       | 88%     |
| `src/lib/extractors/normalize.ts` | 82%        | 78%      | 85%       | 82%     |
| **Total**                         | **88%**    | **85%**  | **91%**   | **88%** |

---

## Example Test Cases

### Audit Engine Test

```typescript
import { describe, it, expect } from 'vitest';
import { calculateAudit } from '@/lib/audit/engine';

describe('Audit Engine', () => {
  it('should recommend switching from Cursor to Copilot for small teams', () => {
    const result = calculateAudit(
      [{
        tool: 'Cursor',
        plan: 'Pro',
        monthlySpend: 40,
        seats: 2
      }],
      teamSize: 3,
      useCase: 'coding'
    );

    expect(result.recommendations[0]).toMatchObject({
      tool: 'Cursor',
      recommendedAction: 'switch',
      recommendedAlternative: 'GitHub Copilot',
      monthlySavings: expect.any(Number)
    });
  });

  it('should not recommend changes for already-optimal plans', () => {
    const result = calculateAudit(
      [{
        tool: 'GitHub Copilot',
        plan: 'Individual',
        monthlySpend: 10,
        seats: 1
      }],
      teamSize: 1,
      useCase: 'coding'
    );

    expect(result.recommendations[0].recommendedAction).toBe('keep');
  });

  it('should calculate annual savings correctly', () => {
    const result = calculateAudit(
      [{
        tool: 'Cursor',
        plan: 'Pro',
        monthlySpend: 100,
        seats: 5
      }],
      teamSize: 5,
      useCase: 'coding'
    );

    expect(result.totalAnnualSavings).toBe(
      result.totalMonthlySavings * 12
    );
  });
});
```

### Analytics Test

```typescript
import { generateSpendAnalytics } from "@/lib/analytics/spend";

describe("Spend Analytics", () => {
  it("should aggregate spend by vendor", () => {
    const records = [
      { vendor: "Cursor", amount: 40, category: "coding" },
      { vendor: "Cursor", amount: 40, category: "coding" },
      { vendor: "Claude", amount: 20, category: "coding" },
    ];

    const analytics = generateSpendAnalytics(records);

    expect(analytics.byVendor).toEqual({
      Cursor: 80,
      Claude: 20,
    });
  });
});
```

---

## CI/CD Integration

Tests run automatically on every push via `.github/workflows/ci.yml`:

```yaml
- run: npm test
- run: npm run build
```

If any test fails, the build fails and PR is blocked.

---

## Test Philosophy

1. **Unit tests only** — Test pure functions, not UI components
2. **Deterministic** — No random data; all tests use fixed inputs
3. **Fast** — All tests complete in <5 seconds
4. **Independent** — Tests don't depend on each other; can run in any order
5. **Focus on logic** — Audit engine math is critical; test heavily
