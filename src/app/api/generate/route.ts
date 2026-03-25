import { NextRequest, NextResponse } from 'next/server';
import { BrandGrounding, ContextGrounding, KeywordTag } from '@/types';

interface GenerateRequest {
  brand: BrandGrounding;
  context: ContextGrounding;
  keywords: KeywordTag[];
}

interface Source {
  text: string;
  url: string;
}

function extractSources(content: string): Source[] {
  const urlRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const foundSources: Source[] = [];
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(content)) !== null) {
    if (!foundSources.find(s => s.url === match![2])) {
      foundSources.push({ text: match![1], url: match![2] });
    }
  }
  return foundSources;
}

function extractTitle(content: string, defaultTitle: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1] : defaultTitle;
}

export async function POST(request: NextRequest) {
  try {
    const { brand, context, keywords }: GenerateRequest = await request.json();

    if (!context?.goal) {
      return NextResponse.json(
        { error: 'Please enter a Goal in Context settings.' },
        { status: 400 }
      );
    }

    const effectiveBrand = brand || {
      brand_name: '',
      what_we_do: '',
      target_reader: '',
      our_differentiator: '',
      voice: '',
      we_sound_like: '',
      we_never_say: '',
      proprietary_terms: '',
    };

    const effectiveContext = context || {
      content_type: 'Blog post',
      platform: 'Company blog',
      goal: '',
      word_count_min: 800,
      word_count_max: 1500,
      reader_profile: '',
      reader_belief: '',
      key_objection: '',
      argument_structure: { hook: '', problem: '', evidence: '', solution: '', cta: '' },
      tone_notes: '',
      avoid: '',
    };

    const geminiKey = process.env.GEMINI_API_KEY;
    const perplexityKey = process.env.PERPLEXITY_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    const primaryKeywords = keywords
      ?.filter(k => k.priority === 'primary')
      .map(k => k.name)
      .join(', ') || '';
    
    const secondaryKeywords = keywords
      ?.filter(k => k.priority === 'secondary')
      .map(k => k.name)
      .join(', ') || '';

    const systemPrompt = `You are an expert content writer specializing in data-rich, well-researched content. 

BRAND GROUNDING:
- Brand: ${effectiveBrand.brand_name || 'Not specified'}
- What we do: ${effectiveBrand.what_we_do || 'Not specified'}
- Target reader: ${effectiveBrand.target_reader || 'Not specified'}
- Differentiator: ${effectiveBrand.our_differentiator || 'Not specified'}
- Voice: ${effectiveBrand.voice || 'Not specified'}
- We sound like: ${effectiveBrand.we_sound_like || 'Not specified'}
- We never say: ${effectiveBrand.we_never_say || 'Not specified'}
- Proprietary terms: ${effectiveBrand.proprietary_terms || 'Not specified'}

CONTEXT:
- Content type: ${effectiveContext.content_type || 'Blog post'}
- Platform: ${effectiveContext.platform || 'Company blog'}
- Goal: ${effectiveContext.goal || 'Not specified'}
- Word count: ${effectiveContext.word_count_min || 800}-${effectiveContext.word_count_max || 1500}
- Reader profile: ${effectiveContext.reader_profile || 'Not specified'}
- Current belief: ${effectiveContext.reader_belief || 'Not specified'}
- Key objection: ${effectiveContext.key_objection || 'Not specified'}
- Argument structure: ${Object.values(effectiveContext.argument_structure || {}).join(' | ') || 'Not specified'}
- Tone notes: ${effectiveContext.tone_notes || 'Not specified'}
- Avoid: ${effectiveContext.avoid || 'Not specified'}

IMPORTANT INSTRUCTIONS:
1. Generate data-rich content with statistics, data points, and facts
2. ALWAYS include inline citations with hyperlinks to high-authority sources using markdown link format [source text](URL)
3. Every claim should be backed by data from credible sources
4. Include real statistics with percentages, numbers, and dates
5. Structure content with clear headings and sections
6. Include a "Sources" section at the end listing all references with URLs
7. Write in the brand's voice as specified
8. Target approximately ${effectiveContext.word_count_min || 800}-${effectiveContext.word_count_max || 1500} words
9. Address the reader's current belief and key objection
10. Follow the argument structure provided`;

    const userPrompt = `Write a ${effectiveContext.content_type?.toLowerCase() || 'blog post'} for ${effectiveContext.platform || 'Company blog'}. 

Topic should cover: ${effectiveContext.goal}

The content should:
- Start with a compelling hook about ${effectiveContext.argument_structure?.hook || 'the main topic'}
- Present the problem/insight: ${effectiveContext.argument_structure?.problem || 'the key challenge'}
- Include evidence and data supporting the points
- Present the solution with specific recommendations
- End with a clear call to action

Make sure to naturally incorporate the keywords: ${primaryKeywords || 'as appropriate for the topic'}`;

    let content = '';
    let sources: Source[] = [];
    let title = '';
    const defaultTitle = `${effectiveBrand.brand_name || 'Content'} - ${effectiveContext.content_type || 'Blog post'}`;

    if (geminiKey) {
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: userPrompt },
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        }),
      });

      if (!geminiResponse.ok) {
        const err = await geminiResponse.text();
        throw new Error(`Gemini API error: ${err}`);
      }

      const geminiData = await geminiResponse.json();
      content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      title = extractTitle(content, defaultTitle);
      sources = extractSources(content);

    } else if (perplexityKey) {
      const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar-pro',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!perplexityResponse.ok) {
        const err = await perplexityResponse.text();
        throw new Error(`Perplexity API error: ${err}`);
      }

      const perplexityData = await perplexityResponse.json();
      content = perplexityData.choices?.[0]?.message?.content || '';
      
      title = extractTitle(content, defaultTitle);
      sources = extractSources(content);

    } else if (openaiKey) {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!openaiResponse.ok) {
        const err = await openaiResponse.text();
        throw new Error(`OpenAI API error: ${err}`);
      }

      const openaiData = await openaiResponse.json();
      content = openaiData.choices?.[0]?.message?.content || '';
      
      title = extractTitle(content, defaultTitle);
      sources = extractSources(content);
    } else {
      return NextResponse.json({
        error: 'No LLM API key configured. Please set GEMINI_API_KEY, PERPLEXITY_API_KEY, or OPENAI_API_KEY in environment variables.',
      }, { status: 500 });
    }

    return NextResponse.json({ content, title, sources });

  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
