'use server';

/**
 * @fileOverview An AI agent that suggests optimal rent increases for rental properties.
 *
 * - suggestOptimalRentIncreases - A function that suggests optimal rent increases based on property data.
 * - SuggestOptimalRentIncreasesInput - The input type for the suggestOptimalRentIncreases function.
 * - SuggestOptimalRentIncreasesOutput - The return type for the suggestOptimalRentIncreases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalRentIncreasesInputSchema = z.object({
  propertyLocation: z.string().describe('The location of the property.'),
  currentMarketValue: z.number().describe('The current market value of the property.'),
  historicalRentalIncome: z.array(z.object({
    year: z.number(),
    income: z.number(),
  })).describe('The historical rental income of the property.'),
  localRegulations: z.string().describe('Any local regulations that may affect rent increases.'),
});

export type SuggestOptimalRentIncreasesInput = z.infer<typeof SuggestOptimalRentIncreasesInputSchema>;

const SuggestOptimalRentIncreasesOutputSchema = z.object({
  suggestedRentIncrease: z.number().describe('The suggested rent increase as a percentage.'),
  reasoning: z.string().describe('The reasoning behind the suggested rent increase.'),
});

export type SuggestOptimalRentIncreasesOutput = z.infer<typeof SuggestOptimalRentIncreasesOutputSchema>;

export async function suggestOptimalRentIncreases(input: SuggestOptimalRentIncreasesInput): Promise<SuggestOptimalRentIncreasesOutput> {
  return suggestOptimalRentIncreasesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalRentIncreasesPrompt',
  input: {schema: SuggestOptimalRentIncreasesInputSchema},
  output: {schema: SuggestOptimalRentIncreasesOutputSchema},
  prompt: `You are an AI financial advisor specializing in rental property management.

  Based on the following information, suggest an optimal rent increase as a percentage, and explain your reasoning.

  Property Location: {{{propertyLocation}}}
  Current Market Value: {{{currentMarketValue}}}
  Historical Rental Income: {{#each historicalRentalIncome}}{{{year}}}: {{{income}}} {{/each}}
  Local Regulations: {{{localRegulations}}}

  Consider the property location, current market value, historical rental income, and local regulations to determine the optimal rent increase.
  Provide a suggested rent increase as a percentage and explain your reasoning. You must respond using JSON format.
`,
});

const suggestOptimalRentIncreasesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalRentIncreasesFlow',
    inputSchema: SuggestOptimalRentIncreasesInputSchema,
    outputSchema: SuggestOptimalRentIncreasesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
