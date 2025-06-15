import { NextResponse } from 'next/server';

// Global in-memory storage for uploaded content
declare global {
  var uploadedContentCache: any[] | undefined;
}

export async function GET() {
  try {
    const uploadedContent = global.uploadedContentCache || [];
    console.log('📋 Returning uploaded content:', uploadedContent.length, 'items');
    
    return NextResponse.json({
      status: 'success',
      files: uploadedContent,
      total: uploadedContent.length,
      message: `Found ${uploadedContent.length} uploaded files`,
      source: 'global_cache'
    });
  } catch (error) {
    console.error('❌ Error getting uploaded content:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { file } = await request.json();
    
    // Initialize global cache if needed
    if (!global.uploadedContentCache) {
      global.uploadedContentCache = [];
    }
    
    if (file) {
      // Add timestamp and ID if not present
      const uploadedFile = {
        ...file,
        id: file.id || 'upload_' + Date.now(),
        created_at: file.created_at || new Date().toISOString(),
        upload_source: 'user_upload'
      };
      
      // Add to beginning of array (most recent first)
      global.uploadedContentCache.unshift(uploadedFile);
      console.log('📤 Added uploaded file:', uploadedFile.title || uploadedFile.id, 'Total:', global.uploadedContentCache.length);
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'File added to uploads',
      total: global.uploadedContentCache.length
    });
  } catch (error) {
    console.error('❌ Error adding uploaded file:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}