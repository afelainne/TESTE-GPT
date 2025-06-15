"use client";

export interface UserFolder {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  itemCount: number;
}

export interface UserContent {
  id: string;
  title: string;
  imageUrl: string;
  contentType: 'image' | 'video' | 'gif';
  userId: string;
  uploadType: 'file' | 'url';
  originalUrl?: string;
  folders: string[]; // folder IDs
  createdAt: Date;
  tags: string[];
}

export class UserContentManager {
  private static instance: UserContentManager;
  private contents: UserContent[] = [];
  private folders: UserFolder[] = [];

  static getInstance(): UserContentManager {
    if (!UserContentManager.instance) {
      UserContentManager.instance = new UserContentManager();
      UserContentManager.instance.loadFromStorage();
    }
    return UserContentManager.instance;
  }

  // Content Management
  addContent(content: Omit<UserContent, 'id' | 'createdAt'>): UserContent {
    // Ensure user-specific ID to prevent conflicts
    const uniqueId = `${content.userId}_content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newContent: UserContent = {
      ...content,
      id: uniqueId,
      createdAt: new Date()
    };

    this.contents.push(newContent);
    this.saveToStorage();
    console.log('Content added for user:', content.userId, newContent.title);
    return newContent;
  }

  getUserContents(userId: string): UserContent[] {
    return this.contents.filter(content => content.userId === userId);
  }

  getContentsByFolder(folderId: string): UserContent[] {
    return this.contents.filter(content => content.folders.includes(folderId));
  }

  deleteContent(contentId: string): boolean {
    const index = this.contents.findIndex(c => c.id === contentId);
    if (index > -1) {
      this.contents.splice(index, 1);
      this.saveToStorage();
      console.log('Content deleted:', contentId);
      return true;
    }
    return false;
  }

  // Folder Management
  createFolder(name: string, userId: string): UserFolder {
    // Ensure user-specific folder ID to prevent conflicts
    const uniqueId = `${userId}_folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newFolder: UserFolder = {
      id: uniqueId,
      name,
      userId,
      createdAt: new Date(),
      itemCount: 0
    };

    this.folders.push(newFolder);
    this.saveToStorage();
    console.log('Folder created for user:', userId, name);
    return newFolder;
  }

  getUserFolders(userId: string): UserFolder[] {
    return this.folders
      .filter(folder => folder.userId === userId)
      .map(folder => ({
        ...folder,
        itemCount: this.getContentsByFolder(folder.id).length
      }));
  }

  deleteFolder(folderId: string): boolean {
    const index = this.folders.findIndex(f => f.id === folderId);
    if (index > -1) {
      // Remove folder from all contents
      this.contents.forEach(content => {
        content.folders = content.folders.filter(id => id !== folderId);
      });
      
      this.folders.splice(index, 1);
      this.saveToStorage();
      console.log('Folder deleted:', folderId);
      return true;
    }
    return false;
  }

  // Save to folder
  saveContentToFolder(contentId: string, folderId: string): boolean {
    const content = this.contents.find(c => c.id === contentId);
    const folder = this.folders.find(f => f.id === folderId);

    // Validate that folder belongs to the same user or admin
    if (content && folder && !content.folders.includes(folderId)) {
      // Check if user has access to this folder
      if (content.userId === folder.userId || content.userId.includes('admin')) {
        content.folders.push(folderId);
        this.saveToStorage();
        console.log('Content saved to folder:', contentId, '->', folderId);
        return true;
      } else {
        console.warn('Access denied: User cannot save to this folder');
      }
    }
    return false;
  }

  removeContentFromFolder(contentId: string, folderId: string): boolean {
    const content = this.contents.find(c => c.id === contentId);
    if (content) {
      content.folders = content.folders.filter(id => id !== folderId);
      this.saveToStorage();
      console.log('Content removed from folder:', contentId, 'from', folderId);
      return true;
    }
    return false;
  }

  // Storage
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_contents', JSON.stringify(this.contents));
      localStorage.setItem('user_folders', JSON.stringify(this.folders));
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedContents = localStorage.getItem('user_contents');
        const storedFolders = localStorage.getItem('user_folders');

        if (storedContents) {
          this.contents = JSON.parse(storedContents);
        } else {
          // Load initial sample content if no user content exists
          this.loadInitialContent();
        }

        if (storedFolders) {
          this.folders = JSON.parse(storedFolders);
        }

        console.log('User content loaded from storage');
      } catch (error) {
        console.error('Error loading user content from storage:', error);
        this.contents = [];
        this.folders = [];
        this.loadInitialContent();
      }
    }
  }

  private loadInitialContent(): void {
    // No initial content - platform starts empty and grows with user uploads
    this.contents = [];
    console.log('Platform initialized with no sample content - only user uploads will be shown');
  }

  // Get all content for homepage (including indexed content from cache + uploaded content)
  getAllUserContent(): UserContent[] {
    let allContent = [...this.contents];
    
    // Try to get content from local cache (Are.na indexed content)
    if (typeof window !== 'undefined') {
      try {
        const cacheContent = localStorage.getItem('local_vector_cache');
        if (cacheContent) {
          const cachedVectors = JSON.parse(cacheContent);
          console.log('Found cached vectors:', cachedVectors.length);
          
          // Convert cached vectors to UserContent format  
          const convertedContent: UserContent[] = cachedVectors.map((vector: any) => ({
            id: `cached_${vector.id}`,
            title: vector.title || 'Untitled',
            imageUrl: vector.image_url,
            contentType: 'image' as const,
            userId: 'arena_indexed',
            uploadType: 'url' as const,
            originalUrl: vector.source_url,
            folders: [],
            tags: ['arena', 'indexed'],
            createdAt: new Date(vector.created_at || Date.now())
          }));
          
          allContent = [...allContent, ...convertedContent];
          console.log('Added cached content to homepage:', convertedContent.length);
        }

        // Also get uploaded content from local storage
        const uploadedContent = localStorage.getItem('uploaded_content_cache');
        if (uploadedContent) {
          const uploadedVectors = JSON.parse(uploadedContent);
          console.log('Found uploaded content cache:', uploadedVectors.length);
          
          // Convert uploaded content to UserContent format
          const convertedUploads: UserContent[] = uploadedVectors.map((upload: any) => ({
            id: `upload_${upload.id}`,
            title: upload.title || 'User Upload',
            imageUrl: upload.image_url,
            contentType: 'image' as const,
            userId: 'user_uploaded',
            uploadType: 'file' as const,
            originalUrl: upload.source_url || upload.image_url,
            folders: [],
            tags: ['uploaded', 'user-content'],
            createdAt: new Date(upload.created_at || Date.now())
          }));
          
          allContent = [...allContent, ...convertedUploads];
          console.log('Added uploaded content to homepage:', convertedUploads.length);
        }
      } catch (error) {
        console.warn('Error loading cached content:', error);
      }
    }
    
    return allContent.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const userContentManager = UserContentManager.getInstance();