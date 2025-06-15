import { NextRequest, NextResponse } from 'next/server';
import { kvUserStorage } from '@/lib/vercelKVStorage';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    console.log('[api/folders] payload:', payload);
    
    const { folderId, imageUrl, userId, action } = payload;
    
    console.log('📁 Folder API request:', { folderId, imageUrl, userId, action });
    
    if (!folderId || !imageUrl || !userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: folderId, imageUrl, userId' 
      }, { status: 400 });
    }
    
    try {
      if (action === 'add') {
        await kvUserStorage.addImageToFolder(userId, folderId, imageUrl);
        console.log('✅ Added image to folder successfully');
        
        return NextResponse.json({
          success: true,
          message: 'Image added to folder successfully'
        });
      } else if (action === 'remove') {
        await kvUserStorage.removeImageFromFolder(userId, folderId, imageUrl);
        console.log('✅ Removed image from folder successfully');
        
        return NextResponse.json({
          success: true,
          message: 'Image removed from folder successfully'
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action. Use "add" or "remove"' 
        }, { status: 400 });
      }
    } catch (storageError) {
      console.error('❌ Storage operation failed:', storageError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update folder in storage' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Folder API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }
    
    try {
      const folders = await kvUserStorage.getUserFolders(userId);
      console.log('📁 Retrieved folders for user:', userId, folders.length);
      
      return NextResponse.json({
        success: true,
        folders: folders
      });
    } catch (storageError) {
      console.error('❌ Failed to retrieve folders:', storageError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to retrieve folders' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Folder API GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}