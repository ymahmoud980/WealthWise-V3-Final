
'use server';

/**
 * @fileOverview An AI agent that generates a comprehensive financial report.
 *
 * - generateFinancialReport - A function that creates a detailed text-based report.
 * - GenerateFinancialReportInput - The input type for the function.
 * - GenerateFinancialReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { FinancialData, ExchangeRates } from '@/lib/types';
import type { calculateMetrics } from '@/lib/calculations';

// The input now takes the pre-calculated metrics.
export type GenerateFinancialReportInput = {
  financialData: FinancialData;
  metrics: ReturnType<typeof calculateMetrics>;
  displayCurrency: string;
  currentDate: string;
  exchangeRates: ExchangeRates;
};

const GenerateFinancialReportOutputSchema = z.object({
    report: z.string().describe('A comprehensive, well-organized financial report in plain text format.'),
});

export type GenerateFinancialReportOutput = z.infer<typeof GenerateFinancialReportOutputSchema>;

export async function generateFinancialReport(input: GenerateFinancialReportInput): Promise<GenerateFinancialReportOutput> {
  const rateSummary = `1 EGP = ${(input.exchangeRates.USD / input.exchangeRates.EGP * input.exchangeRates[input.displayCurrency as keyof ExchangeRates]).toFixed(4)} ${input.displayCurrency}, 1 TRY = ${(input.exchangeRates.USD / input.exchangeRates.TRY * input.exchangeRates[input.displayCurrency as keyof ExchangeRates]).toFixed(4)} ${input.displayCurrency}, 1 USD = ${(input.exchangeRates.USD * input.exchangeRates[input.displayCurrency as keyof ExchangeRates]).toFixed(4)} ${input.displayCurrency}`;
    
  return generateFinancialReportFlow({
    financialData: JSON.stringify(input.financialData, null, 2),
    metrics: JSON.stringify(input.metrics, null, 2),
    displayCurrency: input.displayCurrency,
    currentDate: input.currentDate,
    rateSummary: rateSummary,
  });
}

const prompt = ai.definePrompt({
  name: 'generateFinancialReportPrompt',
  input: {schema: z.any()},
  output: {schema: GenerateFinancialReportOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to generate a comprehensive, detailed, and well-organized financial report based on the JSON data provided. The user wants a full picture of their financial situation in a clear, readable text format.

The report date is: {{{currentDate}}}
All financial figures should be presented in the user's preferred display currency: {{{displayCurrency}}}.
The exchange rates used for conversion are: {{{rateSummary}}}

Here are the user's calculated financial metrics:
\`\`\`json
{{{metrics}}}
\`\`\`

And here is the raw financial data:
\`\`\`json
{{{financialData}}}
\`\`\`

Based on this data, generate a report with the following sections:

1.  **Executive Summary:**
    *   Start with a brief overview.
    *   State the key metrics: Net Worth, Total Assets, Total Liabilities, and Average Monthly Net Cash Flow. Format numbers clearly.

2.  **Net Worth Analysis:**
    *   Briefly explain the net worth calculation (Assets - Liabilities).
    *   Comment on the overall health indicated by the net worth.

3.  **Asset Breakdown (All values in {{{displayCurrency}}}):**
    *   Create a clear, itemized list for each asset category.
    *   **Existing Real Estate:** List each property, its location, and its current market value.
    *   **Off-Plan Real Estate (Under Development):** List each project, its location, its purchase price, and its current estimated value.
    *   **Cash Holdings:** List cash by location and amount.
    *   **Gold:** List the gold holdings and their value.
    *   **Other Assets:** List any other assets and their values.
    *   Provide a total value for each category and a final total asset value.

4.  **Liability Breakdown (All values in {{{displayCurrency}}}):**
    *   Create a clear, itemized list for each liability category.
    *   **Loans:** For each loan, list the lender, initial amount, remaining amount, and monthly payment.
    *   **Project Installments:** For each project, list the developer, total price, amount paid, and the remaining balance.
    *   Provide a total value for each category and a final total liability value.

5.  **Monthly Cash Flow Analysis (All values in {{{displayCurrency}}}):**
    *   **Income:**
        *   List all sources of monthly income (e.g., Salary, Property Rentals).
        *   Provide a "Total Monthly Income" figure.
    *   **Expenses:**
        *   List all monthly expenses (e.g., Loan Payments, Household Expenses).
        *   Include the *average* monthly cost for project installments.
        *   Provide a "Total Monthly Expenses" figure.
    *   **Net Cash Flow:**
        *   State the final "Net Monthly Cash Flow" (Income - Expenses) and comment on whether it's a surplus or deficit.

6.  **Upcoming Financial Events:**
    *   List the next few upcoming installment payments, including the project name, due date, and amount.
    *   List the next few upcoming rental incomes, including the property name, due date, and amount.

Generate the report as a single block of well-formatted plain text. Use headings, lists, and spacing to make it highly readable. Do not use Markdown, just plain text.
`,
});

const generateFinancialReportFlow = ai.defineFlow(
  {
    name: 'generateFinancialReportFlow',
    inputSchema: z.any(),
    outputSchema: GenerateFinancialReportOutputSchema,
  },
  async (input: { financialData: string; metrics: string; displayCurrency: string, currentDate: string; rateSummary: string; }) => {
    const {output} = await prompt(input);
    return output!;
  }
);
