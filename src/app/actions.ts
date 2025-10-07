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
    const { auth, firestore } = initializeFirebase();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        return { success: false, message: 'You must be logged in to ask a question.' };
    }

    const title = formData.get('title') as string;
    const details = formData.get('details') as string;
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());

    if (!title || !details) {
        return { success: false, message: 'Title and details are required.' };
    }

    try {
        const questionsCollection = collection(firestore, 'questions');
        await addDoc(questionsCollection, {
            title,
            body: details,
            author: currentUser.uid,
            tags: tags,
            votes: 0,
            answersCount: 0,
            views: 0,
            createdAt: new Date().toISOString(),
        });

        revalidatePath('/');
        revalidatePath('/forum');
        
        return { success: true, message: 'Question submitted successfully!' };

    } catch (error) {
        console.error('Error submitting question:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: `Failed to submit question: ${errorMessage}` };
    }
}
