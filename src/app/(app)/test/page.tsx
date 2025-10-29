'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { LiveUpdate } from '@/lib/types';

export default function TestPage() {
  const firestore = useFirestore();
  const updatesQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'live_updates'), orderBy('createdAt', 'desc')) : null,
    [firestore]
  );
  const { data: liveUpdates, isLoading } = useCollection<LiveUpdate>(updatesQuery);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Test Page</h1>
      <h2>Firestore Object:</h2>
      <pre>{JSON.stringify(firestore, null, 2)}</pre>
      <h2>Live Updates:</h2>
      <pre>{JSON.stringify(liveUpdates, null, 2)}</pre>
    </div>
  );
}