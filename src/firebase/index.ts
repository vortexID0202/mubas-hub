'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

function initializeFirebase(): FirebaseServices {
    const apps = getApps();
    if (apps.length > 0) {
        const app = apps[0];
        return {
            app,
            auth: getAuth(app),
            firestore: getFirestore(app)
        };
    }
    
    const app = initializeApp(firebaseConfig);
    return {
        app,
        auth: getAuth(app),
        firestore: getFirestore(app)
    };
}

export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useAuth,
  useFirestore,
} from './provider';
export { FirebaseClientProvider } from './client-provider';
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';
export { firebaseConfig, initializeFirebase };
export type { FirebaseServices };
