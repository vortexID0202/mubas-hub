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
import { collection, addDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
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
    
    // This is a placeholder as we cannot get the currently logged-in user
    // in a server action without more complex setup.
    const authorId = 'server-user'; // Replace with actual user logic
    
    const title = formData.get('title') as string;
    const details = formData.get('details') as string;
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());

    if (!title || !details) {
        return { success: false, message: 'Title and details are required.' };
    }
    
    try {
        // This is a simplified example. In a real app, you'd get the db instance differently.
        const { firestore } = initializeFirebase(); 
        
        await addDoc(collection(firestore, `users/${authorId}/questions`), {
            authorId: authorId, // This is redundant with nesting but good for denormalization
            title,
            body: details,
            tags: tags,
            createdAt: serverTimestamp(),
            votes: 0,
            answersCount: 0,
            views: 0,
        });

        revalidatePath('/forum');
        return { success: true };
    } catch (error: any) {
        console.error("Error submitting question:", error);
        return { success: false, message: error.message || "Failed to submit question." };
    }
}

    