
import * as admin from 'firebase-admin';
import { getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';


// This prevents re-initializing the app on every hot-reload in development
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must have newline characters correctly replaced.
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Firebase Admin SDK is not configured. Missing environment variables.');
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export function initializeFirebaseAdmin() {
  const app = getFirebaseAdminApp();
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
