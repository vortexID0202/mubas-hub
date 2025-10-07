
'use client';
import {useState, useEffect} from 'react';
import {
  onSnapshot,
  doc,
  type Firestore,
  type DocumentData,
} from 'firebase/firestore';
import { useFirestore } from '..';
import { FirestorePermissionError } from '../errors';
import { errorEmitter } from '../error-emitter';

export function useDoc<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();

  useEffect(() => {
    if (!db) return;

    let unsubscribe: () => void;

    try {
        const ref = doc(db, path);
        unsubscribe = onSnapshot(ref, (snapshot) => {
          if (snapshot.exists()) {
            setData({id: snapshot.id, ...snapshot.data()} as T);
          } else {
            setData(null);
          }
          setLoading(false);
        },
        async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });
    } catch (error) {
        console.error("Error setting up document listener:", error);
        setLoading(false);
    }
    

    return () => unsubscribe && unsubscribe();
  }, [path, db]);

  return {data, loading};
}
