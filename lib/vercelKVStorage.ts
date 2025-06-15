import { kv } from '@vercel/kv';

// Interface para dados do usuário no KV storage
export interface UserKVData {
  uploads: UserImage[];
  folders: UserFolder[];
  likes: UserLike[];
  lastUpdated: string;
}

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

class VercelKVUserStorage {
  private static instance: VercelKVUserStorage;
  private fallbackToLocal = false;

  static getInstance(): VercelKVUserStorage {
    if (!VercelKVUserStorage.instance) {
      VercelKVUserStorage.instance = new VercelKVUserStorage();
    }
    return VercelKVUserStorage.instance;
  }

  constructor() {
    // Check if KV is available
    this.checkKVAvailability();
  }

  private async checkKVAvailability() {
    try {
      // Check if we have real KV credentials (not placeholders)
      const kvUrl = process.env.KV_REST_API_URL;
      const kvToken = process.env.KV_REST_API_TOKEN;
      
      if (!kvUrl || !kvToken || 
          kvUrl.includes('placeholder') || 
          kvToken.includes('placeholder')) {
        console.warn('⚠️ Vercel KV credentials are placeholders, using enhanced localStorage');
        this.fallbackToLocal = true;
        return;
      }

      await kv.ping();
      console.log('✅ Vercel KV is available');
      this.fallbackToLocal = false;
    } catch (error) {
      console.warn('⚠️ Vercel KV not available, using enhanced localStorage fallback');
      this.fallbackToLocal = true;
    }
  }

  private getUserKey(userId: string): string {
    return `user_data:${userId}`;
  }

  // ====== CORE STORAGE METHODS ======

