'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';

// --- Service-only Context ---
interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

const FirebaseServicesContext = createContext<FirebaseServices | undefined>(undefined);

// --- User Authentication Context ---
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

const UserAuthContext = createContext<UserAuthState | undefined>(undefined);

// --- Combined Provider ---
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => setUserAuthState({ user, isUserLoading: false, userError: null }),
      (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth]);

  const servicesValue = useMemo(() => ({ firebaseApp, firestore, auth }), [firebaseApp, firestore, auth]);

  return (
    <FirebaseServicesContext.Provider value={servicesValue}>
      <UserAuthContext.Provider value={userAuthState}>
        {children}
      </UserAuthContext.Provider>
    </FirebaseServicesContext.Provider>
  );
};

// --- Hooks ---

/**
 * Hook to access core Firebase services.
 * Throws an error if used outside a FirebaseProvider.
 */
export const useFirebaseServices = (): FirebaseServices => {
  const context = useContext(FirebaseServicesContext);
  if (context === undefined) {
    throw new Error('useFirebaseServices must be used within a FirebaseProvider.');
  }
  return context;
};

/**
 * Hook to access the authenticated user's state.
 * Throws an error if used outside a FirebaseProvider.
 */
export const useUser = (): UserAuthState => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }
  return context;
};

/** Hook to access the Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebaseServices();
  return firestore;
};

/** Hook to access the Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebaseServices();
  return auth;
};

/** Hook to access the Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebaseServices();
  return firebaseApp;
};

// --- Utility ---

type MemoFirebase<T> = T & { __memo?: boolean };

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | MemoFirebase<T> {
  const memoized = useMemo(factory, deps);
  if (typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}