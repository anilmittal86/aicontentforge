'use client';

import { useState, useEffect } from 'react';
import { BrandGrounding } from '@/types';
import { storage } from '@/lib/storage';

interface BrandGroundingFormProps {
  onSave?: (brand: BrandGrounding) => void;
  onSelect?: (brand: BrandGrounding) => void;
  selectedBrand?: BrandGrounding | null;
}

const emptyBrand: BrandGrounding = {
  brand_name: '',
  what_we_do: '',
  target_reader: '',
  our_differentiator: '',
  voice: '',
  we_sound_like: '',
  we_never_say: '',
  proprietary_terms: '',
};

export default function BrandGroundingForm({ onSave, onSelect, selectedBrand }: BrandGroundingFormProps) {
  const [form, setForm] = useState<BrandGrounding>(emptyBrand);
  const [savedBrands, setSavedBrands] = useState<BrandGrounding[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setSavedBrands(storage.getBrandGroundings());
    const activeId = storage.getActiveBrandId();
    if (activeId) {
      setSelectedId(activeId);
    }
  }, []);

  useEffect(() => {
    if (selectedBrand) {
      setForm(selectedBrand);
      setSelectedId(selectedBrand.id || '');
    }
  }, [selectedBrand]);

  const handleChange = (field: keyof BrandGrounding, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const saved = storage.saveBrandGrounding(form);
    setSavedBrands(storage.getBrandGroundings());
    storage.setActiveBrandId(saved.id || null);
    setSelectedId(saved.id || '');
    onSave?.(saved);
  };

  const handleLoad = (brand: BrandGrounding) => {
    setForm(brand);
    setSelectedId(brand.id || '');
    storage.setActiveBrandId(brand.id || null);
    onSelect?.(brand);
  };

  const handleNew = () => {
    setForm(emptyBrand);
    setSelectedId('');
    storage.setActiveBrandId(null);
  };

  const handleDelete = (id: string) => {
    storage.deleteBrandGrounding(id);
    setSavedBrands(storage.getBrandGroundings());
    if (selectedId === id) {
      handleNew();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-primary">Brand Grounding</h2>
          {form.brand_name && (
            <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-xs rounded">
              {form.brand_name}
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
        <div className="px-6 pb-6 space-y-4">
          {savedBrands.length > 0 && (
            <div className="flex gap-2 items-center mb-4">
              <select
                value={selectedId}
                onChange={(e) => {
                  const brand = savedBrands.find(b => b.id === e.target.value);
                  if (brand) handleLoad(brand);
                }}
                className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">Select saved brand...</option>
                {savedBrands.map(brand => (
                  <option key={brand.id} value={brand.id!}>
                    {brand.brand_name || 'Untitled'}
                  </option>
                ))}
              </select>
              <button
                onClick={handleNew}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                New
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Brand Name</label>
            <input
              type="text"
              value={form.brand_name}
              onChange={(e) => handleChange('brand_name', e.target.value)}
              placeholder="Your brand name"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">What We Do</label>
            <input
              type="text"
              value={form.what_we_do}
              onChange={(e) => handleChange('what_we_do', e.target.value)}
              placeholder="One sentence about your product"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-secondary hover:underline"
          >
            {showAdvanced ? 'Hide' : 'Show'} advanced options
          </button>

          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-border">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Target Reader</label>
                <textarea
                  value={form.target_reader}
                  onChange={(e) => handleChange('target_reader', e.target.value)}
                  placeholder="Who is this for?"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Our Differentiator</label>
                <textarea
                  value={form.our_differentiator}
                  onChange={(e) => handleChange('our_differentiator', e.target.value)}
                  placeholder="What makes you different?"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Voice</label>
                <input
                  type="text"
                  value={form.voice}
                  onChange={(e) => handleChange('voice', e.target.value)}
                  placeholder="e.g., Direct, data-backed, no fluff"
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">We Sound Like</label>
                <textarea
                  value={form.we_sound_like}
                  onChange={(e) => handleChange('we_sound_like', e.target.value)}
                  placeholder="Sample content that represents your voice"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">We Never Say</label>
                <textarea
                  value={form.we_never_say}
                  onChange={(e) => handleChange('we_never_say', e.target.value)}
                  placeholder="Phrases to avoid"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Proprietary Terms</label>
                <textarea
                  value={form.proprietary_terms}
                  onChange={(e) => handleChange('proprietary_terms', e.target.value)}
                  placeholder="Branded terms to use"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-blue-600"
            >
              Save
            </button>
            {form.id && (
              <button
                onClick={() => form.id && handleDelete(form.id)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
