'use server';
/**
 * @fileOverview Suggests relevant knowledge base articles based on a user's query.
 *
 * - suggestKnowledgeBaseArticles - A function to get KB article suggestions.
 * - KnowledgeBaseSuggesterInput - The input type for the function.
 * - KnowledgeBaseSuggesterOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { knowledgeBaseArticles } from '@/lib/data';

const KnowledgeBaseSuggesterInputSchema = z.object({
  query: z.string().describe("The user's question title or query."),
});
export type KnowledgeBaseSuggesterInput = z.infer<
  typeof KnowledgeBaseSuggesterInputSchema
>;

const KnowledgeBaseSuggesterOutputSchema = z.object({
  suggestions: z.array(
    z.object({
      id: z.string().describe('The ID of the suggested knowledge base article.'),
      title: z
        .string()
        .describe('The title of the suggested knowledge base article.'),
      reason: z
        .string()
        .describe('A brief explanation of why this article is relevant.'),
    })
  ),
});
export type KnowledgeBaseSuggesterOutput = z.infer<
  typeof KnowledgeBaseSuggesterOutputSchema
>;

export async function suggestKnowledgeBaseArticles(
  input: KnowledgeBaseSuggesterInput
): Promise<KnowledgeBaseSuggesterOutput> {
  return knowledgeBaseSuggesterFlow(input);
}

const allArticles = knowledgeBaseArticles
  .map((article) => `ID: ${article.id}, Title: ${article.title}, Body: ${article.body}`)
  .join('\n---\n');

const prompt = ai.definePrompt({
  name: 'knowledgeBaseSuggesterPrompt',
  input: { schema: KnowledgeBaseSuggesterInputSchema },
  output: { schema: KnowledgeBaseSuggesterOutputSchema },
  prompt: `You are an intelligent assistant for the MUBAS Community Hub. Your goal is to help users find answers in the Knowledge Base before they post a new question.

Analyze the user's question title and determine if it is related to any of the following Knowledge Base articles.

=== Knowledge Base Articles ===
${allArticles}
=============================

=== User's Question Title ===
"{{{query}}}"
=============================

Based on the user's question, provide a list of up to 3 relevant article suggestions. For each suggestion, provide the article ID, its title, and a brief reason why it is relevant.

If there are no relevant articles, return an empty array for the suggestions.
`,
});

const knowledgeBaseSuggesterFlow = ai.defineFlow(
  {
    name: 'knowledgeBaseSuggesterFlow',
    inputSchema: KnowledgeBaseSuggesterInputSchema,
    outputSchema: KnowledgeBaseSuggesterOutputSchema,
  },
  async (input) => {
    // If the query is too short, don't bother the AI.
    if (input.query.length < 15) {
      return { suggestions: [] };
    }

    const { output } = await prompt(input);
    return output!;
  }
);
interface KnowledgeBaseArticle {
    id: number; // or string, based on your logic
    title: string;
    body: string; // Add this line if it is not present
}
const knowledgeBaseArticles: KnowledgeBaseArticle[] = [
    { id: 1, title: "Article One", body: "This is the body of article one." },
    { id: 2, title: "Article Two", body: "This is the body of article two." },
    // More articles...
];
