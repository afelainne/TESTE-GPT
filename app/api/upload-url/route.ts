import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  console.log('🔗 Adding image from URL...');

  try {
    const body = await request.json();
    const { imageUrl, title, author, description, platform, userId } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    console.log('🔗 URL details:', {
      imageUrl,
      title,
      author,
      platform
    });

    // Validate URL is accessible
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`URL not accessible: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ URL validation failed:', error);
      return NextResponse.json({ error: 'Image URL is not accessible' }, { status: 400 });
    }

    // Create image data
    const imageData = {
      id: uuidv4(),
      imageUrl,
      title: title || 'Untitled',
      author: author || 'Unknown',
      description: description || '',
      platform: platform || 'url',
      userId: userId || 'anonymous',
      uploadedAt: new Date().toISOString(),
      source: 'url'
    };

    console.log('💾 URL image metadata created:', imageData);

    return NextResponse.json({
      success: true,
      image: imageData,
      message: 'Image added from URL successfully'
    });

  } catch (error) {
    console.error('❌ URL add failed:', error);
    return NextResponse.json(
      { error: 'Failed to add image from URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}