  private async getUserData(userId: string): Promise<UserKVData> {
    if (this.fallbackToLocal) {
      return this.getLocalUserData(userId);
    }

    try {
      const data = await kv.get<UserKVData>(this.getUserKey(userId));
      return data || {
        uploads: [],
        folders: [],
        likes: [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.warn('KV get failed, falling back to localStorage:', error);
      return this.getLocalUserData(userId);
    }
  }

  private async setUserData(userId: string, data: UserKVData): Promise<void> {
    data.lastUpdated = new Date().toISOString();

    if (this.fallbackToLocal) {
      this.setLocalUserData(userId, data);
      return;
    }

    try {
      await kv.set(this.getUserKey(userId), data);
      console.log('✅ Data saved to Vercel KV for user:', userId);
    } catch (error) {
      console.warn('KV set failed, falling back to localStorage:', error);
      this.setLocalUserData(userId, data);
    }
  }

  // ====== ENHANCED LOCALSTORAGE METHODS ======

  private getLocalUserData(userId: string): UserKVData {
    if (typeof window === 'undefined') {
      return { uploads: [], folders: [], likes: [], lastUpdated: new Date().toISOString() };
    }

    try {
      // Try to get the complete user data object first
      const completeData = localStorage.getItem(`user_data_${userId}`);
      if (completeData) {
        const parsed = JSON.parse(completeData);
        console.log('📱 Loaded complete user data from localStorage:', parsed);
        return parsed;
      }

      // Fallback to separate keys (legacy support)
      const uploads = JSON.parse(localStorage.getItem(`user_uploads_${userId}`) || '[]');
      const folders = JSON.parse(localStorage.getItem(`user_folders_${userId}`) || '[]');
      const likes = JSON.parse(localStorage.getItem(`user_likes_${userId}`) || '[]');

      const data = {
        uploads,
        folders,
        likes,
        lastUpdated: new Date().toISOString()
      };

      // Migrate to complete data format
      if (uploads.length > 0 || folders.length > 0 || likes.length > 0) {
        this.setLocalUserData(userId, data);
        console.log('🔄 Migrated legacy localStorage data to new format');
      }

      return data;
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return { uploads: [], folders: [], likes: [], lastUpdated: new Date().toISOString() };
    }
  }

  private setLocalUserData(userId: string, data: UserKVData): void {
    if (typeof window === 'undefined') return;

    try {
      // Save complete data object (primary method)
      localStorage.setItem(`user_data_${userId}`, JSON.stringify(data));
      
      // Also save separate keys for backward compatibility
      localStorage.setItem(`user_uploads_${userId}`, JSON.stringify(data.uploads));
      localStorage.setItem(`user_folders_${userId}`, JSON.stringify(data.folders));
      localStorage.setItem(`user_likes_${userId}`, JSON.stringify(data.likes));
      localStorage.setItem(`user_lastUpdated_${userId}`, data.lastUpdated);
      
      console.log('💾 Enhanced localStorage save:', {
        userId,
        uploads: data.uploads.length,
        folders: data.folders.length,
        likes: data.likes.length,
        lastUpdated: data.lastUpdated
      });
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // ====== UPLOADS METHODS ======

  async saveUserUpload(userId: string, image: UserImage): Promise<void> {
    const data = await this.getUserData(userId);
    data.uploads.unshift(image); // Add to beginning
    await this.setUserData(userId, data);
    console.log('💾 Saved user upload:', image.title);
  }

  async getUserUploads(userId: string): Promise<UserImage[]> {
    const data = await this.getUserData(userId);
    return data.uploads;
  }

  async deleteUserUpload(userId: string, imageId: string): Promise<void> {
    const data = await this.getUserData(userId);
    data.uploads = data.uploads.filter(img => img.id !== imageId);
    await this.setUserData(userId, data);
    console.log('🗑️ Deleted user upload:', imageId);
  }

  // ====== FOLDERS METHODS ======

  async createFolder(userId: string, name: string, description?: string): Promise<UserFolder> {
    const folder: UserFolder = {
      id: `folder_${Date.now()}`,
      name,
      userId,
      createdAt: new Date().toISOString(),
      imageIds: [],
      description
    };

    const data = await this.getUserData(userId);
    data.folders.unshift(folder);
    await this.setUserData(userId, data);
    console.log('📁 Created folder:', name);
    return folder;
  }

  async getUserFolders(userId: string): Promise<UserFolder[]> {
    const data = await this.getUserData(userId);
    return data.folders;
  }

  async addImageToFolder(userId: string, folderId: string, imageId: string): Promise<void> {
    const data = await this.getUserData(userId);
    const folder = data.folders.find(f => f.id === folderId);
    
    if (folder && !folder.imageIds.includes(imageId)) {
      folder.imageIds.push(imageId);
      await this.setUserData(userId, data);
      console.log('📁 Added image to folder:', folder.name);
    }
  }

  async removeImageFromFolder(userId: string, folderId: string, imageId: string): Promise<void> {
    const data = await this.getUserData(userId);
    const folder = data.folders.find(f => f.id === folderId);
    
    if (folder) {
      folder.imageIds = folder.imageIds.filter(id => id !== imageId);
      await this.setUserData(userId, data);
      console.log('📁 Removed image from folder:', folder.name);
    }
  }

  async deleteFolder(userId: string, folderId: string): Promise<void> {
    const data = await this.getUserData(userId);
    data.folders = data.folders.filter(f => f.id !== folderId);
    await this.setUserData(userId, data);
    console.log('🗑️ Deleted folder:', folderId);
  }

  // ====== LIKES METHODS ======

  async likeImage(userId: string, imageId: string, imageUrl: string, title: string, author: string): Promise<void> {
    const like: UserLike = {
      id: `like_${Date.now()}`,
      userId,
      imageId,
      imageUrl,
      title,
      author,
      likedAt: new Date().toISOString()
    };

    const data = await this.getUserData(userId);
    // Check if already liked
    if (!data.likes.find(l => l.imageId === imageId)) {
      data.likes.unshift(like);
      await this.setUserData(userId, data);
      console.log('❤️ Liked image:', title);
    }
  }

  async unlikeImage(userId: string, imageId: string): Promise<void> {
    const data = await this.getUserData(userId);
    data.likes = data.likes.filter(l => l.imageId !== imageId);
    await this.setUserData(userId, data);
    console.log('💔 Unliked image:', imageId);
  }

  async getUserLikes(userId: string): Promise<UserLike[]> {
    const data = await this.getUserData(userId);
    return data.likes;
  }

  async isImageLiked(userId: string, imageId: string): Promise<boolean> {
    const data = await this.getUserData(userId);
    return data.likes.some(l => l.imageId === imageId);
  }

  // ====== STATS METHODS ======

  async getUserStats(userId: string) {
    const data = await this.getUserData(userId);

    return {
      uploadsCount: data.uploads.length,
      foldersCount: data.folders.length,
      likesCount: data.likes.length,
      totalImages: data.uploads.length + data.likes.length,
      lastUpdated: data.lastUpdated
    };
  }

  // ====== SYNC METHODS ======

  async syncUserData(userId: string): Promise<void> {
    console.log('🔄 Syncing user data for:', userId);
    
    // Force refresh data from KV
    if (!this.fallbackToLocal) {
      try {
        const freshData = await kv.get<UserKVData>(this.getUserKey(userId));
        if (freshData) {
          // Update localStorage with fresh KV data
          this.setLocalUserData(userId, freshData);
          console.log('✅ User data synced from Vercel KV');
        }
      } catch (error) {
        console.warn('Sync failed:', error);
      }
    }
  }

  // ====== MIGRATION METHODS ======

  async migrateFromLocalStorage(userId: string): Promise<void> {
    if (this.fallbackToLocal) return;

    console.log('🔄 Migrating localStorage data to Vercel KV...');
    
    const localData = this.getLocalUserData(userId);
    
    if (localData.uploads.length > 0 || localData.folders.length > 0 || localData.likes.length > 0) {
      try {
        await this.setUserData(userId, localData);
        console.log('✅ Successfully migrated data to Vercel KV');
      } catch (error) {
        console.error('❌ Migration failed:', error);
      }
    }
  }
}

// Legacy singleton for backward compatibility
class LocalStorageManager {
  private kvStorage = VercelKVUserStorage.getInstance();

  // Proxy all methods to KV storage
  async saveUserUpload(userId: string, image: UserImage): Promise<void> {
    return this.kvStorage.saveUserUpload(userId, image);
  }

  async getUserUploads(userId: string): Promise<UserImage[]> {
    return this.kvStorage.getUserUploads(userId);
  }

  async deleteUserUpload(userId: string, imageId: string): Promise<void> {
    return this.kvStorage.deleteUserUpload(userId, imageId);
  }

  async createFolder(userId: string, name: string, description?: string): Promise<UserFolder> {
    return this.kvStorage.createFolder(userId, name, description);
  }

  async getUserFolders(userId: string): Promise<UserFolder[]> {
    return this.kvStorage.getUserFolders(userId);
  }

  async addImageToFolder(userId: string, folderId: string, imageId: string): Promise<void> {
    return this.kvStorage.addImageToFolder(userId, folderId, imageId);
  }

  async removeImageFromFolder(userId: string, folderId: string, imageId: string): Promise<void> {
    return this.kvStorage.removeImageFromFolder(userId, folderId, imageId);
  }

  async deleteFolder(userId: string, folderId: string): Promise<void> {
    return this.kvStorage.deleteFolder(userId, folderId);
  }

  async likeImage(userId: string, imageId: string, imageUrl: string, title: string, author: string): Promise<void> {
    return this.kvStorage.likeImage(userId, imageId, imageUrl, title, author);
  }

  async unlikeImage(userId: string, imageId: string): Promise<void> {
    return this.kvStorage.unlikeImage(userId, imageId);
  }

  async getUserLikes(userId: string): Promise<UserLike[]> {
    return this.kvStorage.getUserLikes(userId);
  }

  async isImageLiked(userId: string, imageId: string): Promise<boolean> {
    return this.kvStorage.isImageLiked(userId, imageId);
  }

  async getUserStats(userId: string) {
    return this.kvStorage.getUserStats(userId);
  }
}

export const userStorage = new LocalStorageManager();
export const kvUserStorage = VercelKVUserStorage.getInstance();