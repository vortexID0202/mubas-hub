'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// This object will hold the initialized Firebase services.
type FirebaseServices = {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
};

let firebaseApp: FirebaseApp;

if (firebaseConfig.apiKey) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
} else {
    console.error("Firebase config is not available. Please check your environment variables.");
    // We create a dummy app to avoid crashing the app, but Firebase services will not work.
    // @ts-ignore
    firebaseApp = {}; 
}


const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

// This is the core function to initialize Firebase and get the SDKs.
// It's designed to be idempotent - it will only initialize the app once.
export function initializeFirebase(): FirebaseServices {
  return {
    firebaseApp,
    auth,
    firestore,
    storage,
  };
}


// Export the hooks and providers that the rest of the app will use.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';