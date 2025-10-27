
'use server';

/**
 * @fileOverview A hybrid search AI agent that searches across knowledge base and community forum.
 *
 * - hybridSearch - A function that retrieves and ranks search results.
 * - HybridSearchInput - The input type for the hybridSearch function.
 * - HybridSearchOutput - The return type for the hybridSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { CommunityQuestion, KnowledgeBaseArticle } from '@/lib/types';


// Server-side Firebase Admin initialization
function getAdminApp(): App {
  const apps = getApps();
  if (apps.length) {
    return apps[0];
  }
  // Note: App Hosting provides service account credentials automatically.
  return initializeApp();
}

function getSdks() {
  const app = getAdminApp();
  return {
    firestore: getAdminFirestore(app)
  };
}

const HybridSearchInputSchema = z.object({
  query: z.string().describe('The user input query.'),
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
      isVerified: z.boolean().optional().describe('Indicates if the result is verified.'),
      votes: z.number().optional().describe('The number of upvotes for the result.'),
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
    if (input.query.length < 3) {
      return { results: [] };
    }
    
    // Note: This is a simplified fetch. A real implementation would use a proper search index.
    async function fetchAllContent() {
        const { firestore } = getSdks();
        const allContent = [];

        const kbQuery = firestore.collection('knowledge_base_articles');
        const kbSnapshot = await kbQuery.get();
        kbSnapshot.forEach(doc => {
            const data = doc.data() as KnowledgeBaseArticle;
            allContent.push({
                id: doc.id,
                type: 'knowledgeBase' as const,
                title: data.title,
                content: data.content,
                isVerified: true, // All KB articles are considered verified
            });
        });

        const questionsQuery = firestore.collection('questions');
        const questionsSnapshot = await questionsQuery.get();
        questionsSnapshot.forEach(doc => {
            const data = doc.data() as CommunityQuestion;
            allContent.push({
                id: doc.id,
                type: 'communityForum' as const,
                title: data.title,
                content: data.body,
                isVerified: data.isVerified || false,
                votes: data.votes || 0,
            });
        });

        return allContent;
    }


    async function generateAllContentString() {
        const content = await fetchAllContent();
        return content.map(item => `ID: ${item.id}, Type: ${item.type}, Title: ${item.title}, Content: ${item.content.substring(0, 200)}...`).join('\n---\n');
    }
    
    const allContentString = await generateAllContentString();

    const prompt = ai.definePrompt({
      name: 'hybridSearchPrompt',
      input: { schema: HybridSearchInputSchema },
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

    const { output } = await prompt(input);
    
    if (!output) {
      return { results: [] };
    }

    const allContent = await fetchAllContent();

    // Add the full URL to each result
    const resultsWithUrls = output.results.map(result => {
        const originalContent = allContent.find(c => c.id === result.id);
        return {
            ...result,
            url: result.type === 'knowledgeBase' ? `/kb/${result.id}` : `/questions/${result.id}`,
            // Ensure original votes and verification status are preserved if AI hallucinates them
            votes: originalContent?.votes, 
            isVerified: originalContent?.isVerified,
        }
    });

    // Final re-sorting to strictly enforce ranking rules
    resultsWithUrls.sort((a, b) => {
        // Verified content first
        if ((a.isVerified ?? false) && !(b.isVerified ?? false)) return -1;
        if (!(a.isVerified ?? false) && (b.isVerified ?? false)) return 1;

        // Then by votes (for forum questions)
        const votesA = a.type === 'communityForum' ? a.votes ?? 0 : 0;
        const votesB = b.type === 'communityForum' ? b.votes ?? 0 : 0;
        if (votesA !== votesB) {
            return votesB - votesA;
        }

        return 0; // Keep AI's relevance ranking if other factors are equal
    });

    return { results: resultsWithUrls };
  }
);


export async function hybridSearch(input: HybridSearchInput): Promise<HybridSearchOutput> {
  return hybridSearchFlow(input);
}
