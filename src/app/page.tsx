'use client';

import { useState } from 'react';
import { BrandGrounding, ContextGrounding, KeywordTag } from '@/types';
import BrandGroundingForm from '@/components/BrandGroundingForm';
import ContextGroundingForm from '@/components/ContextGroundingForm';
import KeywordInput from '@/components/KeywordInput';
import ContentGenerator from '@/components/ContentGenerator';

export default function Home() {
  const [brand, setBrand] = useState<BrandGrounding | null>(null);
  const [context, setContext] = useState<ContextGrounding | null>(null);
  const [keywords, setKeywords] = useState<KeywordTag[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  return (
    <div className="min-h-screen">
      <header className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#3B82F6"/>
                <path d="M8 12h16M8 16h12M8 20h14" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="24" cy="20" r="4" fill="#10B981"/>
              </svg>
              <h1 className="text-xl font-bold">AI Content Forge</h1>
            </div>
            <nav className="flex gap-4">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'create' 
                    ? 'bg-secondary text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Create Content
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'saved' 
                    ? 'bg-secondary text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Saved Content
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <BrandGroundingForm 
                onSelect={(b) => setBrand(b)} 
                selectedBrand={brand}
              />
              <ContextGroundingForm 
                onChange={(c) => setContext(c)}
                initialContext={context}
              />
              <KeywordInput 
                keywords={keywords}
                onChange={setKeywords}
              />
            </div>
            <div className="lg:col-span-2">
              <ContentGenerator 
                brand={brand}
                context={context}
                keywords={keywords}
              />
            </div>
          </div>
        ) : (
          <SavedContentView />
        )}
      </main>

      <footer className="bg-white border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-text-secondary">
            AI Content Forge — Data-rich content with sources
          </p>
        </div>
      </footer>
    </div>
  );
}

function SavedContentView() {
  const [savedContents, setSavedContents] = useState(() => {
    if (typeof window !== 'undefined') {
      const { storage } = require('@/lib/storage');
      return storage.getGeneratedContents();
    }
    return [];
  });

  const handleDelete = (id: string) => {
    const { storage } = require('@/lib/storage');
    storage.deleteGeneratedContent(id);
    setSavedContents(storage.getGeneratedContents());
  };

  if (savedContents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">No saved content yet. Create your first piece!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {savedContents.map((content: any) => (
        <div key={content.id} className="bg-white rounded-lg shadow-sm border border-border p-6">
          <h3 className="font-semibold text-primary mb-2">{content.title}</h3>
          <p className="text-sm text-text-secondary mb-4 line-clamp-3">
            {content.content.substring(0, 200)}...
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {content.created_at ? new Date(content.created_at).toLocaleDateString() : 'Unknown date'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(content.content)}
                className="px-3 py-1 text-sm text-secondary hover:bg-secondary/10 rounded"
              >
                Copy
              </button>
              <button
                onClick={() => handleDelete(content.id)}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
          </div>
          {content.keywords && content.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {content.keywords.map((kw: any, idx: number) => (
                <span 
                  key={idx} 
                  className={`text-xs px-2 py-0.5 rounded ${
                    kw.priority === 'primary' 
                      ? 'bg-secondary/10 text-secondary' 
                      : 'bg-gray-100 text-text-secondary'
                  }`}
                >
                  {kw.name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
