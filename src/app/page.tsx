'use client';

import { useState } from 'react';
import { BrandGrounding, ContextGrounding, KeywordTag } from '@/types';
import BrandGroundingForm from '@/components/BrandGroundingForm';
import ContextGroundingForm from '@/components/ContextGroundingForm';
import KeywordInput from '@/components/KeywordInput';
import ContentGenerator from '@/components/ContentGenerator';
import ContentGap from '@/components/ContentGap';
import { useAuth } from '@/components/AuthContext';

function AppContent() {
  const { user, signOut } = useAuth();
  const [brand, setBrand] = useState<BrandGrounding | null>(null);
  const [context, setContext] = useState<ContextGrounding | null>(null);
  const [keywords, setKeywords] = useState<KeywordTag[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');

  const handleSelectQuery = (query: string) => {
    const defaults = {
      content_type: 'Blog post',
      platform: 'Company blog',
      goal: query,
      word_count_min: 800,
      word_count_max: 1500,
      reader_profile: '',
      reader_belief: '',
      key_objection: '',
      argument_structure: { hook: '', problem: '', evidence: '', solution: '', cta: '' },
      tone_notes: '',
      avoid: '',
    };
    
    setContext(prev => prev ? { ...prev, goal: query } : defaults);
  };

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
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">{user?.email}</span>
              <button
                onClick={() => signOut()}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'create' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <ContentGap onSelectQuery={handleSelectQuery} />
              
              <ContextGroundingForm 
                onChange={(c) => setContext(c)}
                initialContext={context}
              />
              
              <KeywordInput 
                keywords={keywords}
                onChange={setKeywords}
              />
              
              <BrandGroundingForm 
                onSelect={(b) => setBrand(b)} 
                selectedBrand={brand}
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
  const [savedContents] = useState<any[]>([]);

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
            {content.content?.substring(0, 200)}...
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {content.created_at ? new Date(content.created_at).toLocaleDateString() : 'Unknown date'}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(content.content)}
              className="px-3 py-1 text-sm text-secondary hover:bg-secondary/10 rounded"
            >
              Copy
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}