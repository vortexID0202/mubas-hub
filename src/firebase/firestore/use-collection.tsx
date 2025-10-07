
'use client';
import {useState, useEffect} from 'react';
import {
  onSnapshot,
  query,
  collection,
  where,
  type Firestore,
  type DocumentData,
  type Query,
  type CollectionReference,
} from 'firebase/firestore';
import { useFirestore } from '..';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useCollection<T>(path: string, uid?: string) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    if (!db) return;
    
    let unsubscribe: () => void;

    try {
      const ref = collection(db, path) as CollectionReference<T>;
      const q = uid ? query(ref, where('uid', '==', uid)) : ref;
  
      unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() as T }));
        setData(docs);
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error setting up collection listener:", error);
      setLoading(false);
    }


    return () => unsubscribe && unsubscribe();
  }, [path, uid, db]);

  return {data, loading};
}
