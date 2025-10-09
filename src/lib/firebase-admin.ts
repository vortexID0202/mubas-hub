
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: admin.App;

if (!admin.apps.length) {
  // The FIREBASE_PRIVATE_KEY is a single line of text. The `replace` call
  // adds the newlines back into the key.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !privateKey
  ) {
    throw new Error(
      'Firebase Admin SDK is not configured. Missing required environment variables.'
    );
  }
  
  try {
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error);
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
  }
} else {
  app = admin.apps[0] as admin.App;
}

const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export function getAdminAuth() {
  return adminAuth;
}

export function getAdminDb() {
  return adminDb;
}
