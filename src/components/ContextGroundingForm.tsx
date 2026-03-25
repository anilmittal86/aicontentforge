'use client';

import { useState, useEffect } from 'react';
import { ContextGrounding, ArgumentStructure, CONTENT_TYPES, PLATFORMS } from '@/types';

interface ContextGroundingFormProps {
  onSave?: (context: ContextGrounding) => void;
  onChange?: (context: ContextGrounding) => void;
  initialContext?: ContextGrounding | null;
}

const emptyContext: ContextGrounding = {
  content_type: 'Blog post',
  platform: 'Company blog',
  goal: '',
  word_count_min: 800,
  word_count_max: 1500,
  reader_profile: '',
  reader_belief: '',
  key_objection: '',
  argument_structure: {
    hook: '',
    problem: '',
    evidence: '',
    solution: '',
    cta: '',
  },
  tone_notes: '',
  avoid: '',
};

export default function ContextGroundingForm({ onSave, onChange, initialContext }: ContextGroundingFormProps) {
  const [form, setForm] = useState<ContextGrounding>(initialContext || emptyContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (initialContext) {
      setForm(initialContext);
    }
  }, [initialContext]);

  const handleChange = (field: keyof ContextGrounding, value: string | number) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    onChange?.(updated);
  };

  const handleArgChange = (field: keyof ArgumentStructure, value: string) => {
    const updated = {
      ...form,
      argument_structure: { ...form.argument_structure, [field]: value },
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleSave = () => {
    onSave?.(form);
  };

  const argLabels: Record<keyof ArgumentStructure, string> = {
    hook: '1. Hook',
    problem: '2. Problem',
    evidence: '3. Evidence',
    solution: '4. Solution',
    cta: '5. CTA',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-700">Context</h2>
          {form.content_type && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
              {form.content_type} • {form.platform}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Content Type</label>
              <select
                value={form.content_type}
                onChange={(e) => handleChange('content_type', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {CONTENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => handleChange('platform', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                {PLATFORMS.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Goal *</label>
            <textarea
              value={form.goal}
              onChange={(e) => handleChange('goal', e.target.value)}
              placeholder="What should the reader do, feel, or believe after reading?"
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Word Count: {form.word_count_min} - {form.word_count_max}
            </label>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-text-secondary">100</span>
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={form.word_count_min}
                onChange={(e) => handleChange('word_count_min', parseInt(e.target.value))}
                className="flex-1"
              />
              <input
                type="range"
                min={100}
                max={5000}
                step={100}
                value={form.word_count_max}
                onChange={(e) => handleChange('word_count_max', parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-text-secondary">5000</span>
            </div>
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
                <label className="block text-sm font-medium text-text-primary mb-1">Reader Profile</label>
                <textarea
                  value={form.reader_profile}
                  onChange={(e) => handleChange('reader_profile', e.target.value)}
                  placeholder="Who is reading this?"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Reader's Current Belief</label>
                <textarea
                  value={form.reader_belief}
                  onChange={(e) => handleChange('reader_belief', e.target.value)}
                  placeholder="What do they think now?"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Key Objection</label>
                <textarea
                  value={form.key_objection}
                  onChange={(e) => handleChange('key_objection', e.target.value)}
                  placeholder="What will they push back on?"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-primary mb-2">Argument Structure</h3>
                <div className="space-y-2">
                  {(Object.keys(argLabels) as Array<keyof ArgumentStructure>).map((key) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-text-secondary mb-1">
                        {argLabels[key]}
                      </label>
                      <textarea
                        value={form.argument_structure[key]}
                        onChange={(e) => handleArgChange(key, e.target.value)}
                        rows={1}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                        placeholder={`Enter ${key}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Tone Notes</label>
                <textarea
                  value={form.tone_notes}
                  onChange={(e) => handleChange('tone_notes', e.target.value)}
                  placeholder="Any tonal guidance?"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Avoid</label>
                <textarea
                  value={form.avoid}
                  onChange={(e) => handleChange('avoid', e.target.value)}
                  placeholder="What to avoid?"
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-secondary text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Save Context
          </button>
        </div>
      )}
    </div>
  );
}
