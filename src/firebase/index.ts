'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Hardcoded Firebase configuration
const firebaseConfig = {
  projectId: "mubas-community-47645290-bc530",
  appId: "1:776805638483:web:821d2bfcce6e8c7101c1a6",
  apiKey: "AIzaSyBs1nbw6qvV39KHd5jce7euWzKNhQzB4Xg",
  authDomain: "mubas-community-47645290-bc530.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "776805638483"
};


type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let firebaseServices: FirebaseServices | null = null;

function initializeFirebase(): FirebaseServices {
    if (firebaseServices) {
        return firebaseServices;
    }

    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    firebaseServices = { app, auth, firestore };
    return firebaseServices;
}

export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser, UserProvider } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { firebaseConfig, initializeFirebase };
export type { FirebaseServices };
