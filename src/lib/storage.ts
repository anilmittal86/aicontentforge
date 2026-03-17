import { BrandGrounding, ContextGrounding, GeneratedContent } from '@/types';

const STORAGE_KEYS = {
  BRAND_GROUNDINGS: 'aicf_brand_groundings',
  CONTEXT_GROUNDINGS: 'aicf_context_groundings',
  GENERATED_CONTENTS: 'aicf_generated_contents',
  ACTIVE_BRAND_ID: 'aicf_active_brand_id',
};

const browserStorage = typeof window !== 'undefined' ? window.localStorage : null;

export const storage = {
  getBrandGroundings: (): BrandGrounding[] => {
    if (!browserStorage) return [];
    const data = browserStorage.getItem(STORAGE_KEYS.BRAND_GROUNDINGS);
    return data ? JSON.parse(data) : [];
  },

  saveBrandGrounding: (brand: BrandGrounding): BrandGrounding => {
    const brands = storage.getBrandGroundings();
    const now = new Date().toISOString();
    
    if (brand.id) {
      const index = brands.findIndex(b => b.id === brand.id);
      if (index !== -1) {
        brands[index] = { ...brand, created_at: now };
      }
    } else {
      brand.id = crypto.randomUUID();
      brand.created_at = now;
      brands.push(brand);
    }
    
    browserStorage?.setItem(STORAGE_KEYS.BRAND_GROUNDINGS, JSON.stringify(brands));
    return brand;
  },

  deleteBrandGrounding: (id: string): void => {
    const brands = storage.getBrandGroundings().filter(b => b.id !== id);
    browserStorage?.setItem(STORAGE_KEYS.BRAND_GROUNDINGS, JSON.stringify(brands));
  },

  getContextGroundings: (): ContextGrounding[] => {
    if (!browserStorage) return [];
    const data = browserStorage.getItem(STORAGE_KEYS.CONTEXT_GROUNDINGS);
    return data ? JSON.parse(data) : [];
  },

  saveContextGrounding: (context: ContextGrounding): ContextGrounding => {
    const contexts = storage.getContextGroundings();
    const now = new Date().toISOString();
    
    if (context.id) {
      const index = contexts.findIndex(c => c.id === context.id);
      if (index !== -1) {
        contexts[index] = { ...context, created_at: now };
      }
    } else {
      context.id = crypto.randomUUID();
      context.created_at = now;
      contexts.push(context);
    }
    
    browserStorage?.setItem(STORAGE_KEYS.CONTEXT_GROUNDINGS, JSON.stringify(contexts));
    return context;
  },

  deleteContextGrounding: (id: string): void => {
    const contexts = storage.getContextGroundings().filter(c => c.id !== id);
    browserStorage?.setItem(STORAGE_KEYS.CONTEXT_GROUNDINGS, JSON.stringify(contexts));
  },

  getGeneratedContents: (): GeneratedContent[] => {
    if (!browserStorage) return [];
    const data = browserStorage.getItem(STORAGE_KEYS.GENERATED_CONTENTS);
    return data ? JSON.parse(data) : [];
  },

  saveGeneratedContent: (content: GeneratedContent): GeneratedContent => {
    const contents = storage.getGeneratedContents();
    const now = new Date().toISOString();
    
    if (content.id) {
      const index = contents.findIndex(c => c.id === content.id);
      if (index !== -1) {
        contents[index] = { ...content, created_at: now };
      }
    } else {
      content.id = crypto.randomUUID();
      content.created_at = now;
      contents.push(content);
    }
    
    browserStorage?.setItem(STORAGE_KEYS.GENERATED_CONTENTS, JSON.stringify(contents));
    return content;
  },

  deleteGeneratedContent: (id: string): void => {
    const contents = storage.getGeneratedContents().filter(c => c.id !== id);
    browserStorage?.setItem(STORAGE_KEYS.GENERATED_CONTENTS, JSON.stringify(contents));
  },

  getActiveBrandId: (): string | null => {
    if (!browserStorage) return null;
    return browserStorage.getItem(STORAGE_KEYS.ACTIVE_BRAND_ID);
  },

  setActiveBrandId: (id: string | null): void => {
    if (!browserStorage) return;
    if (id) {
      browserStorage.setItem(STORAGE_KEYS.ACTIVE_BRAND_ID, id);
    } else {
      browserStorage.removeItem(STORAGE_KEYS.ACTIVE_BRAND_ID);
    }
  },
};
