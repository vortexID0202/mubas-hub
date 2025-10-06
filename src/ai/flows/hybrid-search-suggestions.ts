'use server';

/**
 * @fileOverview A hybrid search suggestion AI agent.
 *
 * - getSearchSuggestions - A function that retrieves search suggestions based on the user's query.
 * - HybridSearchSuggestionsInput - The input type for the getSearchSuggestions function.
 * - HybridSearchSuggestionsOutput - The return type for the getSearchSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HybridSearchSuggestionsInputSchema = z.object({
  query: z.string().describe('The user input query.'),
});
export type HybridSearchSuggestionsInput = z.infer<typeof HybridSearchSuggestionsInputSchema>;

const HybridSearchSuggestionsOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.enum(['knowledgeBase', 'communityForum']).describe('The type of the suggestion.'),
      title: z.string().describe('The title of the suggestion.'),
      description: z.string().describe('A brief description of the suggestion.'),
    })
  ).describe('A list of search suggestions.'),
});
export type HybridSearchSuggestionsOutput = z.infer<typeof HybridSearchSuggestionsOutputSchema>;

export async function getSearchSuggestions(input: HybridSearchSuggestionsInput): Promise<HybridSearchSuggestionsOutput> {
  return hybridSearchSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'hybridSearchSuggestionsPrompt',
  input: {schema: HybridSearchSuggestionsInputSchema},
  output: {schema: HybridSearchSuggestionsOutputSchema},
  prompt: `You are an AI assistant that provides search suggestions for the MUBAS Community Hub.

  The Community Hub has two main content sources:
  1. Knowledge Base: Official articles and guides created by the administrators.
  2. Community Forum: Questions and answers posted by students.

  Based on the user's query, provide relevant search suggestions from both the Knowledge Base and the Community Forum.

  Query: {{{query}}}

  Format your response as a JSON array of suggestion objects. Each suggestion object should have the following fields:
  - type: (string, either 'knowledgeBase' or 'communityForum')
  - title: (string, the title of the suggested content)
  - description: (string, a brief description of the suggested content)

  Example:
  [
    {
      "type": "knowledgeBase",
      "title": "Setting up MUBAS Wi-Fi",
      "description": "A step-by-step guide on how to connect to the university's Wi-Fi network."
    },
    {
      "type": "communityForum",
      "title": "SMIS password reset",
      "description": "How do I reset my SMIS password?"
    }
  ]
  `,
});

const hybridSearchSuggestionsFlow = ai.defineFlow(
  {
    name: 'hybridSearchSuggestionsFlow',
    inputSchema: HybridSearchSuggestionsInputSchema,
    outputSchema: HybridSearchSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
