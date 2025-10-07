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
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';


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
    'use server';
    // NOTE: Firebase is initialized on the client.
    // We cannot initialize or use Firebase Admin SDK here in Server Actions.
    // This function will need to be refactored to be a client-side function
    // that calls a server action only for non-Firebase logic if needed.
    // For now, we return an error.
    
    // This is a placeholder to demonstrate the need for client-side Firebase logic.
    const title = formData.get('title') as string;
    if (!title) {
        return { success: false, message: 'Title is required.' };
    }
    
    console.log("Submitting question (server-side):", title);
    // In a real implementation, you would not use the Firebase client SDK here.
    // This is a temporary measure.
    
    return { success: false, message: "Question submission is not fully implemented. Please implement client-side Firestore logic." };
}
