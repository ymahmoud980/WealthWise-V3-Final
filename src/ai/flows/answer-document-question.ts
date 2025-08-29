
'use server';

/**
 * @fileOverview A flow to answer specific questions about a financial document.
 *
 * - answerDocumentQuestion - A function that answers a user's question based on an uploaded document.
 * - AnswerDocumentQuestionInput - The input type for the function.
 * - AnswerDocumentQuestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerDocumentQuestionInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (e.g., contract, payment plan) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  context: z.string().describe("The asset or liability this document is about. e.g., 'Asset: Mountain View iCity' or 'Liability: Car Loan'"),
  question: z.string().describe("The user's specific question about the document."),
});
export type AnswerDocumentQuestionInput = z.infer<typeof AnswerDocumentQuestionInputSchema>;

const AnswerDocumentQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question, based directly on the provided document.'),
});
export type AnswerDocumentQuestionOutput = z.infer<typeof AnswerDocumentQuestionOutputSchema>;

export async function answerDocumentQuestion(input: AnswerDocumentQuestionInput): Promise<AnswerDocumentQuestionOutput> {
  return answerDocumentQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerDocumentQuestionPrompt',
  input: {schema: AnswerDocumentQuestionInputSchema},
  output: {schema: AnswerDocumentQuestionOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to carefully analyze a document provided by a user and answer a specific question they have about it.

The user has provided the following context for the document: {{{context}}}.

The user's question is: "{{{question}}}"

Analyze the document below and provide a clear, concise answer to the user's question. Base your answer ONLY on the information present in the document. If the document does not contain the information needed to answer the question, state that clearly.

Document: {{media url=documentDataUri}}`,
});

const answerDocumentQuestionFlow = ai.defineFlow(
  {
    name: 'answerDocumentQuestionFlow',
    inputSchema: AnswerDocumentQuestionInputSchema,
    outputSchema: AnswerDocumentQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
