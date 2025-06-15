"use client";

import { authManager } from '@/lib/auth';

export interface Like {
  id: string;
  userId: string;
  itemId: string;
  createdAt: string;
}

export interface FollowRelation {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

class SocialFeaturesManager {
  private static instance: SocialFeaturesManager;
  private likes: Like[] = [];
  private follows: FollowRelation[] = [];
  private friendRequests: FriendRequest[] = [];

  static getInstance(): SocialFeaturesManager {
    if (!SocialFeaturesManager.instance) {
      SocialFeaturesManager.instance = new SocialFeaturesManager();
    }
    return SocialFeaturesManager.instance;
  }

  // Likes Management
  async likeItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = authManager.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if already liked
    const existingLike = this.likes.find(
      like => like.userId === currentUser.id && like.itemId === itemId
    );

    if (existingLike) {
      return { success: false, error: 'Item already liked' };
    }

    const newLike: Like = {
      id: 'like_' + Date.now(),
      userId: currentUser.id,
      itemId: itemId,
      createdAt: new Date().toISOString()
    };

    this.likes.push(newLike);
    this.saveToStorage();
    console.log('🤍 Item liked:', itemId, 'by user:', currentUser.email);
    
    return { success: true };
  }

  async unlikeItem(itemId: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = authManager.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const likeIndex = this.likes.findIndex(
      like => like.userId === currentUser.id && like.itemId === itemId
    );

    if (likeIndex === -1) {
      return { success: false, error: 'Like not found' };
    }

    this.likes.splice(likeIndex, 1);
    this.saveToStorage();
    console.log('💔 Item unliked:', itemId, 'by user:', currentUser.email);
    
    return { success: true };
  }

  isLiked(itemId: string): boolean {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) return false;

