
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, MessageSquare, Search } from 'lucide-react';
import type { HybridSearchSuggestionsOutput } from '@/ai/flows/hybrid-search-suggestions';
import { getSearchSuggestions } from '@/app/actions';

import { debounce } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] =
    useState<HybridSearchSuggestionsOutput['suggestions']>();
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };


  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length > 2) {
        setLoading(true);
        try {
          const result = await getSearchSuggestions({ query: searchQuery });
          setSuggestions(result.suggestions);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedGetSuggestions(query);
  }, [query, debouncedGetSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={searchRef}>
       <form onSubmit={handleSearch}>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Search for solutions or ask a question..."
            className="w-full rounded-full bg-background py-6 pl-10 pr-4 text-base text-black dark:text-white transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            />
            {loading && (
            <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
        </div>
      </form>
      {showSuggestions && (suggestions?.length ?? 0) > 0 && (
        <div className="absolute top-full z-10 mt-2 w-full rounded-lg border bg-card shadow-lg animate-in fade-in-0 zoom-in-95">
          <div className="p-2">
            {suggestions?.map((suggestion, index) => (
              <Link
                href={
                  suggestion.type === 'knowledgeBase'
                    ? `/kb/${index + 1}`
                    : `/questions/${index + 1}`
                }
                key={index}
                className="block"
                onClick={() => setShowSuggestions(false)}
              >
                <div className="flex items-start gap-3 rounded-md p-3 transition-colors hover:bg-muted">
                  {suggestion.type === 'knowledgeBase' ? (
                    <BookOpen className="h-5 w-5 flex-shrink-0 text-accent" />
                  ) : (
                    <MessageSquare className="h-5 w-5 flex-shrink-0 text-primary" />
                  )}
                  <div className="flex-grow">
                    <p className="font-semibold">{suggestion.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
