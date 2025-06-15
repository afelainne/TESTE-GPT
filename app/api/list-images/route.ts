import { NextRequest, NextResponse } from 'next/server';
import { supabaseStorage } from '@/lib/supabaseClient';
import { clipVectorOperations } from '@/lib/supabase';

// GET /api/list-images - List images from Supabase Storage and Supabase vectors
export async function GET(request: NextRequest) {
  try {
    console.log('📂 Fetching images from storage and database...');
    
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source') || 'all'; // 'storage', 'database', or 'all'
    const limit = parseInt(searchParams.get('limit') || '50');

    let storageImages: any[] = [];
    let databaseImages: any[] = [];

    // Get images from Supabase Storage
    if (source === 'storage' || source === 'all') {
      try {
        const files = await supabaseStorage.listAllFiles('images');
        
        storageImages = files
          .filter(file => file.name && !file.name.endsWith('/')) // Filter out folders
          .map(file => ({
            id: `storage_${file.name}`,
            imageUrl: supabaseStorage.getPublicUrl('images', file.name),
            title: file.name.split('.')[0], // Remove extension
            author: 'User Upload',
            source: 'supabase_storage',
            uploadedAt: file.created_at || new Date().toISOString(),
            fileSize: file.metadata?.size,
            contentType: file.metadata?.mimetype
          }))
          .slice(0, limit);

        console.log(`📂 Found ${storageImages.length} images in Supabase Storage`);
      } catch (storageError) {
        console.warn('⚠️ Failed to fetch from Supabase Storage:', storageError);
      }
    }

    // Get images from database vectors
    if (source === 'database' || source === 'all') {
      try {
        const vectors = await clipVectorOperations.getAll(limit);
        
        databaseImages = vectors.map(vector => ({
          id: vector.id,
          imageUrl: vector.image_url,
          title: vector.title || 'Untitled',
          author: vector.author_name || 'Unknown',
          source: 'supabase_vectors',
          uploadedAt: vector.created_at || new Date().toISOString(),
          platform: vector.metadata?.platform || 'Unknown',
          hasEmbedding: !!vector.embedding,
          similarity: undefined // Will be set by similarity search
        }));

        console.log(`📊 Found ${databaseImages.length} images in Supabase vectors`);
      } catch (databaseError) {
        console.warn('⚠️ Failed to fetch from Supabase database:', databaseError);
      }
    }

    // Combine and deduplicate
    const allImages = [...databaseImages, ...storageImages];
    
    // Simple deduplication by URL
    const uniqueImages = allImages.filter((image, index, self) => 
      index === self.findIndex(i => i.imageUrl === image.imageUrl)
    );

    // Sort by upload date (newest first)
    uniqueImages.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    console.log(`✅ Returning ${uniqueImages.length} unique images`);

    return NextResponse.json({
      success: true,
      images: uniqueImages.slice(0, limit),
      total: uniqueImages.length,
      sources: {
        storage: storageImages.length,
        database: databaseImages.length,
        unique: uniqueImages.length
      }
    });

  } catch (error) {
    console.error('❌ List images API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to list images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}