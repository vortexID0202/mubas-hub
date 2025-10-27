
'use client';

import { Suspense } from 'react';
import SearchPageComponent from './SearchPageComponent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPageComponent />
    </Suspense>
  );
}
