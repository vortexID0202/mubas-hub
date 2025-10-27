
'use server';

/**
 * @fileOverview An AI agent that ranks search results from knowledge base and community forum.
 *
 * - hybridSearch - A function that ranks search results.
 * - HybridSearchInput - The input type for the hybridSearch function.
 * - HybridSearchOutput - The return type for the hybridSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const HybridSearchInputSchema = z.object({
  query: z.string().describe('The user input query.'),
  content: z.array(z.object({
    id: z.string(),
    type: z.enum(['knowledgeBase', 'communityForum']),
    title: z.string(),
    content: z.string(),
    isVerified: z.boolean().optional(),
    votes: z.number().optional(),
  })).describe('The content to search through.')
});
export type HybridSearchInput = z.infer<typeof HybridSearchInputSchema>;

const HybridSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      id: z.string().describe('The document ID.'),
      type: z.enum(['knowledgeBase', 'communityForum']).describe('The type of the result.'),
      title: z.string().describe('The title of the result.'),
      description: z.string().describe('A brief description or snippet of the result.'),
      url: z.string().describe('The URL to the full content.'),
    })
  ).describe('A list of search results.'),
});
export type HybridSearchOutput = z.infer<typeof HybridSearchOutputSchema>;

const hybridSearchFlow = ai.defineFlow(
  {
    name: 'hybridSearchFlow',
    inputSchema: HybridSearchInputSchema,
    outputSchema: HybridSearchOutputSchema,
  },
  async (input) => {
    
    const allContentString = input.content.map(item => `ID: ${item.id}, Type: ${item.type}, Title: ${item.title}, Content: ${item.content.substring(0, 200)}...`).join('\n---\n');

    const prompt = ai.definePrompt({
      name: 'hybridSearchPrompt',
      input: { schema: z.object({ query: z.string() }) },
      output: { schema: HybridSearchOutputSchema },
      prompt: `You are an intelligent search engine for the MUBAS Community Hub.

Your task is to analyze the user's query and the available content (Knowledge Base articles and Community Forum questions) to provide the most relevant results.

Rank the results based on the following criteria, in order of importance:
1. Relevance to the user's query.
2. Verified status (verified articles or questions with verified answers are more important).
3. Popularity (higher votes are better).

For each result, provide the ID, type, title, and a brief, helpful description/snippet. The URL should be constructed based on the type and ID.

=== Available Content ===
${allContentString}
=======================

=== User's Query ===
"{{{query}}}"
====================

Return a JSON object with a "results" array, ordered from most to least relevant.
`,
    });

    const { output } = await prompt({ query: input.query });
    
    if (!output) {
      return { results: [] };
    }

    return output;
  }
);


export async function hybridSearch(input: HybridSearchInput): Promise<HybridSearchOutput> {
  if (input.query.length < 3) {
      return { results: [] };
  }
  return hybridSearchFlow(input);
}
