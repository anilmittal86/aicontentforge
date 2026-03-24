'use client';

import { useState } from 'react';

interface ParsedQuery {
  query: string;
  competitors: string[];
}

interface ContentGapProps {
  onSelectQuery: (query: string) => void;
}

export default function ContentGap({ onSelectQuery }: ContentGapProps) {
  const [textInput, setTextInput] = useState('');
  const [queries, setQueries] = useState<ParsedQuery[]>([]);

  const parseText = (text: string): ParsedQuery[] => {
    const results: ParsedQuery[] = [];
    
    // Pattern 1: "Query text" — Competitor shown instead
    // Matches text between quotes followed by dash and competitors
    const quoteDashPattern = /"([^"]+)[""]?\s*[-–—]\s*([^,]+?)\s*shown instead/gi;
    let match;
    while ((match = quoteDashPattern.exec(text)) !== null) {
      const query = match[1].trim();
      const comps = match[2].split(',').map(c => c.trim()).filter(c => c);
      results.push({ query, competitors: comps });
    }
    
    // Pattern 2: "Query text" — Competitor1, Competitor2 shown instead
    const multiDashPattern = /"([^"]+)[""]?\s*[-–—]\s*(.+?)\s*shown instead/gi;
    while ((match = multiDashPattern.exec(text)) !== null) {
      const query = match[1].trim();
      const competitorPart = match[2];
      const comps = competitorPart.split(',').map(c => c.trim()).filter(c => c);
      if (comps.length > 1 || (results.length === 0 || results[results.length - 1].query !== query)) {
        if (!results.find(r => r.query === query)) {
          results.push({ query, competitors: comps });
        }
      }
    }
    
    // Pattern 3: Just quoted text (standalone queries)
    if (results.length === 0) {
      const standaloneQuotes = /"([^"]+)[""]?/g;
      while ((match = standaloneQuotes.exec(text)) !== null) {
        const query = match[1].trim();
        if (query.length > 10 && !results.find(r => r.query === query)) {
          results.push({ query, competitors: [] });
        }
      }
    }
    
    // Pattern 4: Lines starting with common query patterns
    if (results.length === 0) {
      const lines = text.split(/\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        const queryPatterns = [
          /^(List of .+?)[-–—,\s]/i,
          /^(Best .+?)[-–—,\s]/i,
          /^(Compare .+?)[-–—,\s]/i,
          /^(Alternatives to .+?)[-–—,\s]/i,
          /^(Affordable .+?)[-–—,\s]/i,
          /^(Top .+?)[-–—,\s]/i,
        ];
        
        for (const pattern of queryPatterns) {
          const m = trimmed.match(pattern);
          if (m) {
            const query = m[1].trim();
            if (query.length > 10 && !results.find(r => r.query === query)) {
              results.push({ query, competitors: [] });
              break;
            }
          }
        }
      }
    }
    
    return results;
  };

  const handleImport = () => {
    if (!textInput.trim()) return;
    
    const parsed = parseText(textInput);
    if (parsed.length > 0) {
      setQueries(parsed);
    } else {
      alert('Could not find any queries. Try pasting different format.');
    }
  };

  const handleClear = () => {
    setQueries([]);
    setTextInput('');
  };

  const handleSelectQuery = (query: ParsedQuery) => {
    onSelectQuery(query.query);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary">Content Gap</h2>
        <p className="text-sm text-text-secondary mt-1">Import AI visibility report to find content opportunities</p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {queries.length === 0 ? (
          <>
            <div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={8}
                placeholder="Paste your AI visibility gap report here..."
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
              />
            </div>

            <button
              onClick={handleImport}
              disabled={!textInput.trim()}
              className="w-full px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              Import Gap Report
            </button>
          </>
        ) : (
          <>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-text-secondary">
                <span className="font-medium text-primary">{queries.length}</span> gap queries found
              </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {queries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectQuery(q)}
                  className="w-full text-left p-4 border border-border rounded-lg hover:border-secondary hover:bg-secondary/5 transition-colors"
                >
                  <p className="text-sm text-primary font-medium">
                    {q.query}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={handleClear}
              className="w-full px-4 py-2 text-text-secondary hover:text-primary text-sm"
            >
              Clear & Import New Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}
