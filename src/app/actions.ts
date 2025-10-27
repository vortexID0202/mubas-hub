
'use server';

import {
  getSearchSuggestions as getSearchSuggestionsAI,
  HybridSearchSuggestionsInput,
} from '@/ai/flows/hybrid-search-suggestions';
import {
  rankAnswers as rankAnswersAI,
  RankAnswersInput,
} from '@/ai/flows/community-forum-answer-ranker';
import {
  suggestKnowledgeBaseArticles as suggestKnowledgeBaseArticlesAI,
  KnowledgeBaseSuggesterInput,
} from '@/ai/flows/knowledge-base-suggester';
import {
  hybridSearch as hybridSearchAI,
  HybridSearchInput,
  HybridSearchOutput,
} from '@/ai/flows/hybrid-search';


export async function getSearchSuggestions(
  input: HybridSearchSuggestionsInput
) {
  // In a real app, you might add validation, logging, etc.
  return getSearchSuggestionsAI(input);
}

export async function getRankedAnswers(input: RankAnswersInput) {
  const rankedAnswers = await rankAnswersAI(input);
  // Sort by rank
  return rankedAnswers.sort((a, b) => a.rank - b.rank);
}

export async function getKnowledgeBaseSuggestions(
  input: KnowledgeBaseSuggesterInput
) {
  return suggestKnowledgeBaseArticlesAI(input);
}

export async function hybridSearch(input: HybridSearchInput): Promise<HybridSearchOutput> {
  
  const output = await hybridSearchAI(input);

  // Post-process results to add URLs and sort
  const resultsWithUrls = output.results.map(result => {
      const originalContent = input.content.find(c => c.id === result.id);
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
