
import * as admin from 'firebase-admin';
import { getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase/firestore';
import 'dotenv/config';


// This prevents re-initializing the app on every hot-reload in development
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
        throw new Error('Firebase Admin SDK is not configured. Missing FIREBASE_SERVICE_ACCOUNT_JSON environment variable.');
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountJson);

        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        throw new Error(`Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${error.message}`);
    }
}

export function initializeFirebaseAdmin() {
  const app = getFirebaseAdminApp();
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
