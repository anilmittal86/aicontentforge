'use client';

import { useState } from 'react';

interface GapQuery {
  query: string;
}

interface ImportedData {
  queries: GapQuery[];
}

interface ContentGapProps {
  onSelectQuery: (query: string) => void;
}

export default function ContentGap({ onSelectQuery }: ContentGapProps) {
  const [textInput, setTextInput] = useState('');
  const [importedData, setImportedData] = useState<ImportedData | null>(null);

  const parseText = (text: string): ImportedData => {
    const queries: GapQuery[] = [];
    
    // Split by newlines or numbered patterns
    const lines = text.split(/\n|(?=\d+\.)|(?=\")/);
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Pattern 1: Lines starting with "Query:" or similar
      const queryMatch1 = trimmed.match(/^["""]?["""]?["""]?(?:Query|query)[:\s]+(.+)/i);
      if (queryMatch1) {
        const query = queryMatch1[1].replace(/["""]/g, '').trim();
        if (query && query.length > 5) {
          queries.push({ query });
          continue;
        }
      }
      
      // Pattern 2: Quoted strings followed by "— ... shown instead" or "instead"
      const quoteMatch = trimmed.match(/^["""]([^"""]+)["""]/);
      if (quoteMatch) {
        const query = quoteMatch[1].trim();
        if (query && query.length > 5) {
          queries.push({ query });
          continue;
        }
      }
      
      // Pattern 3: Lines with quotes that contain a question or list-like structure
      const longQuoteMatch = trimmed.match(/["""]([^"""]+["""])/);
      if (longQuoteMatch && longQuoteMatch[1].length > 20) {
        const query = longQuoteMatch[1].replace(/["""]/g, '').trim();
        if (query && query.length > 10) {
          queries.push({ query });
          continue;
        }
      }
      
      // Pattern 4: Lines that look like search queries (contain: list, best, top, compare, how, what, etc.)
      const searchQueryPatterns = [
        /^(list of .+)/i,
        /^(best .+)/i,
        /^(top .+)/i,
        /^(compare .+)/i,
        /^(alternatives to .+)/i,
        /^(affordable .+)/i,
        /^(how to .+)/i,
        /^(what is .+)/i,
        /^(which .+)/i,
        /(.+\?$)/,
      ];
      
      for (const pattern of searchQueryPatterns) {
        const match = trimmed.match(pattern);
        if (match) {
          const query = match[1].replace(/["""]/g, '').trim();
          if (query && query.length > 10 && !queries.find(q => q.query === query)) {
            queries.push({ query });
            break;
          }
        }
      }
    }
    
    // If no queries found, try splitting by common separators
    if (queries.length === 0) {
      // Try splitting by dash, em-dash, or bullet
      const parts = text.split(/[-–—•]\s*(?=["""?])|(?:\d+\.)\s*/);
      for (const part of parts) {
        const cleaned = part.trim().replace(/["""]/g, '').trim();
        if (cleaned.length > 15 && cleaned.length < 300) {
          queries.push({ query: cleaned });
        }
      }
    }
    
    return { queries };
  };

  const handleImport = () => {
    if (!textInput.trim()) return;
    
    const parsed = parseText(textInput);
    if (parsed.queries.length > 0) {
      setImportedData(parsed);
    } else {
      alert('Could not find any queries. Try pasting different format.');
    }
  };

  const handleClear = () => {
    setImportedData(null);
    setTextInput('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary">Content Gap</h2>
        <p className="text-sm text-text-secondary mt-1">Import AI visibility report to find content opportunities</p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {!importedData ? (
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
                <span className="font-medium text-primary">{importedData.queries.length}</span> gap queries found
              </p>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {importedData.queries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSelectQuery(q.query)}
                  className="w-full text-left p-3 border border-border rounded-lg hover:border-secondary hover:bg-secondary/5 transition-colors"
                >
                  <p className="text-sm text-primary font-medium line-clamp-2">
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
