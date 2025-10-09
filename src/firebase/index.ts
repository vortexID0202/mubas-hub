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

let firebaseServices: FirebaseServices | null = null;

// This is the core function to initialize Firebase and get the SDKs.
// It's designed to be idempotent - it will only initialize the app once.
export function initializeFirebase(): FirebaseServices {
  // If the services have already been initialized, just return them.
  if (firebaseServices) {
    return firebaseServices;
  }

  // Check if a Firebase app has already been initialized.
  // This is the standard pattern to prevent re-initialization.
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

  // Initialize the services we need.
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  // Store the initialized services in our local variable.
  firebaseServices = {
    firebaseApp: app,
    auth,
    firestore,
    storage,
  };
  
  return firebaseServices;
}


// Export the hooks and providers that the rest of the app will use.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
