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
import { cookies } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebaseAdmin } from '@/firebase/server';
import { CommunityQuestion, Tag } from '@/lib/types';


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
    
    const { firestore } = initializeFirebaseAdmin();
    const sessionCookie = cookies().get('session')?.value;

    if (!sessionCookie) {
        return { success: false, message: 'You must be logged in to post a question.' };
    }

    let decodedToken;
    try {
        decodedToken = await getAuth().verifySessionCookie(sessionCookie, true);
    } catch (error) {
        console.error('Error verifying session cookie:', error);
        return { success: false, message: 'Your session is invalid. Please log in again.' };
    }

    const authorId = decodedToken.uid;
    
    const title = formData.get('title') as string;
    const details = formData.get('details') as string;
    const tagsString = formData.get('tags') as string;

    if (!title || !details) {
        return { success: false, message: 'Title and details are required.' };
    }
    
    const tags: Tag[] = tagsString 
        ? tagsString.split(',').map(tag => ({ id: tag.trim(), name: tag.trim() }))
        : [];
    
    try {
        const questionData: Omit<CommunityQuestion, 'id' | 'author' | 'answers' | 'authorId'> = {
            title: title,
            body: details,
            tags: tags,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            votes: 0,
            answersCount: 0,
            views: 0,
        };
        
        // Save the question in a top-level `questions` collection
        // and also in the user's sub-collection for easy retrieval of user's questions
        const userQuestionRef = await addDoc(collection(firestore, `users/${authorId}/questions`), { ...questionData, authorId });
        await addDoc(collection(firestore, 'questions'), { ...questionData, authorId: authorId, id: userQuestionRef.id });


        revalidatePath('/forum');
        revalidatePath(`/profile`);
        return { success: true };
    } catch (error: any) {
        console.error("Error submitting question:", error);
        return { success: false, message: error.message || "Failed to submit question." };
    }
}
