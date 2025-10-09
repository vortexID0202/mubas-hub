
import * as admin from 'firebase-admin';
import 'dotenv/config';

// This prevents re-initializing the app on every hot-reload in development
function getFirebaseAdminApp(): admin.App {
    if (admin.apps.length > 0) {
        return admin.apps[0];
    }
    
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error('Firebase Admin SDK is not configured. Missing required environment variables.');
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    } catch (error: any) {
        throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
    }
}

export function initializeFirebaseAdmin() {
  const app = getFirebaseAdminApp();
  return {
    auth: admin.auth(app),
    firestore: admin.firestore(app),
  };
}
