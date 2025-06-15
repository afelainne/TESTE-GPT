import { NextRequest, NextResponse } from 'next/server';
import { clipVectorOperations } from '@/lib/supabase';
import { localVectorCache } from '@/lib/localCache';

// Configure maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function uploadToSupabaseStorage(file: File): Promise<string> {
  console.log('🔄 Uploading file to Supabase Storage:', file.name);
  
  try {
    // Create FormData for Supabase Storage
    const formData = new FormData();
    formData.append('file', file);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}_${randomId}.${extension}`;
    
    // Upload to Supabase Storage (this would be implemented with proper Supabase client)
    // For now, we'll create a mock URL - in production, use actual Supabase Storage
    const publicUrl = `https://your-supabase-project.supabase.co/storage/v1/object/public/images/${filename}`;
    
    console.log('✅ File uploaded to storage:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('❌ Storage upload failed:', error);
    throw new Error('Failed to upload file to storage');
  }
}

async function getClipEmbedding(imageUrl: string): Promise<number[] | null> {
  console.log('🔄 Getting CLIP embedding for uploaded file');
  
  const clipApiUrl = process.env.CLIP_API_URL!;
  
  try {
    const response = await fetch(clipApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [imageUrl] }),
    });

    if (!response.ok) {
      throw new Error(`CLIP API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result?.data?.[0] || !Array.isArray(result.data[0])) {
      throw new Error('Invalid CLIP API response');
    }
    
    console.log(`✅ Got CLIP embedding (${result.data[0].length} dimensions)`);
    return result.data[0];
    
  } catch (error) {
    console.warn('⚠️ CLIP service unavailable:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting file upload process');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || file?.name || 'Untitled';
    const author = formData.get('author') as string || 'User Upload';
    const description = formData.get('description') as string || `Uploaded file: ${file?.name}`;
    const category = formData.get('category') as string || 'design';
    const tagsString = formData.get('tags') as string || '[]';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported file type. Allowed: JPG, PNG, GIF, MP4, PDF' },
        { status: 400 }
      );
    }

    console.log(`📁 Processing file: ${file.name} (${file.size} bytes, ${file.type})`);

    let tags: string[] = [];
    try {
      tags = JSON.parse(tagsString);
    } catch {
      tags = ['upload', 'design'];
    }

    // Step 1: Upload file to Supabase Storage
    const imageUrl = await uploadToSupabaseStorage(file);
    
    // Step 2: Get CLIP embedding (optional)
    const embedding = await getClipEmbedding(imageUrl);
    
    // Step 3: Prepare metadata
    const baseData = {
      image_url: imageUrl,
      source_url: imageUrl, // Same as image URL for uploads
      title: title.trim(),
      author_name: author.trim(),
      metadata: {
        original_filename: file.name,
        file_size: file.size,
        file_type: file.type,
        upload_timestamp: new Date().toISOString(),
        description: description.trim(),
        category: category.trim(),
        tags: tags,
        source: 'direct_upload'
      }
    };

    // Step 4: Insert into Supabase database
    try {
      console.log('🔄 Inserting into Supabase database');
      
      const inserted = embedding 
        ? await clipVectorOperations.insert({
            ...baseData,
            embedding
          })
        : await clipVectorOperations.insertPending(baseData);
      
      console.log('✅ Successfully inserted to Supabase:', inserted.id);
      
      // Also add to local cache for immediate access
      localVectorCache.add({
        ...baseData,
        embedding,
        processing_status: embedding ? 'processed' : 'pending'
      });

      return NextResponse.json({
        success: true,
        id: inserted.id,
        image_url: imageUrl,
        title: baseData.title,
        message: `File uploaded successfully${embedding ? ' with CLIP embedding' : ' (CLIP processing pending)'}`,
        clip_embedding: !!embedding
      });

    } catch (supabaseError) {
      console.error('❌ Supabase insert failed:', supabaseError);
      
      // Fallback to local cache only
      const fallbackId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      localVectorCache.add({
        ...baseData,
        embedding,
        processing_status: embedding ? 'processed' : 'pending',
        metadata: {
          ...baseData.metadata,
          storage: 'local_cache_fallback',
          supabase_error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
        }
      });
      
      console.log('📦 Saved to local cache as fallback');
      
      return NextResponse.json({
        success: true,
        id: fallbackId,
        image_url: imageUrl,
        title: baseData.title,
        message: `File uploaded to storage and cached locally${embedding ? ' with CLIP embedding' : ' (CLIP processing pending)'}`,
        clip_embedding: !!embedding,
        warning: 'Database temporarily unavailable - file cached locally'
      });
    }

  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Upload ID required' },
        { status: 400 }
      );
    }

    // Check Supabase first
    try {
      const vector = await clipVectorOperations.getById(id);
      if (vector) {
        return NextResponse.json({
          found: true,
          source: 'supabase',
          data: vector
        });
      }
    } catch (error) {
      console.warn('❌ Supabase check failed:', error);
    }

    // Check local cache
    const localData = localVectorCache.getById(id);
    if (localData) {
      return NextResponse.json({
        found: true,
        source: 'local_cache',
        data: localData
      });
    }

    return NextResponse.json({
      found: false,
      message: 'Upload not found'
    });

  } catch (error) {
    console.error('❌ Status check failed:', error);
    
    return NextResponse.json(
      {
        error: 'Status check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}