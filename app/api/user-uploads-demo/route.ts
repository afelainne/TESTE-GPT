import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🎯 DEMO: Simulating user uploads for testing...');
    
    // Simulate what would be your uploaded images
    const demoUploads = [
      {
        id: 'upload_001',
        title: 'My Design Portfolio Cover',
        imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&q=80',
        description: 'Personal branding design I uploaded',
        category: 'uploads',
        tags: ['uploaded', 'personal', 'branding', 'design'],
        author: 'Your Upload',
        likes: 15,
        isLiked: false,
        createdAt: '2025-06-09',
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        source: 'user-upload',
        platform: 'supabase',
        visualStyle: {
          composition: 'professional',
          colorTone: 'vibrant',
          shapes: 'modern',
          mood: 'confident'
        }
      },
      {
        id: 'upload_002',
        title: 'Architecture Sketch',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
        description: 'Architectural concept I drew and uploaded',
        category: 'uploads',
        tags: ['uploaded', 'architecture', 'sketch', 'concept'],
        author: 'Your Upload',
        likes: 23,
        isLiked: false,
        createdAt: '2025-06-09',
        colors: ['#2C3E50', '#ECF0F1', '#3498DB'],
        source: 'user-upload',
        platform: 'supabase',
        visualStyle: {
          composition: 'technical',
          colorTone: 'muted',
          shapes: 'architectural',
          mood: 'contemplative'
        }
      },
      {
        id: 'upload_003',
        title: 'UI Component Library',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
        description: 'Design system components I created',
        category: 'uploads',
        tags: ['uploaded', 'ui', 'components', 'system'],
        author: 'Your Upload',
        likes: 31,
        isLiked: false,
        createdAt: '2025-06-08',
        colors: ['#6C63FF', '#FF6B9D', '#F0F2F5'],
        source: 'user-upload',
        platform: 'supabase',
        visualStyle: {
          composition: 'systematic',
          colorTone: 'digital',
          shapes: 'geometric',
          mood: 'organized'
        }
      },
      {
        id: 'upload_004',
        title: 'Product Photography',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
        description: 'Product shoot I uploaded for reference',
        category: 'uploads',
        tags: ['uploaded', 'photography', 'product', 'commercial'],
        author: 'Your Upload',
        likes: 18,
        isLiked: false,
        createdAt: '2025-06-08',
        colors: ['#FF5722', '#FFFFFF', '#263238'],
        source: 'user-upload',
        platform: 'supabase',
        visualStyle: {
          composition: 'centered',
          colorTone: 'commercial',
          shapes: 'product',
          mood: 'clean'
        }
      },
      {
        id: 'upload_005',
        title: 'Typography Exploration',
        imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0bd31a82edd?w=600&q=80',
        description: 'Font pairing experiment I uploaded',
        category: 'uploads',
        tags: ['uploaded', 'typography', 'fonts', 'experiment'],
        author: 'Your Upload',
        likes: 27,
        isLiked: false,
        createdAt: '2025-06-07',
        colors: ['#1A1A1A', '#F5F5F5', '#E74C3C'],
        source: 'user-upload',
        platform: 'supabase',
        visualStyle: {
          composition: 'textual',
          colorTone: 'monochrome',
          shapes: 'typographic',
          mood: 'editorial'
        }
      }
    ];

    console.log('✅ Returning', demoUploads.length, 'demo user uploads');

    return NextResponse.json({
      status: 'success',
      content: demoUploads,
      total: demoUploads.length,
      message: `Demo: ${demoUploads.length} user uploads (simulating your Supabase content)`,
      source: 'demo-uploads',
      priority: 'high',
      timestamp: new Date().toISOString(),
      note: 'This represents what your uploaded images would look like from Supabase'
    });
    
  } catch (error) {
    console.error('❌ Error in demo uploads API:', error);
    return NextResponse.json({
      status: 'error',
      content: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
}