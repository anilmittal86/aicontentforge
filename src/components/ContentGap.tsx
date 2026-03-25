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
    const seen = new Set<string>();
    
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Pattern 1: "quoted text" — competitor shown instead
    const quotePattern = /"([^"]{10,200})[""]?\s*[-–—]\s*([^,]+?)(?:\s+shown\s+instead)?/gi;
    let match;
    while ((match = quotePattern.exec(cleanText)) !== null) {
      const query = match[1].trim();
      const comps = match[2].split(',').map(c => c.trim().replace(/\s+shown\s+instead.*/i, '')).filter(c => c && c.length > 1);
      if (query && !seen.has(query.toLowerCase())) {
        seen.add(query.toLowerCase());
        results.push({ query, competitors: comps });
      }
    }
    
    // Pattern 2: Standalone quoted text (without dash)
    if (results.length === 0) {
      const standaloneQuotePattern = /"([^"]{15,300})[""]/g;
      while ((match = standaloneQuotePattern.exec(cleanText)) !== null) {
        const query = match[1].trim();
        if (query && query.length > 15 && !seen.has(query.toLowerCase())) {
          seen.add(query.toLowerCase());
          results.push({ query, competitors: [] });
        }
      }
    }
    
    // Pattern 3: Lines that look like search queries (question marks, "best", "list of", "how to", etc.)
    if (results.length === 0) {
      const lines = cleanText.split(/[.]\s*(?=[A-Z])|[;\n]/);
      const queryIndicators = [
        /^(what|how|why|which|when|where|can|should|is|are|do|does)\b/i,
        /\b(list of|best|top|compare|alternatives|review|vs|versus)\b/i,
        /\b(tools|platforms|software|services|companies|providers)\b/i,
        /\b(recommendations?|guide|tips|features|pricing)\b/i,
        /\?$/,
      ];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.length < 15 || trimmed.length > 250) continue;
        
        // Check if line looks like a query
        const isQuery = queryIndicators.some(pattern => pattern.test(trimmed));
        
        if (isQuery && !seen.has(trimmed.toLowerCase())) {
          seen.add(trimmed.toLowerCase());
          results.push({ query: trimmed, competitors: [] });
        }
      }
    }
    
    // Pattern 4: Extract phrases after specific keywords
    if (results.length === 0) {
      const keywords = [
        'query:', 'search:', 'question:', 'topic:',
        'for:', 'about:', 'on:', 
      ];
      
      for (const kw of keywords) {
        const kwPattern = new RegExp(kw + '\\s*([^.]{10,200})', 'gi');
        while ((match = kwPattern.exec(cleanText)) !== null) {
          const query = match[1].trim();
          if (query && !seen.has(query.toLowerCase())) {
            seen.add(query.toLowerCase());
            results.push({ query, competitors: [] });
          }
        }
      }
    }
    
    // Pattern 5: If nothing else, treat each line as a potential query
    if (results.length === 0) {
      const lines = cleanText.split(/[;\n]/);
      for (const line of lines) {
        const cleaned = line.replace(/^[-\d.)\s]+/, '').trim();
        if (cleaned.length > 20 && cleaned.length < 200 && !seen.has(cleaned.toLowerCase())) {
          // Skip lines that are just competitor names
          if (!/^(Profound|Semrush|Otterly|Yext|Athena|Peec|Passionfruit|Akupara)/i.test(cleaned)) {
            seen.add(cleaned.toLowerCase());
            results.push({ query: cleaned, competitors: [] });
          }
        }
      }
    }
    
    // Filter out any that are just competitor names
    const competitorNames = ['profound', 'semrush', 'otterly', 'yext', 'athena', 'peec', 'passionfruit', 'akupara', 'trackerly', 'nightwatch', 'authoritas', 'surva'];
    return results.filter(r => {
      const q = r.query.toLowerCase();
      return !competitorNames.some(c => q === c || q.startsWith(c + ' ') || q.endsWith(' ' + c));
    });
  };

  const handleImport = () => {
    if (!textInput.trim()) return;
    
    const parsed = parseText(textInput);
    if (parsed.length > 0) {
      setQueries(parsed);
    } else {
      // If still nothing, just use the whole text as one query
      const singleQuery = textInput.trim().replace(/\s+/g, ' ').substring(0, 200);
      if (singleQuery) {
        setQueries([{ query: singleQuery, competitors: [] }]);
      }
    }
  };

  const handleClear = () => {
    setQueries([]);
    setTextInput('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-700">Content Gap</h2>
        <p className="text-sm text-slate-500 mt-1">Import AI visibility report to find content opportunities</p>
      </div>

      <div className="px-6 py-4 space-y-4">
        {queries.length === 0 ? (
          <>
            <div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={8}
                placeholder="Paste your AI visibility gap report here, or any text containing search queries..."
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
                  onClick={() => onSelectQuery(q.query)}
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