'use client';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  joinedAt: string;
  isVerified: boolean;
  
  // Social counts
  followersCount: number;
  followingCount: number;
  uploadsCount: number;
  savedCount: number;
  
  // Preferences
  isPrivate: boolean;
  allowComments: boolean;
  showEmail: boolean;
}

export interface UserUpload {
  id: string;
  userId: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'gif';
  tags: string[];
  category: string;
  
  // Engagement
  likes: number;
  saves: number;
  views: number;
  comments: Comment[];
  
  // Metadata
  uploadedAt: string;
  isPublic: boolean;
  allowDownload: boolean;
  
  // Visual analysis
  colors: string[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface Comment {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

export interface Block {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  items: string[]; // IDs of saved inspirations
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy alias for backward compatibility
export interface SavedCollection extends Block {}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'follow' | 'comment' | 'save' | 'mention';
  actorId: string;
  actorUsername: string;
  actorAvatar?: string;
  targetId?: string; // Upload ID, comment ID, etc.
  message: string;
  isRead: boolean;
  createdAt: string;
}