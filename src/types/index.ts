export interface BrandGrounding {
  id?: string;
  user_id?: string;
  brand_name: string;
  what_we_do: string;
  target_reader: string;
  our_differentiator: string;
  voice: string;
  we_sound_like: string;
  we_never_say: string;
  proprietary_terms: string;
  is_default?: boolean;
  created_at?: string;
}

export interface ArgumentStructure {
  hook: string;
  problem: string;
  evidence: string;
  solution: string;
  cta: string;
}

export interface ContextGrounding {
  id?: string;
  user_id?: string;
  content_type: string;
  platform: string;
  goal: string;
  word_count_min: number;
  word_count_max: number;
  reader_profile: string;
  reader_belief: string;
  key_objection: string;
  argument_structure: ArgumentStructure;
  tone_notes: string;
  avoid: string;
  created_at?: string;
}

export interface KeywordTag {
  id?: string;
  name: string;
  priority: 'primary' | 'secondary';
}

export interface GeneratedContent {
  id?: string;
  user_id?: string;
  brand_grounding_id?: string;
  context_grounding_id?: string;
  title: string;
  content: string;
  keywords: KeywordTag[];
  sources: { text: string; url: string }[];
  created_at?: string;
}

export type ContentType = 
  | 'Blog post'
  | 'LinkedIn post'
  | 'Email'
  | 'Tweet thread'
  | 'Newsletter'
  | 'Case study'
  | 'Whitepaper';

export type Platform = 
  | 'Medium'
  | 'LinkedIn'
  | 'Company blog'
  | 'Newsletter'
  | 'Twitter'
  | 'Substack';

export const CONTENT_TYPES: ContentType[] = [
  'Blog post',
  'LinkedIn post',
  'Email',
  'Tweet thread',
  'Newsletter',
  'Case study',
  'Whitepaper',
];

export const PLATFORMS: Platform[] = [
  'Medium',
  'LinkedIn',
  'Company blog',
  'Newsletter',
  'Twitter',
  'Substack',
];
