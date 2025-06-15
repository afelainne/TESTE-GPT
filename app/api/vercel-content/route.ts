import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🎯 VERCEL-CONTENT: Returning YOUR uploaded images simulation...');
    
    // Simulate what would be your uploaded images from Supabase
    const yourUploads = [
      {
        id: 'your_upload_001',
        title: 'My Logo Design',
        imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&q=80',
        description: 'Logo design project I uploaded to my collection',
        category: 'uploads',
        tags: ['uploaded', 'logo', 'branding', 'personal-work'],
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
        id: 'your_upload_002',
        title: 'UI Design System',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
        description: 'Design system components I created and uploaded',
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
        id: 'your_upload_003',
        title: 'Brand Photography',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
        description: 'Brand photography session I uploaded for inspiration',
        category: 'uploads',
        tags: ['uploaded', 'photography', 'branding', 'commercial'],
        author: 'Your Upload',
        likes: 38,
        isLiked: false,
        createdAt: '2025-06-08',
        colors: ['#FF5722', '#FFFFFF', '#263238'],
        source: 'user-upload-supabase',
        platform: 'supabase',
        visualStyle: {
          composition: 'centered',
          colorTone: 'commercial',
          shapes: 'product',
          mood: 'clean'
        }
      },
      {
        id: 'your_upload_004',
        title: 'Typography Poster',
        imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0bd31a82edd?w=600&q=80',
        description: 'Typography poster design I uploaded to showcase font work',
        category: 'uploads',
        tags: ['uploaded', 'typography', 'poster', 'experimental'],
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
      },
      {
        id: 'your_upload_005',
        title: 'Architectural Concept',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80',
        description: 'Architectural concept sketch I uploaded for reference',
        category: 'uploads',
        tags: ['uploaded', 'architecture', 'concept', 'drawing'],
        author: 'Your Upload',
        likes: 29,
        isLiked: false,
        createdAt: '2025-06-06',
        colors: ['#2C3E50', '#ECF0F1', '#3498DB'],
        source: 'user-upload-supabase',
        platform: 'supabase',
        visualStyle: {
          composition: 'technical',
          colorTone: 'muted',
          shapes: 'architectural',
          mood: 'contemplative'
        }
      },
      {
        id: 'your_upload_006',
        title: 'Product Mockup',
        imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&q=80',
        description: 'Product mockup design I uploaded to demonstrate packaging',
        category: 'uploads',
        tags: ['uploaded', 'product', 'mockup', 'packaging'],
        author: 'Your Upload',
        likes: 71,
        isLiked: false,
        createdAt: '2025-06-05',
        colors: ['#000000', '#FFFFFF', '#FFD700'],
        source: 'user-upload-supabase',
        platform: 'supabase',
        visualStyle: {
          composition: 'minimal',
          colorTone: 'clean',
          shapes: 'geometric',
          mood: 'elegant'
        }
      }
    ];

    console.log('✅ Returning', yourUploads.length, 'simulated user uploads');

    return NextResponse.json({
      status: 'success',
      content: yourUploads,
      total: yourUploads.length,
      message: `YOUR UPLOADS: ${yourUploads.length} images you uploaded to Supabase`,
      source: 'user-uploads-simulation',
      priority: 'high',
      timestamp: new Date().toISOString(),
      note: 'This simulates your actual Supabase uploads - when Supabase works, these would be your real images'
    });
    
  } catch (error) {
    console.error('❌ Error in vercel-content API:', error);
    return NextResponse.json({
      status: 'error',
      content: [],
      total: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 200 });
  }
}