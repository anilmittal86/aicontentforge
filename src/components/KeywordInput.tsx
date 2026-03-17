'use client';

import { useState, KeyboardEvent } from 'react';
import { KeywordTag } from '@/types';

interface KeywordInputProps {
  keywords: KeywordTag[];
  onChange: (keywords: KeywordTag[]) => void;
}

export default function KeywordInput({ keywords, onChange }: KeywordInputProps) {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<'primary' | 'secondary'>('primary');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      const newKeyword: KeywordTag = {
        id: crypto.randomUUID(),
        name: input.trim(),
        priority,
      };
      onChange([...keywords, newKeyword]);
      setInput('');
    }
  };

  const removeKeyword = (id: string) => {
    onChange(keywords.filter(k => k.id !== id));
  };

  const togglePriority = (id: string) => {
    onChange(keywords.map(k => 
      k.id === id ? { ...k, priority: k.priority === 'primary' ? 'secondary' : 'primary' } : k
    ));
  };

  const primaryKeywords = keywords.filter(k => k.priority === 'primary');
  const secondaryKeywords = keywords.filter(k => k.priority === 'secondary');

  const hasKeywords = keywords.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-primary">Keywords</h2>
          {hasKeywords && (
            <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded">
              {primaryKeywords.length} primary, {secondaryKeywords.length} secondary
            </span>
          )}
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
        <div className="px-6 pb-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add keyword and press Enter..."
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'primary' | 'secondary')}
                className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
          </div>

          {hasKeywords && (
            <div className="flex flex-wrap gap-2">
              {primaryKeywords.map(kw => (
                <span
                  key={kw.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm"
                >
                  {kw.name}
                  <button
                    onClick={() => togglePriority(kw.id!)}
                    className="hover:text-primary"
                    title="Toggle"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeKeyword(kw.id!)}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
              {secondaryKeywords.map(kw => (
                <span
                  key={kw.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-sm"
                >
                  {kw.name}
                  <button
                    onClick={() => togglePriority(kw.id!)}
                    className="hover:text-primary"
                    title="Toggle"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => removeKeyword(kw.id!)}
                    className="hover:text-red-600 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {!hasKeywords && (
            <p className="text-sm text-text-secondary text-center py-2">
              No keywords added. Type and press Enter to add.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
