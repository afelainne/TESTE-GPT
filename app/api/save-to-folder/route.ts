import { NextRequest, NextResponse } from 'next/server';
import { kvUserStorage } from '@/lib/vercelKVStorage';

export async function POST(request: NextRequest) {
  try {
    const { userId, folderId, contentId, contentTitle, action } = await request.json();
    
    console.log('🗂️ Save to folder request:', { userId, folderId, contentId, action });
    
    if (!userId || !folderId || !contentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    if (action === 'add') {
      await kvUserStorage.addImageToFolder(userId, folderId, contentId);
      console.log('✅ Added content to folder');
      
      return NextResponse.json({
        success: true,
        message: 'Content added to folder successfully'
      });
    } else if (action === 'remove') {
      await kvUserStorage.removeImageFromFolder(userId, folderId, contentId);
      console.log('✅ Removed content from folder');
      
      return NextResponse.json({
        success: true,
        message: 'Content removed from folder successfully'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action. Use "add" or "remove"' 
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Save to folder error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save to folder' 
    }, { status: 500 });
  }
}