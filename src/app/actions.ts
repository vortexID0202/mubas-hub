'use server';

import {
  getSearchSuggestions as getSearchSuggestionsAI,
  HybridSearchSuggestionsInput,
} from '@/ai/flows/hybrid-search-suggestions';
import {
  rankAnswers as rankAnswersAI,
  RankAnswersInput,
} from '@/ai/flows/community-forum-answer-ranker';
import { revalidatePath } from 'next/cache';

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

export async function submitQuestion(formData: FormData) {
    const title = formData.get('title');
    const details = formData.get('details');
    const tags = formData.get('tags');
    
    console.log("New Question Submitted:", { title, details, tags });
    // Here you would typically save to a database.
    
    // For now, we'll just log it and revalidate the homepage path
    // to simulate new content appearing.
    revalidatePath('/');
    
    return { success: true, message: "Question submitted successfully!" };
}
