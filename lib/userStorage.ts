"use client";

// Local storage manager for user data (folders, likes, uploads)
// In production, this would connect to a database like Supabase

export interface UserImage {
  id: string;
  imageUrl: string;
  title: string;
  author: string;
  description: string;
  platform: string;
  userId: string;
  uploadedAt: string;
  source?: 'upload' | 'url' | 'arena';
  fileSize?: number;
  contentType?: string;
  fileName?: string;
}

export interface UserFolder {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  imageIds: string[];
  description?: string;
}

export interface UserLike {
  id: string;
  userId: string;
  imageId: string;
  imageUrl: string;
  title: string;
  author: string;
  likedAt: string;
}

class UserStorageManager {
  private static instance: UserStorageManager;

  static getInstance(): UserStorageManager {
    if (!UserStorageManager.instance) {
      UserStorageManager.instance = new UserStorageManager();
    }
    return UserStorageManager.instance;
  }

  // UPLOADS
  saveUserUpload(userId: string, image: UserImage): void {
    const uploads = this.getUserUploads(userId);
    uploads.unshift(image); // Add to beginning
    localStorage.setItem(`user_uploads_${userId}`, JSON.stringify(uploads));
    console.log('💾 Saved user upload:', image.title);
  }

  getUserUploads(userId: string): UserImage[] {
    try {
      const uploads = localStorage.getItem(`user_uploads_${userId}`);
      return uploads ? JSON.parse(uploads) : [];
    } catch (error) {
      console.error('Error loading user uploads:', error);
      return [];
    }
  }

  deleteUserUpload(userId: string, imageId: string): void {
    const uploads = this.getUserUploads(userId);
    const filtered = uploads.filter(img => img.id !== imageId);
    localStorage.setItem(`user_uploads_${userId}`, JSON.stringify(filtered));
    console.log('🗑️ Deleted user upload:', imageId);
  }

  // FOLDERS
  createFolder(userId: string, name: string, description?: string): UserFolder {
    const folder: UserFolder = {
      id: `folder_${Date.now()}`,
      name,
      userId,
      createdAt: new Date().toISOString(),
      imageIds: [],
      description
    };

    const folders = this.getUserFolders(userId);
    folders.unshift(folder);
    localStorage.setItem(`user_folders_${userId}`, JSON.stringify(folders));
    console.log('📁 Created folder:', name);
    return folder;
  }

  getUserFolders(userId: string): UserFolder[] {
    try {
      const folders = localStorage.getItem(`user_folders_${userId}`);
      return folders ? JSON.parse(folders) : [];
    } catch (error) {
      console.error('Error loading user folders:', error);
      return [];
    }
  }

  addImageToFolder(userId: string, folderId: string, imageId: string): void {
    const folders = this.getUserFolders(userId);
    const folder = folders.find(f => f.id === folderId);
    
    if (folder && !folder.imageIds.includes(imageId)) {
      folder.imageIds.push(imageId);
      localStorage.setItem(`user_folders_${userId}`, JSON.stringify(folders));
      console.log('📁 Added image to folder:', folder.name);
    }
  }

  removeImageFromFolder(userId: string, folderId: string, imageId: string): void {
    const folders = this.getUserFolders(userId);
    const folder = folders.find(f => f.id === folderId);
    
    if (folder) {
      folder.imageIds = folder.imageIds.filter(id => id !== imageId);
      localStorage.setItem(`user_folders_${userId}`, JSON.stringify(folders));
      console.log('📁 Removed image from folder:', folder.name);
    }
  }

  deleteFolder(userId: string, folderId: string): void {
    const folders = this.getUserFolders(userId);
    const filtered = folders.filter(f => f.id !== folderId);
    localStorage.setItem(`user_folders_${userId}`, JSON.stringify(filtered));
    console.log('🗑️ Deleted folder:', folderId);
  }

  // LIKES
  likeImage(userId: string, imageId: string, imageUrl: string, title: string, author: string): void {
    const like: UserLike = {
      id: `like_${Date.now()}`,
      userId,
      imageId,
      imageUrl,
      title,
      author,
      likedAt: new Date().toISOString()
    };

    const likes = this.getUserLikes(userId);
    // Check if already liked
    if (!likes.find(l => l.imageId === imageId)) {
      likes.unshift(like);
      localStorage.setItem(`user_likes_${userId}`, JSON.stringify(likes));
      console.log('❤️ Liked image:', title);
    }
  }

  unlikeImage(userId: string, imageId: string): void {
    const likes = this.getUserLikes(userId);
    const filtered = likes.filter(l => l.imageId !== imageId);
    localStorage.setItem(`user_likes_${userId}`, JSON.stringify(filtered));
    console.log('💔 Unliked image:', imageId);
  }

  getUserLikes(userId: string): UserLike[] {
    try {
      const likes = localStorage.getItem(`user_likes_${userId}`);
      return likes ? JSON.parse(likes) : [];
    } catch (error) {
      console.error('Error loading user likes:', error);
      return [];
    }
  }

  isImageLiked(userId: string, imageId: string): boolean {
    const likes = this.getUserLikes(userId);
    return likes.some(l => l.imageId === imageId);
  }

  // STATS
  getUserStats(userId: string) {
    const uploads = this.getUserUploads(userId);
    const folders = this.getUserFolders(userId);
    const likes = this.getUserLikes(userId);

    return {
      uploadsCount: uploads.length,
      foldersCount: folders.length,
      likesCount: likes.length,
      totalImages: uploads.length + likes.length
    };
  }
}

export const userStorage = UserStorageManager.getInstance();