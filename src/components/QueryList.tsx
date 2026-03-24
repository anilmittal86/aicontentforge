'use client';

import { useState, useEffect } from 'react';
import { queryStore, QueryData } from '@/lib/queries';

interface QueryListProps {
  onSelect: (query: QueryData) => void;
}

export default function QueryList({ onSelect }: QueryListProps) {
  const [queries, setQueries] = useState<QueryData[]>([]);
  const [filter, setFilter] = useState<'all' | 'gsc' | 'bing' | 'gap' | 'unused'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'clicks' | 'impressions'>('recent');

  useEffect(() => {
    setQueries(queryStore.getQueries());
  }, []);

  const handleDelete = (id: string) => {
    queryStore.deleteQuery(id);
    setQueries(queryStore.getQueries());
  };

  const handleClearAll = () => {
    if (confirm('Clear all imported queries?')) {
      queryStore.clearAll();
      setQueries([]);
    }
  };

  const filteredQueries = queries
    .filter(q => {
      if (filter === 'all') return true;
      if (filter === 'unused') return !q.used;
      return q.source === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'clicks') return (b.clicks || 0) - (a.clicks || 0);
      if (sortBy === 'impressions') return (b.impressions || 0) - (a.impressions || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const sourceLabels = {
    gsc: { label: 'GSC', color: 'bg-green-100 text-green-800' },
    bing: { label: 'Bing', color: 'bg-purple-100 text-purple-800' },
    gap: { label: 'Gap', color: 'bg-yellow-100 text-yellow-800' },
  };

  if (queries.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-primary">Content Ideas</h2>
          <span className="text-sm text-text-secondary">
            {queries.length} queries
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['all', 'unused', 'gsc', 'bing', 'gap'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs font-medium ${
                filter === f 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'unused' && ` (${queries.filter(q => !q.used).length})`}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mt-2">
          {(['recent', 'clicks', 'impressions'] as const).map(s => (
            <select
              key={s}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2 py-1 text-xs border border-border rounded"
            >
              <option value="recent">Recent</option>
              <option value="clicks">Most Clicks</option>
              <option value="impressions">Most Impressions</option>
            </select>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 max-h-96 overflow-y-auto">
        {filteredQueries.length === 0 ? (
          <p className="text-sm text-text-secondary text-center py-4">
            No queries match this filter
          </p>
        ) : (
          <div className="space-y-2">
            {filteredQueries.map(q => (
              <div 
                key={q.id} 
                className={`p-3 rounded-lg border ${
                  q.used ? 'bg-gray-50 opacity-60' : 'bg-white hover:border-secondary cursor-pointer'
                }`}
                onClick={() => !q.used && onSelect(q)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-primary truncate">
                      {q.query}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded ${sourceLabels[q.source].color}`}>
                        {sourceLabels[q.source].label}
                      </span>
                      {q.clicks !== undefined && (
                        <span className="text-xs text-text-secondary">
                          C: {q.clicks}
                        </span>
                      )}
                      {q.impressions !== undefined && (
                        <span className="text-xs text-text-secondary">
                          I: {q.impressions}
                        </span>
                      )}
                      {q.position !== undefined && (
                        <span className="text-xs text-text-secondary">
                          Pos: {q.position.toFixed(1)}
                        </span>
                      )}
                      {q.competitors && q.competitors.length > 0 && (
                        <span className="text-xs text-text-secondary truncate">
                          vs {q.competitors.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(q.id);
                    }}
                    className="text-text-secondary hover:text-red-600 p-1"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-border">
        <button
          onClick={handleClearAll}
          className="text-xs text-red-600 hover:underline"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
