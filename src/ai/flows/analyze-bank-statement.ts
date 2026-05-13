'use server';

/**
 * @fileOverview AI flow that analyses a bank statement and surfaces:
 *   1. Categorized spending (Housing / Food / Subscriptions / Transport / etc.)
 *   2. The TOP money drains (subscriptions, fees, lifestyle creep)
 *   3. Anomalies & duplicate charges
 *   4. Concrete, dollarized "get-back-on-track" recommendations
 *   5. Per-merchant breakdown
 *
 * Accepts either:
 *   - statementText: parsed text from a PDF / pasted statement
 *   - csvData: raw CSV rows
 * The model is instructed to be conservative, transparent about uncertainty,
 * and to NEVER fabricate transactions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const AnalyzeBankStatementInputSchema = z.object({
  statementText: z.string().describe('The raw text content of a bank statement (PDF text-extract or pasted statement).').optional(),
  csvData: z.string().describe('CSV-formatted transactions: date,description,amount[,balance]').optional(),
  monthlyIncome: z.number().describe('User-stated monthly net income in the display currency.').optional(),
  displayCurrency: z.string().default('USD'),
  monthsCovered: z.number().describe('How many months of data this statement covers (best-effort).').optional(),
  userGoals: z.string().describe('Free-text describing user goals (e.g. "build 2-year emergency fund", "pay off car loan").').optional(),
});
export type AnalyzeBankStatementInput = z.infer<typeof AnalyzeBankStatementInputSchema>;

// NOTE: Gemini's structured-output engine has a hard limit on schema
// "constraint state" — nested objects + enums + bounded arrays combine
// multiplicatively and can exceed that limit. We therefore keep the
// schema FLAT, AVOID `.min()/.max()`, AVOID enum unions, AVOID `.default()`,
// and move all limits / allowed values into the prompt instructions.

const CategoryBreakdownSchema = z.object({
  category: z.string(),
  totalSpent: z.number(),
  pctOfSpend: z.number(),
  transactionCount: z.number(),
  topMerchants: z.array(z.string()),
  trend: z.string().describe('One of: rising | stable | declining | unknown.'),
});

const DrainSchema = z.object({
  label: z.string().describe('Short human label for the drain, e.g. "Unused streaming subscriptions"'),
  monthlyCost: z.number(),
  annualizedCost: z.number(),
  severity: z.string().describe('One of: low | medium | high | critical.'),
  evidence: z.string(),
  fixAction: z.string().describe('A 1-sentence imperative action, e.g. "Cancel X, save $Y/mo".'),
});

const AnomalySchema = z.object({
  type: z.string().describe('One of: duplicate-charge | overdraft-fee | unrecognized-merchant | subscription-renewal | large-outlier | cash-withdrawal-spike.'),
  description: z.string(),
  amount: z.number(),
  date: z.string(),
});

const AnalyzeBankStatementOutputSchema = z.object({
  summary: z.string(),
  totalIncome: z.number(),
  totalSpend: z.number(),
  netCashFlow: z.number(),
  savingsRatePct: z.number(),
  topCategories: z.array(CategoryBreakdownSchema),
  topDrains: z.array(DrainSchema),
  anomalies: z.array(AnomalySchema),
  recommendations: z.array(z.string()),
  emergencyImpact: z.string(),
});
export type AnalyzeBankStatementOutput = z.infer<typeof AnalyzeBankStatementOutputSchema>;

// ---------------------------------------------------------------------------
// Prompt
// ---------------------------------------------------------------------------
const prompt = ai.definePrompt({
  name: 'analyzeBankStatementPrompt',
  input: { schema: AnalyzeBankStatementInputSchema },
  output: { schema: AnalyzeBankStatementOutputSchema },
  prompt: `You are a Certified Financial Planner reviewing a client's bank statement.
Your job: find where their money is *actually* going, identify drains, and produce
a concrete remediation plan.

## Rules of engagement
1. NEVER invent transactions. If something is unclear, omit it.
2. Be conservative with category totals: when amount is ambiguous, round down.
3. All money values must be in {{displayCurrency}}. Treat the statement currency
   as {{displayCurrency}} unless the data clearly indicates otherwise.
4. A "drain" is any pattern of spend that the user could plausibly cut with
   <1 hour of effort and would save them money every month thereafter
   (subscriptions, overdraft fees, FX fees, app-store, food delivery surcharges,
   duplicate insurance, etc.). Rank drains by ANNUALIZED cost.
5. Recommendations must be IMPERATIVE and DOLLARIZED. Example:
   "Cancel the duplicate Apple Music subscription — saves $10.99/mo ($131.88/year)."
6. The "emergencyImpact" field must compute, in plain English, how many months
   of the user's 2-year emergency fund they could buy back per year if they
   actioned the top 3 drains.

## Hard limits (the schema does NOT enforce these — you must)
- summary: 2-3 sentences max.
- topCategories: AT MOST 10 entries, ordered by totalSpent desc.
- topCategories[].topMerchants: AT MOST 5 strings per category.
- topCategories[].trend: MUST be exactly one of "rising" | "stable" | "declining" | "unknown".
- topDrains: AT MOST 8 entries, ordered by annualizedCost desc.
- topDrains[].severity: MUST be exactly one of "low" | "medium" | "high" | "critical".
- anomalies: AT MOST 15 entries.
- anomalies[].type: MUST be exactly one of "duplicate-charge" | "overdraft-fee" | "unrecognized-merchant" | "subscription-renewal" | "large-outlier" | "cash-withdrawal-spike".
- anomalies[].amount: use 0 if not applicable.
- anomalies[].date: use "" if not applicable.
- recommendations: AT MOST 10 strings.

## Categorization taxonomy (use these, in this order of precedence)
- Housing (rent, mortgage, utilities, internet)
- Food & Groceries (supermarket)
- Dining & Delivery (restaurants, UberEats, DoorDash, coffee shops)
- Transport (fuel, ride-share, public transport, parking, tolls, car insurance)
- Subscriptions (streaming, software, gym, apps)
- Shopping (clothing, electronics, Amazon, general retail)
- Health (pharmacy, doctor, dental, vision)
- Travel (hotels, flights, AirBnB)
- Fees & Interest (bank fees, FX fees, ATM fees, overdraft, late fees)
- Cash Withdrawals
- Transfers (ignore in-network transfers between own accounts)
- Income (salary, refunds, deposits)
- Other / Uncategorized

## Severity scale for drains
- low:      < 1% of monthly income or < $20/mo
- medium:   1% – 3% of monthly income
- high:     3% – 7% of monthly income
- critical: > 7% of monthly income OR avoidable fees/penalties of any size

## Inputs
Monthly income (user-stated, optional): {{monthlyIncome}}
Months covered (best-effort): {{monthsCovered}}
User goals: {{userGoals}}
Display currency: {{displayCurrency}}

{{#if statementText}}
### Statement (extracted text)
\`\`\`
{{{statementText}}}
\`\`\`
{{/if}}

{{#if csvData}}
### Transactions (CSV)
\`\`\`csv
{{{csvData}}}
\`\`\`
{{/if}}

Now perform your analysis and return ONLY the structured JSON.`,
});

// ---------------------------------------------------------------------------
// Flow
// ---------------------------------------------------------------------------
const analyzeBankStatementFlow = ai.defineFlow(
  {
    name: 'analyzeBankStatementFlow',
    inputSchema: AnalyzeBankStatementInputSchema,
    outputSchema: AnalyzeBankStatementOutputSchema,
  },
  async (input) => {
    if (!input.statementText && !input.csvData) {
      throw new Error('Provide either statementText or csvData.');
    }
    // Defensive size cap to protect token budget & cost
    const MAX_CHARS = 60000;
    const trimmed = {
      ...input,
      statementText: input.statementText?.slice(0, MAX_CHARS),
      csvData: input.csvData?.slice(0, MAX_CHARS),
    };
    const { output } = await prompt(trimmed);
    if (!output) throw new Error('Bank statement analyzer returned no output.');
    return output;
  }
);

export async function analyzeBankStatement(
  input: AnalyzeBankStatementInput
): Promise<AnalyzeBankStatementOutput> {
  return analyzeBankStatementFlow(input);
}
