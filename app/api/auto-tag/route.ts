import { NextRequest, NextResponse } from 'next/server';

interface TagSuggestion {
  tag: string;
  confidence: number;
  category: 'style' | 'color' | 'composition' | 'mood' | 'subject';
}

async function analyzeImageWithCLIP(imageUrl: string): Promise<TagSuggestion[]> {
  const clipApiUrl = process.env.CLIP_API_URL;
  
  if (!clipApiUrl) {
    throw new Error('CLIP API URL not configured');
  }
  
  try {
    console.log('🔍 Analyzing image for auto-tagging:', imageUrl);
    
    const response = await fetch(clipApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [imageUrl],
        task: 'image_classification'
      }),
    });

    if (!response.ok) {
      throw new Error(`CLIP API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result && result.classifications) {
      // Convert CLIP classifications to tag suggestions
      return result.classifications.map((classification: any) => ({
        tag: classification.label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        confidence: classification.confidence || 0.5,
        category: classifyTagCategory(classification.label)
      }));
    }
    
    return [];
    
  } catch (error) {
    console.warn('⚠️ CLIP analysis failed:', error);
    return [];
  }
}

function classifyTagCategory(label: string): TagSuggestion['category'] {
  const lowerLabel = label.toLowerCase();
  
  // Style-related
  if (['minimal', 'modern', 'vintage', 'retro', 'abstract', 'geometric'].some(s => lowerLabel.includes(s))) {
    return 'style';
  }
  
  // Color-related
  if (['color', 'bright', 'dark', 'vibrant', 'muted', 'monochrome'].some(s => lowerLabel.includes(s))) {
    return 'color';
  }
  
  // Composition-related
  if (['layout', 'grid', 'centered', 'asymmetric', 'balanced'].some(s => lowerLabel.includes(s))) {
    return 'composition';
  }
  
  // Mood-related
  if (['calm', 'energetic', 'professional', 'playful', 'elegant', 'bold'].some(s => lowerLabel.includes(s))) {
    return 'mood';
  }
  
  // Default to subject
  return 'subject';
}

function generateFallbackTags(imageUrl: string): TagSuggestion[] {
  const tags: TagSuggestion[] = [];
  
  // URL-based analysis
  const url = imageUrl.toLowerCase();
  
  if (url.includes('behance')) {
    tags.push({ tag: 'behance', confidence: 0.9, category: 'subject' });
  }
  if (url.includes('dribbble')) {
    tags.push({ tag: 'dribbble', confidence: 0.9, category: 'subject' });
  }
  if (url.includes('pinterest')) {
    tags.push({ tag: 'pinterest', confidence: 0.9, category: 'subject' });
  }
  if (url.includes('arena')) {
    tags.push({ tag: 'arena', confidence: 0.9, category: 'subject' });
  }
  
  // File type analysis
  if (url.includes('.jpg') || url.includes('.jpeg')) {
    tags.push({ tag: 'photo', confidence: 0.7, category: 'subject' });
  }
  if (url.includes('.png')) {
    tags.push({ tag: 'digital', confidence: 0.7, category: 'style' });
  }
  if (url.includes('.svg')) {
    tags.push({ tag: 'vector', confidence: 0.8, category: 'style' });
  }
  
  // Common design tags
  tags.push(
    { tag: 'design', confidence: 0.8, category: 'subject' },
    { tag: 'visual', confidence: 0.7, category: 'style' },
    { tag: 'inspiration', confidence: 0.6, category: 'mood' },
    { tag: 'creative', confidence: 0.6, category: 'mood' }
  );
  
  return tags;
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('🏷️ Auto-tagging request for:', imageUrl);

    let tags: TagSuggestion[] = [];
    
    try {
      // Try CLIP analysis first
      tags = await analyzeImageWithCLIP(imageUrl);
      console.log(`✅ CLIP analysis generated ${tags.length} tags`);
    } catch (clipError) {
      console.warn('⚠️ CLIP analysis failed, using fallback:', clipError);
    }
    
    // If CLIP failed or returned no tags, use fallback
    if (tags.length === 0) {
      tags = generateFallbackTags(imageUrl);
      console.log(`📋 Fallback analysis generated ${tags.length} tags`);
    }
    
    // Filter and sort tags
    const filteredTags = tags
      .filter(tag => tag.confidence > 0.3) // Only confident tags
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 12); // Limit to 12 tags

    return NextResponse.json({
      success: true,
      tags: filteredTags,
      source: tags.length > 0 ? 'clip' : 'fallback',
      message: `Generated ${filteredTags.length} tag suggestions`
    });

  } catch (error) {
    console.error('❌ Auto-tagging error:', error);
    
    return NextResponse.json(
      { 
        error: 'Auto-tagging failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}