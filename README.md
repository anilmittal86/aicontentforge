# AI Content Forge - Specification Document

## 1. Project Overview

**Project Name:** AI Content Forge  
**Type:** Web Application (Next.js)  
**Core Functionality:** A content creation app that helps users create data-rich, well-sourced content using AI with persistent Brand and Context grounding.  
**Target Users:** Content marketers, founders, growth teams creating SEO/content marketing materials.

---

## 2. UI/UX Specification

### Layout Structure

- **Header:** App logo, navigation (Brand Grounding, Context, New Content, Saved Content)
- **Main Content:** Three-column workspace or tabbed interface
- **Sidebar:** Quick access to saved brand grounding, recent contexts

### Responsive Breakpoints
- Mobile: < 768px (stacked layout)
- Tablet: 768px - 1024px
- Desktop: > 1024px (full three-column)

### Visual Design

**Color Palette:**
- Primary: `#1E3A5F` (deep navy)
- Secondary: `#3B82F6` (bright blue)
- Accent: `#10B981` (emerald green for success)
- Background: `#F8FAFC` (light gray)
- Surface: `#FFFFFF` (white cards)
- Text Primary: `#1E293B`
- Text Secondary: `#64748B`
- Border: `#E2E8F0`

**Typography:**
- Headings: Inter, 600-700 weight
- Body: Inter, 400 weight
- Font sizes: h1: 32px, h2: 24px, h3: 18px, body: 16px, small: 14px

**Spacing:** 4px base unit (4, 8, 12, 16, 24, 32, 48)

**Visual Effects:**
- Card shadows: `0 1px 3px rgba(0,0,0,0.1)`
- Hover states: scale(1.02) with 150ms transition
- Input focus: 2px solid secondary color

### Components

1. **Brand Grounding Form**
   - Collapsible accordion sections
   - Text inputs for each field
   - Save/Load buttons
   - Select dropdown for saved brandings

2. **Context Grounding Form**
   - Content type dropdown (Blog, LinkedIn, Email, etc.)
   - Platform dropdown
   - Goal textarea
   - Word count range slider
   - Reader profile textarea
   - Argument structure builder (5 steps)
   - Tone notes textarea

3. **Keyword/Tag Input**
   - Tag input with auto-complete
   - Priority indicators (primary/secondary)

4. **Content Generator**
   - Generate button with loading state
   - Output editor (rich text)
   - Source citation panel
   - Copy/Export buttons

5. **Saved Content List**
   - Card-based preview
   - Search/filter
   - Edit/Delete actions

---

## 3. Functionality Specification

### Core Features

#### Brand Grounding Management
- Create new brand grounding with fields:
  - Brand name
  - What we do (one sentence)
  - Target reader
  - Our differentiator
  - Voice (3-5 adjectives)
  - We sound like (sample text)
  - We never say (list)
  - Proprietary terms to use
- Save to local storage (Supabase optional)
- Load/edit existing brand groundings
- Set default brand grounding

#### Context Grounding Management
- Content type selection (Blog post, LinkedIn post, Email, Tweet thread, Newsletter, Case study, Whitepaper)
- Platform selection (Medium, LinkedIn, Company blog, Newsletter, Twitter, Substack)
- Goal definition
- Word count target (range)
- Reader profile description
- Current belief (what needs to change)
- Key objection to address
- Argument structure (5-step builder with reorder)
- Tone notes
- Avoid list

#### Keyword & Tag Guidance
- Primary keywords input
- Secondary keywords/tags
- Semantic topics
- LLM instructions for keyword integration

#### Content Generation (LLM Integration)
- Web search enabled (Perplexity API or OpenAI with browsing)
- Generate data-rich content with:
  - Statistics and data points
  - Inline citations with hyperlinks
  - Source attribution
- Output formats:
  - Markdown
  - HTML
  - Plain text

#### Content Management
- Save generated content
- Edit content
- Export (Markdown, HTML)
- Local storage persistence

### User Interactions

1. **New Content Flow:**
   - Select/Load Brand Grounding → Fill Context Grounding → Add Keywords → Generate → Edit/Export

2. **Saved Brandings:**
   - Quick-select from dropdown
   - Edit in place
   - Duplicate for variants

---

## 4. Technical Architecture

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS

### Backend (API Routes)
- Next.js API routes for:
  - Content generation (call to LLM)

### LLM Integration
- Primary: Perplexity API (recommended for research + sources)
- Fallback: OpenAI GPT-4

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PERPLEXITY_API_KEY=your_perplexity_api_key
OPENAI_API_KEY=your_openai_api_key
```

---

## 5. Acceptance Criteria

1. ✅ User can create, save, and load Brand Grounding
2. ✅ User can create and manage Context Grounding with all fields
3. ✅ User can add keywords and tags with priority
4. ✅ Generate button produces data-rich content with citations
5. ✅ Sources are hyperlinked in the output
6. ✅ User can save and manage generated content
7. ✅ Responsive design works on mobile/tablet/desktop
8. ✅ Data persists in local storage
