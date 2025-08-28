'use server';

/**
 * @fileOverview A flow to extract liability details from uploaded documents.
 *
 * - extractLiabilityDetails - A function that handles the extraction of liability details from documents.
 * - ExtractLiabilityDetailsInput - The input type for the extractLiabilityDetails function.
 * - ExtractLiabilityDetailsOutput - The return type for the extractLiabilityDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLiabilityDetailsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (contract, payment plan) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractLiabilityDetailsInput = z.infer<typeof ExtractLiabilityDetailsInputSchema>;

const ExtractLiabilityDetailsOutputSchema = z.object({
  details: z.string().describe('The extracted details from the document.'),
});
export type ExtractLiabilityDetailsOutput = z.infer<typeof ExtractLiabilityDetailsOutputSchema>;

export async function extractLiabilityDetails(input: ExtractLiabilityDetailsInput): Promise<ExtractLiabilityDetailsOutput> {
  return extractLiabilityDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractLiabilityDetailsPrompt',
  input: {schema: ExtractLiabilityDetailsInputSchema},
  prompt: `You are an expert financial analyst. Your task is to extract liability details from uploaded documents, such as contracts, invoices, and payment plans.

Analyze the following document and extract key details. Focus on identifying:
- The total amount of the liability.
- The amount of each installment or payment.
- The due dates for payments.
- Any applicable interest rates.
- The name of the creditor or project.

Provide a clear and concise summary of these details as a single block of text. If the document is not a financial document or the details cannot be found, state that clearly.
Document: {{media url=documentDataUri}}`,
});

const extractLiabilityDetailsFlow = ai.defineFlow(
  {
    name: 'extractLiabilityDetailsFlow',
    inputSchema: ExtractLiabilityDetailsInputSchema,
    outputSchema: ExtractLiabilityDetailsOutputSchema,
  },
  async input => {
    const response = await ai.generate({
        prompt: await prompt.render(input),
    });
    
    return { details: response.text };
  }
);
