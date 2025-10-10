
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
