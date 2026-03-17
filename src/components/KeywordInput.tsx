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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-primary">Keyword & Tag Guidance</h2>
        <p className="text-sm text-text-secondary mt-1">Tell AI what signals to build in</p>
      </div>

      <div className="px-6 py-4 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter keyword and press Enter..."
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

        {primaryKeywords.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Primary Keywords</h3>
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
                    title="Toggle to secondary"
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
            </div>
          </div>
        )}

        {secondaryKeywords.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">Secondary Keywords / Tags</h3>
            <div className="flex flex-wrap gap-2">
              {secondaryKeywords.map(kw => (
                <span
                  key={kw.id}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-text-secondary rounded-full text-sm"
                >
                  {kw.name}
                  <button
                    onClick={() => togglePriority(kw.id!)}
                    className="hover:text-primary"
                    title="Toggle to primary"
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
          </div>
        )}

        {keywords.length === 0 && (
          <p className="text-sm text-text-secondary text-center py-4">
            No keywords added yet. Type a keyword and press Enter to add it.
          </p>
        )}
      </div>
    </div>
  );
}
