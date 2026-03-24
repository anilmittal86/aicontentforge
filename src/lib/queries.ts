import { storage } from './storage';

export interface QueryData {
  id: string;
  query: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  source: 'gsc' | 'bing' | 'gap';
  missingOn?: string;
  competitors?: string[];
  used?: boolean;
  createdAt: string;
}

const QUERIES_KEY = 'aicf_imported_queries';

export const queryStore = {
  getQueries: (): QueryData[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(QUERIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveQueries: (queries: QueryData[]): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(QUERIES_KEY, JSON.stringify(queries));
  },

  addQueries: (newQueries: QueryData[]): QueryData[] => {
    const existing = queryStore.getQueries();
    const existingQueries = new Set(existing.map(q => q.query.toLowerCase()));
    
    const uniqueNew = newQueries
      .filter(q => !existingQueries.has(q.query.toLowerCase()))
      .map(q => ({
        ...q,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }));
    
    const combined = [...existing, ...uniqueNew];
    queryStore.saveQueries(combined);
    return combined;
  },

  markAsUsed: (id: string): void => {
    const queries = queryStore.getQueries();
    const updated = queries.map(q => q.id === id ? { ...q, used: true } : q);
    queryStore.saveQueries(updated);
  },

  deleteQuery: (id: string): void => {
    const queries = queryStore.getQueries().filter(q => q.id !== id);
    queryStore.saveQueries(queries);
  },

  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(QUERIES_KEY);
  },

  getUnusedQueries: (): QueryData[] => {
    return queryStore.getQueries().filter(q => !q.used);
  },

  getBySource: (source: 'gsc' | 'bing' | 'gap'): QueryData[] => {
    return queryStore.getQueries().filter(q => q.source === source);
  },
};
