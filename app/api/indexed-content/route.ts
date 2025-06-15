import { NextResponse } from 'next/server';
import { clipVectorOperations } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    
    console.log('📊 Fetching indexed content directly from Supabase (page: ' + page + ', limit: ' + limit + ')');
    
    // For pagination, calculate offset
    const offset = (page - 1) * limit;
    
    // Fetch directly from Supabase - no cache, always fresh data
    const vectors = await clipVectorOperations.getAll(limit + offset); // Get more then slice
    
    if (!vectors || vectors.length === 0) {
      console.log('📊 No content found in Supabase, using demo fallback');
      return NextResponse.json({
        total: 0,
        message: 'No content found in Supabase database',
        vectors: [],
        content: [],
        source: 'supabase-direct',
        timestamp: new Date().toISOString()
      });
    }
    
    // Apply pagination to vectors
    const paginatedVectors = vectors.slice(offset, offset + limit);
    
    // Map Supabase data to the format expected by the grid
    const content = paginatedVectors.map((vector: any) => ({
      id: `supabase_${vector.id}`,
      title: vector.title || 'Uploaded Image',
      imageUrl: vector.image_url,
      description: `Uploaded: ${vector.title || 'Untitled'}`,
      category: 'uploads',
      tags: ['uploaded', 'user-content', 'supabase'],
      author: 'Your Upload',
      likes: Math.floor(Math.random() * 100),
      isLiked: false,
      createdAt: vector.created_at ? new Date(vector.created_at).toISOString().split('T')[0] : '2025-06-09',
      colors: ['#4F46E5', '#EC4899', '#000000'],
      source: vector.source_url || vector.image_url,
      platform: 'supabase',
      visualStyle: {
        composition: 'user-generated',
        colorTone: 'varied',
        shapes: 'mixed',
        mood: 'personal'
      }
    }));
    
    console.log('✅ Found ' + vectors.length + ' uploaded images in Supabase');
    
    return NextResponse.json({
      total: vectors.length,
      page: page,
      limit: limit,
      hasMore: vectors.length > offset + limit,
      message: `Retrieved ${content.length} images from your Supabase uploads (page ${page})`,
      vectors: paginatedVectors, // Raw Supabase data
      content: content, // Formatted for grid
      source: 'supabase-direct',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching from Supabase:', error);
    
    // If Supabase fails, return demo content that represents what would be your uploads
    console.log('🔄 Supabase failed, providing demo content simulating your uploads...');
    
    const demoUserUploads = [
      {
        id: 'demo_upload_001',
        title: 'Brand Identity Project',
        imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&q=80',
        description: 'Brand identity design you uploaded to Supabase',
        category: 'uploads',
        tags: ['uploaded', 'branding', 'personal-work', 'identity'],
        author: 'Your Upload',
        likes: 42,
        isLiked: false,
        createdAt: '2025-06-09',
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        source: 'user-upload-supabase',
        platform: 'supabase',
        visualStyle: {
          composition: 'professional',
          colorTone: 'vibrant',
          shapes: 'modern',
          mood: 'confident'
        }
      },
      {
        id: 'demo_upload_002',
        title: 'UI Design System',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
        description: 'Design system components you uploaded',
        category: 'uploads',
        tags: ['uploaded', 'ui', 'design-system', 'components'],
        author: 'Your Upload',
        likes: 67,
        isLiked: false,
        createdAt: '2025-06-09',
        colors: ['#6C63FF', '#FF6B9D', '#F0F2F5'],
        source: 'user-upload-supabase',
        platform: 'supabase',
        visualStyle: {
          composition: 'systematic',
          colorTone: 'digital',
          shapes: 'geometric',
          mood: 'organized'
        }
      },
      {
        id: 'demo_upload_003',
        title: 'Typography Exploration',
        imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0bd31a82edd?w=600&q=80',
        description: 'Typography experiment you uploaded',
        category: 'uploads',
        tags: ['uploaded', 'typography', 'experimental', 'fonts'],
        author: 'Your Upload',
        likes: 54,
        isLiked: false,
        createdAt: '2025-06-07',
        colors: ['#1A1A1A', '#F5F5F5', '#E74C3C'],
        source: 'user-upload-supabase',
        platform: 'supabase',
        visualStyle: {
          composition: 'textual',
          colorTone: 'monochrome',
          shapes: 'typographic',
          mood: 'editorial'
        }
      }
    ];
    
    // Apply pagination to demo content
    const page = parseInt(new URL(request.url).searchParams.get('page') || '1');
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const paginatedDemo = demoUserUploads.slice(offset, offset + limit);
    
    return NextResponse.json({
      total: demoUserUploads.length,
      page: page,
      limit: limit,
      hasMore: demoUserUploads.length > offset + limit,
      message: `Demo: ${paginatedDemo.length} simulated uploads (page ${page}) - Supabase API key issue: ${error instanceof Error ? error.message : 'Unknown error'}`,
      vectors: [],
      content: paginatedDemo,
      source: 'demo-fallback',
      supabaseError: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      note: 'This simulates your uploaded content. Configure Supabase API keys to see real uploads.'
    });
  }
}