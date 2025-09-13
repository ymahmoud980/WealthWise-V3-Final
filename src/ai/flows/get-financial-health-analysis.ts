
'use server';

/**
 * @fileOverview An AI agent that analyzes a user's complete financial status.
 *
 * - getFinancialHealthAnalysis - A function that provides a comprehensive financial analysis.
 * - GetFinancialHealthAnalysisInput - The input type for the function.
 * - GetFinancialHealthAnalysisOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { calculateMetrics } from '@/lib/calculations';
import type { FinancialData } from '@/lib/types';


// The input now takes the pre-calculated metrics.
export type GetFinancialHealthAnalysisInput = {
  financialData: FinancialData,
  displayCurrency: string,
};

const FinancialHealthAnalysisOutputSchema = z.object({
    healthScore: z.number().describe('A financial health score from 0 to 100, where 100 is excellent.'),
    summary: z.string().describe('A brief, one-paragraph summary of the overall financial situation.'),
    strengths: z.array(z.string()).describe('A list of key financial strengths.'),
    risks: z.array(z.string()).describe('A list of potential risks or areas for improvement.'),
    suggestions: z.array(z.string()).describe('A list of actionable suggestions for the user.'),
});

export type GetFinancialHealthAnalysisOutput = z.infer<typeof FinancialHealthAnalysisOutputSchema>;

export async function getFinancialHealthAnalysis(input: GetFinancialHealthAnalysisInput): Promise<GetFinancialHealthAnalysisOutput> {
  // Pre-calculate all financial metrics here on the server.
  const metrics = calculateMetrics(input.financialData, input.displayCurrency);
  
  // Pass the calculated metrics to the flow.
  return getFinancialHealthAnalysisFlow({
    metrics: metrics,
    displayCurrency: input.displayCurrency,
  });
}

const prompt = ai.definePrompt({
  name: 'financialHealthAnalysisPrompt',
  input: {schema: z.any()},
  output: {schema: FinancialHealthAnalysisOutputSchema},
  prompt: `You are an expert financial advisor and wealth manager with deep accounting knowledge. Your task is to conduct a comprehensive analysis of a user's financial health based on pre-calculated metrics.

All financial figures are presented in the user's preferred display currency: {{{displayCurrency}}}.

Analyze the provided financial metrics:
\`\`\`json
{{{metrics}}}
\`\`\`

Based on your analysis, provide the following in JSON format:
1.  **healthScore**: An overall financial health score from 0 to 100. Base this on the provided metrics, especially net worth, asset vs. liability values, and net cash flow. A positive net cash flow is a very strong indicator.
2.  **summary**: A concise, one-paragraph summary of the user's financial situation based on the metrics.
3.  **strengths**: A list of 2-4 key financial strengths, drawn from the metrics.
4.  **risks**: A list of 2-4 primary financial risks or areas needing attention, identified from the metrics.
5.  **suggestions**: A list of 2-4 clear, actionable suggestions for improvement based on the analysis.
`,
});

const getFinancialHealthAnalysisFlow = ai.defineFlow(
  {
    name: 'getFinancialHealthAnalysisFlow',
    inputSchema: z.any(),
    outputSchema: FinancialHealthAnalysisOutputSchema,
  },
  async (input: { metrics: any; displayCurrency: string }) => {
    const {output} = await prompt({
        // Stringify the metrics to pass into the prompt.
        metrics: JSON.stringify(input.metrics, null, 2),
        displayCurrency: input.displayCurrency,
    });
    return output!;
  }
);
