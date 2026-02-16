'use server';

/**
 * @fileOverview A flow to handle the AI Wealth Advisor chat.
 *
 * - advisorChat - A function that responds to a user's question based on their financial context.
 * - AdvisorChatInput - The input type for the function.
 * - AdvisorChatOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvisorChatInputSchema = z.object({
  context: z.string().describe("A string containing the user's financial data, their specific question, and instructions for how the AI should answer."),
});
export type AdvisorChatInput = z.infer<typeof AdvisorChatInputSchema>;

const AdvisorChatOutputSchema = z.object({
  reply: z.string().describe('The AI advisor\'s response to the user question, formatted as Markdown.'),
});
export type AdvisorChatOutput = z.infer<typeof AdvisorChatOutputSchema>;

export async function advisorChat(input: AdvisorChatInput): Promise<AdvisorChatOutput> {
  return advisorChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advisorChatPrompt',
  input: {schema: AdvisorChatInputSchema},
  output: {schema: AdvisorChatOutputSchema},
  prompt: `{{{context}}}`,
});

const advisorChatFlow = ai.defineFlow(
  {
    name: 'advisorChatFlow',
    inputSchema: AdvisorChatInputSchema,
    outputSchema: AdvisorChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("AI did not return a valid reply.");
    }
    return output;
  }
);
