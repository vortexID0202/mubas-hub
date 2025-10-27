import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { CommunityQuestion, KnowledgeBaseArticle } from '@/lib/types';

function getAdminApp(): App {
  const apps = getApps();
  if (apps.length) {
    return apps[0];
  }

  // In a Firebase App Hosting environment, initializeApp() discovers credentials automatically.
  // This call will work in both deployed and local emulator environments.
  return initializeApp();
}

function getSdks() {
  const app = getAdminApp();
  return {
    firestore: getFirestore(app)
  };
}

export async function fetchAllContent() {
    const { firestore } = getSdks();
    const allContent = [];

    const kbQuery = firestore.collection('knowledge_base_articles');
    const kbSnapshot = await kbQuery.get();
    kbSnapshot.forEach(doc => {
        const data = doc.data() as Omit<KnowledgeBaseArticle, 'id'>;
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
        const data = doc.data() as Omit<CommunityQuestion, 'id'>;
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
