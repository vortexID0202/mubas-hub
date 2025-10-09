import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { credential } from 'firebase-admin';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApp();
    }

    // In a deployed App Hosting environment, the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable is automatically set. at run-time, the authentication
    // library will use this environment variable to authenticate.
    //
    // For local development, you can download a service account key from the
    // Firebase console and set the GOOGLE_APPLICATION_CREDENTIALS environment
    // variable to the path of the downloaded key.
    return initializeApp({
        credential: credential.applicationDefault(),
    });
}

export function initializeFirebaseAdmin() {
  const app = getFirebaseAdminApp();
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
