import { NextRequest, NextResponse } from 'next/server';
import { kvUserStorage } from '@/lib/vercelKVStorage';

// API para gerenciar dados do usuário no Vercel KV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'stats':
        const stats = await kvUserStorage.getUserStats(userId);
        return NextResponse.json({ success: true, stats });

      case 'uploads':
        const uploads = await kvUserStorage.getUserUploads(userId);
        return NextResponse.json({ success: true, uploads });

      case 'folders':
        const folders = await kvUserStorage.getUserFolders(userId);
        return NextResponse.json({ success: true, folders });

      case 'likes':
        const likes = await kvUserStorage.getUserLikes(userId);
        return NextResponse.json({ success: true, likes });

      case 'sync':
        await kvUserStorage.syncUserData(userId);
        return NextResponse.json({ success: true, message: 'Data synced' });

      case 'all':
        // Get all user data
        const kvStorage = kvUserStorage as any;
        const userData = await kvStorage.getUserData(userId);
        const userStats = await kvUserStorage.getUserStats(userId);
        return NextResponse.json({ 
          success: true, 
          data: userData,
          stats: userStats,
          storage: kvStorage.fallbackToLocal ? 'localStorage' : 'vercelKV',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: stats, uploads, folders, likes, sync, all' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('User KV API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'like':
        const { imageId, imageUrl, title, author } = data;
        await kvUserStorage.likeImage(userId, imageId, imageUrl, title, author);
        return NextResponse.json({ success: true, message: 'Image liked' });

      case 'unlike':
        await kvUserStorage.unlikeImage(userId, data.imageId);
        return NextResponse.json({ success: true, message: 'Image unliked' });

      case 'create-folder':
        const folder = await kvUserStorage.createFolder(userId, data.name, data.description);
        return NextResponse.json({ success: true, folder });

      case 'add-to-folder':
        await kvUserStorage.addImageToFolder(userId, data.folderId, data.imageId);
        return NextResponse.json({ success: true, message: 'Image added to folder' });

      case 'remove-from-folder':
        await kvUserStorage.removeImageFromFolder(userId, data.folderId, data.imageId);
        return NextResponse.json({ success: true, message: 'Image removed from folder' });

      case 'delete-folder':
        await kvUserStorage.deleteFolder(userId, data.folderId);
        return NextResponse.json({ success: true, message: 'Folder deleted' });

      case 'migrate':
        await kvUserStorage.migrateFromLocalStorage(userId);
        return NextResponse.json({ success: true, message: 'Data migrated to KV' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('User KV POST API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}