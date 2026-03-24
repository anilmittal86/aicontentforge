'use client';

import { useState } from 'react';

interface QueryData {
  query: string;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
  source: 'gsc' | 'bing' | 'gap';
}

interface QueryImportProps {
  onImport: (queries: QueryData[]) => void;
}

export default function QueryImport({ onImport }: QueryImportProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'gsc' | 'bing'>('gsc');
  const [textInput, setTextInput] = useState('');
  const [parsedQueries, setParsedQueries] = useState<QueryData[]>([]);
  const [error, setError] = useState('');

  const parseCSV = (text: string, source: 'gsc' | 'bing'): QueryData[] => {
    const lines = text.trim().split('\n');
    const queries: QueryData[] = [];

    const hasHeader = lines[0].toLowerCase().includes('query') || 
                      lines[0].toLowerCase().includes('querystring') ||
                      lines[0].toLowerCase().includes('clicks');
    
    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      
      if (parts.length >= 1 && parts[0]) {
        const query: QueryData = {
          query: parts[0],
          source,
        };

        if (source === 'gsc') {
          query.clicks = parseInt(parts[1]) || 0;
          query.impressions = parseInt(parts[2]) || 0;
          query.ctr = parseFloat(parts[3]) || 0;
          query.position = parseFloat(parts[4]) || 0;
        } else if (source === 'bing') {
          query.clicks = parseInt(parts[1]) || 0;
          query.impressions = parseInt(parts[2]) || 0;
          query.position = parseFloat(parts[3]) || 0;
        }

        queries.push(query);
      }
    }

    return queries;
  };

  const parseJSON = (text: string, source: 'gsc' | 'bing'): QueryData[] => {
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : data.d?.Results || data.results || [];
      
      return arr.map((item: any) => ({
        query: item.query || item.QueryString || item.queryString || '',
        clicks: item.clicks || item.Clicks || 0,
        impressions: item.impressions || item.Impressions || 0,
        ctr: item.ctr || item.CTR || item.clickRate || 0,
        position: item.position || item.Position || item.position || item.avgPosition || 0,
        source,
      })).filter((q: QueryData) => q.query);
    } catch {
      throw new Error('Invalid JSON format');
    }
  };

  const handleParse = () => {
    setError('');
    const trimmed = textInput.trim();
    
    if (!trimmed) {
      setError('Please paste some data first');
      return;
    }

    try {
      let queries: QueryData[];
      
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        queries = parseJSON(trimmed, activeTab);
      } else {
        queries = parseCSV(trimmed, activeTab);
      }

      if (queries.length === 0) {
        setError('No queries found in the data');
        return;
      }

      setParsedQueries(queries);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse data');
    }
  };

  const handleImport = () => {
    if (parsedQueries.length > 0) {
      onImport(parsedQueries);
      setTextInput('');
      setParsedQueries([]);
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-primary">Import Search Data</h2>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            GSC + Bing
          </span>
        </div>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <p className="text-sm text-text-secondary">
            Paste data from Google Search Console or Bing Webmaster to use as content ideas.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('gsc'); setParsedQueries([]); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'gsc' 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              Google Search Console
            </button>
            <button
              onClick={() => { setActiveTab('bing'); setParsedQueries([]); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'bing' 
                  ? 'bg-secondary text-white' 
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              Bing Webmaster
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Paste {activeTab === 'gsc' ? 'GSC' : 'Bing'} data (CSV or JSON)
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
              placeholder={`Paste your ${activeTab === 'gsc' ? 'GSC' : 'Bing'} export data here...\n\nCSV format:\nQuery, Clicks, Impressions, CTR, Position\nyour keyword, 100, 500, 0.2, 5.2\n\nJSON format:\n[{"query": "keyword", "clicks": 100, ...}]`}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none font-mono"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleParse}
            className="w-full px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Parse Data
          </button>

          {parsedQueries.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-primary">
                  {parsedQueries.length} queries found
                </h3>
                <span className="text-xs text-text-secondary uppercase">
                  From: {activeTab === 'gsc' ? 'Google Search Console' : 'Bing Webmaster'}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2">
                {parsedQueries.slice(0, 10).map((q, i) => (
                  <div key={i} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                    <span className="truncate flex-1 mr-2">{q.query}</span>
                    <div className="flex gap-3 text-xs text-text-secondary">
                      <span>C: {q.clicks}</span>
                      <span>I: {q.impressions}</span>
                      <span>P: {q.position?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
                {parsedQueries.length > 10 && (
                  <p className="text-xs text-text-secondary text-center">
                    + {parsedQueries.length - 10} more queries
                  </p>
                )}
              </div>

              <button
                onClick={handleImport}
                className="w-full px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-emerald-600"
              >
                Import as Content Ideas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
