import { config } from 'dotenv';
config();

import '@/ai/flows/hybrid-search-suggestions.ts';
import '@/ai/flows/community-forum-answer-ranker.ts';
import '@/ai/flows/knowledge-base-suggester.ts';
import '@/ai/flows/hybrid-search.ts';