    return this.likes.some(
      like => like.userId === currentUser.id && like.itemId === itemId
    );
  }

  getLikesCount(itemId: string): number {
    return this.likes.filter(like => like.itemId === itemId).length;
  }

  getUserLikes(userId?: string): Like[] {
    const targetUserId = userId || authManager.getCurrentUser()?.id;
    if (!targetUserId) return [];

    return this.likes.filter(like => like.userId === targetUserId);
  }

  // Follow Management
  async followUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = authManager.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    if (currentUser.id === userId) {
      return { success: false, error: 'Cannot follow yourself' };
    }

    // Check if already following
    const existingFollow = this.follows.find(
      follow => follow.followerId === currentUser.id && follow.followingId === userId
    );

    if (existingFollow) {
      return { success: false, error: 'Already following this user' };
    }

    const newFollow: FollowRelation = {
      id: 'follow_' + Date.now(),
      followerId: currentUser.id,
      followingId: userId,
      createdAt: new Date().toISOString()
    };

    this.follows.push(newFollow);
    this.saveToStorage();
    console.log('👥 User followed:', userId, 'by:', currentUser.email);
    
    return { success: true };
  }

  async unfollowUser(userId: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = authManager.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const followIndex = this.follows.findIndex(
      follow => follow.followerId === currentUser.id && follow.followingId === userId
    );

    if (followIndex === -1) {
      return { success: false, error: 'Not following this user' };
    }

    this.follows.splice(followIndex, 1);
    this.saveToStorage();
    console.log('👋 User unfollowed:', userId, 'by:', currentUser.email);
    
    return { success: true };
  }

  isFollowing(userId: string): boolean {
    const currentUser = authManager.getCurrentUser();
    if (!currentUser) return false;

    return this.follows.some(
      follow => follow.followerId === currentUser.id && follow.followingId === userId
    );
  }

  getFollowersCount(userId: string): number {
    return this.follows.filter(follow => follow.followingId === userId).length;
  }

  getFollowingCount(userId: string): number {
    return this.follows.filter(follow => follow.followerId === userId).length;
  }

  getFollowers(userId: string): FollowRelation[] {
    return this.follows.filter(follow => follow.followingId === userId);
  }

  getFollowing(userId: string): FollowRelation[] {
    return this.follows.filter(follow => follow.followerId === userId);
  }

  // Friend Requests
  async sendFriendRequest(receiverId: string): Promise<{ success: boolean; error?: string }> {
    const currentUser = authManager.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    if (currentUser.id === receiverId) {
      return { success: false, error: 'Cannot send friend request to yourself' };
    }

    // Check if request already exists
    const existingRequest = this.friendRequests.find(
      req => req.senderId === currentUser.id && req.receiverId === receiverId && req.status === 'pending'
    );

    if (existingRequest) {
      return { success: false, error: 'Friend request already sent' };
    }

    const newRequest: FriendRequest = {
      id: 'friend_req_' + Date.now(),
      senderId: currentUser.id,
      receiverId: receiverId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.friendRequests.push(newRequest);
    this.saveToStorage();
    console.log('🤝 Friend request sent to:', receiverId, 'by:', currentUser.email);
    
    return { success: true };
  }

  async respondToFriendRequest(requestId: string, response: 'accepted' | 'rejected'): Promise<{ success: boolean; error?: string }> {
    const currentUser = authManager.getCurrentUser();
    
    if (!currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    const request = this.friendRequests.find(req => req.id === requestId && req.receiverId === currentUser.id);
    
    if (!request) {
      return { success: false, error: 'Friend request not found' };
    }

    request.status = response;
    
    // If accepted, create mutual follow relationship
    if (response === 'accepted') {
      await this.followUser(request.senderId);
      // Also make the sender follow back (mutual friendship)
      const mutualFollow: FollowRelation = {
        id: 'follow_mutual_' + Date.now(),
        followerId: request.senderId,
        followingId: currentUser.id,
        createdAt: new Date().toISOString()
      };
      this.follows.push(mutualFollow);
    }

    this.saveToStorage();
    console.log('🤝 Friend request', response + ':', requestId);
    
    return { success: true };
  }

  getPendingFriendRequests(userId?: string): FriendRequest[] {
    const targetUserId = userId || authManager.getCurrentUser()?.id;
    if (!targetUserId) return [];

    return this.friendRequests.filter(
      req => req.receiverId === targetUserId && req.status === 'pending'
    );
  }

  getSentFriendRequests(userId?: string): FriendRequest[] {
    const targetUserId = userId || authManager.getCurrentUser()?.id;
    if (!targetUserId) return [];

    return this.friendRequests.filter(
      req => req.senderId === targetUserId && req.status === 'pending'
    );
  }

  // Storage Management
  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('social_likes', JSON.stringify(this.likes));
      localStorage.setItem('social_follows', JSON.stringify(this.follows));
      localStorage.setItem('social_friend_requests', JSON.stringify(this.friendRequests));
    }
  }

  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const storedLikes = localStorage.getItem('social_likes');
      const storedFollows = localStorage.getItem('social_follows');
      const storedRequests = localStorage.getItem('social_friend_requests');

      if (storedLikes) {
        try {
          this.likes = JSON.parse(storedLikes);
        } catch (error) {
          console.error('Error loading likes from storage:', error);
          this.likes = [];
        }
      }

      if (storedFollows) {
        try {
          this.follows = JSON.parse(storedFollows);
        } catch (error) {
          console.error('Error loading follows from storage:', error);
          this.follows = [];
        }
      }

      if (storedRequests) {
        try {
          this.friendRequests = JSON.parse(storedRequests);
        } catch (error) {
          console.error('Error loading friend requests from storage:', error);
          this.friendRequests = [];
        }
      }

      console.log('Social features loaded from storage');
    }
  }

  // Get social stats for a user
  getUserSocialStats(userId: string) {
    return {
      likesGiven: this.getUserLikes(userId).length,
      followersCount: this.getFollowersCount(userId),
      followingCount: this.getFollowingCount(userId),
      pendingRequests: this.getPendingFriendRequests(userId).length,
      sentRequests: this.getSentFriendRequests(userId).length
    };
  }
}

export const socialFeaturesManager = SocialFeaturesManager.getInstance();