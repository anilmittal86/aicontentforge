import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${response.status}` }, { status: 400 });
    }

    const html = await response.text();

    const extractMeta = (html: string, name: string): string => {
      const patterns = [
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["']`, 'i'),
        new RegExp(`<meta[^>]*property=["']og:${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${name}["']`, 'i'),
      ];
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1].trim();
      }
      return '';
    };

    const extractTitle = (html: string): string => {
      const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return match ? match[1].trim() : '';
    };

    const extractFirstParagraph = (html: string): string => {
      const text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const sentences = text.match(/[A-Z][^.!?]*[.!?]/g) || [];
      const firstMeaningful = sentences.find(s => s.length > 30 && !s.toLowerCase().includes('cookie'));
      return firstMeaningful ? firstMeaningful.trim() : (sentences[0] || '').trim();
    };

    const extractH1 = (html: string): string => {
      const match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      return match ? match[1].trim() : '';
    };

    const companyName = extractTitle(html).split('|')[0].split('-')[0].trim() || 
                         extractH1(html).split('|')[0].trim() ||
                         new URL(normalizedUrl).hostname.replace(/^www\./, '').split('.')[0];

    const description = extractMeta(html, 'description') || 
                        extractMeta(html, 'og:description') ||
                        extractFirstParagraph(html).substring(0, 200);

    return NextResponse.json({
      brand_name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
      what_we_do: description.substring(0, 150) || 'Providing products/services',
      target_reader: 'People looking for our services',
      our_differentiator: '',
      voice: 'Professional, clear, helpful',
      we_sound_like: description.substring(0, 200) || 'Write like a knowledgeable expert',
      we_never_say: 'Generic marketing jargon',
      proprietary_terms: '',
    });

  } catch (error) {
    console.error('Extract error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract website data' },
      { status: 500 }
    );
  }
}