import { initializeApp, getApps, App, credential } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    // This block will only run once, on the first server-side execution.
    // It reads the environment variables to configure the Firebase Admin SDK.
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must have newline characters correctly replaced.
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        console.error('Firebase Admin SDK is not configured. Missing environment variables.');
        // Fallback to application default credentials if available,
        // otherwise it will fail, which is expected if not configured.
        return initializeApp({
            credential: credential.applicationDefault(),
        });
    }

    return initializeApp({
        credential: credential.cert(serviceAccount),
    });
}

export function initializeFirebaseAdmin() {
  const app = getFirebaseAdminApp();
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
