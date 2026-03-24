'use client';

import { useState } from 'react';

interface GapQuery {
  query: string;
  missingOn: string;
  whySkipped: string;
  recommendedAsset: string;
  evidence: string;
  distributionTargets: string[];
}

interface ImportedData {
  brand: string;
  competitors: string[];
  queries: GapQuery[];
}

interface ContentGapProps {
  onSelectQuery: (query: string) => void;
}

export default function ContentGap({ onSelectQuery }: ContentGapProps) {
  const [textInput, setTextInput] = useState('');
  const [importedData, setImportedData] = useState<ImportedData | null>(null);

  const parseText = (text: string): ImportedData | null => {
    const lines = text.trim().split('\n');
    const data: ImportedData = {
      brand: '',
      competitors: [],
      queries: [],
    };

    let currentQuery: Partial<GapQuery> | null = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('Missing from') || trimmed.startsWith('is missing from')) {
        const match = trimmed.match(/^([^,]+)/);
        if (match) {
          data.brand = match[1].trim();
        }
        const compMatch = trimmed.match(/appear instead\.\s*(.+?)\s*Prioritize/);
        if (compMatch) {
          data.competitors = compMatch[1].split(' and ').map(c => c.trim()).filter(c => c);
        }
      }
      
      if (trimmed.startsWith('Query:')) {
        if (currentQuery?.query) {
          data.queries.push(currentQuery as GapQuery);
        }
        currentQuery = {
          query: trimmed.replace('Query:', '').trim(),
          distributionTargets: [],
        };
      }
      
      if (trimmed.startsWith('Missing on:')) {
        if (currentQuery) {
          currentQuery.missingOn = trimmed.replace('Missing on:', '').trim();
        }
      }
      
      if (trimmed.startsWith('Why AI skipped you:')) {
        if (currentQuery) {
          currentQuery.whySkipped = trimmed.replace('Why AI skipped you:', '').trim();
        }
      }
      
      if (trimmed.startsWith('Recommended asset:')) {
        if (currentQuery) {
          currentQuery.recommendedAsset = trimmed.replace('Recommended asset:', '').trim();
        }
      }
      
      if (trimmed.startsWith('Evidence to strengthen:')) {
        if (currentQuery) {
          currentQuery.evidence = trimmed.replace('Evidence to strengthen:', '').trim();
        }
      }
      
      if (trimmed.startsWith('Distribution targets:')) {
        if (currentQuery) {
          currentQuery.distributionTargets = trimmed
            .replace('Distribution targets:', '')
            .split(',')
            .map(t => t.trim())
            .filter(t => t);
        }
      }
    }

    if (currentQuery?.query) {
      data.queries.push(currentQuery as GapQuery);
    }

    if (data.queries.length === 0) {
      return null;
    }

    return data;
  };

  const handleImport = () => {
    const parsed = parseText(textInput);
    if (parsed) {
      setImportedData(parsed);
    } else {
      alert('Could not parse data. Please check the format.');
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
                {importedData.competitors.length > 0 && (
                  <span> • Competing with: {importedData.competitors.join(', ')}</span>
                )}
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
