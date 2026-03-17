'use client';

import { useState } from 'react';
import { BrandGrounding, ContextGrounding, KeywordTag, GeneratedContent } from '@/types';
import { storage } from '@/lib/storage';

interface ContentGeneratorProps {
  brand: BrandGrounding | null;
  context: ContextGrounding | null;
  keywords: KeywordTag[];
}

interface Source {
  text: string;
  url: string;
}

export default function ContentGenerator({ brand, context, keywords }: ContentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [error, setError] = useState('');
  const [savedContents, setSavedContents] = useState<GeneratedContent[]>([]);

  const handleGenerate = async () => {
    if (!context?.goal) {
      setError('Please enter a Goal in Context settings.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, context, keywords }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate content');
      }

      const data = await response.json();
      setContent(data.content);
      setTitle(data.title || '');
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!content) return;
    
    const newContent: GeneratedContent = {
      title: title || 'Untitled',
      content,
      keywords,
      sources,
      brand_grounding_id: brand?.id,
      context_grounding_id: context?.id,
    };
    
    storage.saveGeneratedContent(newContent);
    setSavedContents(storage.getGeneratedContents());
    alert('Content saved!');
  };

  const loadSavedContent = (saved: GeneratedContent) => {
    setTitle(saved.title);
    setContent(saved.content);
    setSources(saved.sources);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  const handleExportMarkdown = () => {
    const fullContent = sources.length > 0 
      ? `${content}\n\n---\n\n**Sources:**\n${sources.map(s => `- [${s.text}](${s.url})`).join('\n')}`
      : content;
    
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'content'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Content Generator</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSavedContents(storage.getGeneratedContents())}
              className="px-3 py-1 text-sm text-text-secondary hover:text-primary"
            >
              Load Saved
            </button>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !context?.goal}
          className="w-full px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating data-rich content with sources...
            </>
          ) : (
            'Generate Content'
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {savedContents.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-border p-4">
          <h3 className="font-medium text-primary mb-3">Saved Content</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {savedContents.map(saved => (
              <button
                key={saved.id}
                onClick={() => loadSavedContent(saved)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
              >
                {saved.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {content && (
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="Enter title..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-1">Generated Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-y font-mono text-sm"
            />
          </div>

          {sources.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-primary mb-2">Sources</h4>
              <ul className="space-y-1">
                {sources.map((source, idx) => (
                  <li key={idx} className="text-sm">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                      {source.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Copy
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Export Markdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
