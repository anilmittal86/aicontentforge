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

interface GapAnalysisImportProps {
  onImport: (data: ImportedData) => void;
}

export default function GapAnalysisImport({ onImport }: GapAnalysisImportProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [parsedData, setParsedData] = useState<ImportedData | null>(null);

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

  const handleParse = () => {
    const parsed = parseText(textInput);
    if (parsed) {
      setParsedData(parsed);
    } else {
      alert('Could not parse data. Please check the format.');
    }
  };

  const handleImport = () => {
    if (parsedData) {
      onImport(parsedData);
      setTextInput('');
      setParsedData(null);
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
          <h2 className="text-lg font-semibold text-primary">Gap Analysis / Report Data</h2>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
            AI Content Ideas
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
            Paste gap analysis data from your AI visibility report to generate content briefs.
          </p>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Paste Report Data
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
              placeholder={`Paste data like:\n\nITC Rajputana... is missing from 10 relevant queries where\nRambagh Palace and Fairmont Jaipur appear instead.\n\nQuery: List of heritage 5-star hotels...\nMissing on: Gemini only\n...`}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none font-mono"
            />
          </div>

          <button
            onClick={handleParse}
            className="w-full px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Parse Data
          </button>

          {parsedData && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <h3 className="font-medium text-primary">Parsed Data:</h3>
              <p className="text-sm"><strong>Brand:</strong> {parsedData.brand}</p>
              <p className="text-sm"><strong>Competitors:</strong> {parsedData.competitors.join(', ')}</p>
              <p className="text-sm"><strong>Queries Found:</strong> {parsedData.queries.length}</p>
              
              <div className="max-h-40 overflow-y-auto space-y-2">
                {parsedData.queries.map((q, i) => (
                  <div key={i} className="text-xs bg-white p-2 rounded border">
                    <p className="font-medium">{q.query?.substring(0, 60)}...</p>
                    <p className="text-text-secondary">Missing on: {q.missingOn}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleImport}
                className="w-full px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-emerald-600"
              >
                Use for Content Generation
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
