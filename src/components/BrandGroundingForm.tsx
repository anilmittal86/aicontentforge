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
  const [urlInput, setUrlInput] = useState('');

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

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    
    if (!url) return;
    
    let brandName = '';
    try {
      const urlObj = new URL(url.startsWith('http') ? url : 'https://' + url);
      brandName = urlObj.hostname.replace(/^www\./, '').split('.')[0];
      brandName = brandName.charAt(0).toUpperCase() + brandName.slice(1);
    } catch {
      brandName = url.split('.')[0];
    }
    
    setForm({
      ...form,
      brand_name: brandName,
      what_we_do: 'Providing products/services for customers',
      target_reader: 'Your target audience',
      our_differentiator: 'What makes you unique',
      voice: 'Professional, helpful, clear',
      we_sound_like: 'Write like a knowledgeable expert',
      we_never_say: 'Generic marketing jargon',
      proprietary_terms: '',
    });
  };

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
    setUrlInput('');
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
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-700">Brand Grounding</h2>
          {form.brand_name && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
              {form.brand_name}
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company Website (auto-fills brand info)
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={form.brand_name}
                onChange={(e) => handleChange('brand_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Voice</label>
              <input
                type="text"
                value={form.voice}
                onChange={(e) => handleChange('voice', e.target.value)}
                placeholder="e.g., Direct, data-backed"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">What We Do</label>
            <input
              type="text"
              value={form.what_we_do}
              onChange={(e) => handleChange('what_we_do', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-slate-500 hover:underline"
          >
            {showAdvanced ? 'Hide' : 'Show'} more options
          </button>

          {showAdvanced && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Reader</label>
                <textarea
                  value={form.target_reader}
                  onChange={(e) => handleChange('target_reader', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Our Differentiator</label>
                <textarea
                  value={form.our_differentiator}
                  onChange={(e) => handleChange('our_differentiator', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">We Sound Like</label>
                <textarea
                  value={form.we_sound_like}
                  onChange={(e) => handleChange('we_sound_like', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">We Never Say</label>
                <textarea
                  value={form.we_never_say}
                  onChange={(e) => handleChange('we_never_say', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800"
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