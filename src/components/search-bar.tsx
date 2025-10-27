
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, MessageSquare, Search } from 'lucide-react';

import { debounce } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative w-full">
       <form onSubmit={handleSearch}>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Search for solutions or ask a question..."
            className="w-full rounded-full bg-background py-6 pl-10 pr-4 text-base text-black dark:text-white transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            />
            {loading && (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
        </div>
      </form>
    </div>
  );
}
