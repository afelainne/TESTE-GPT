'use client';

import { Users, Search, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/auth';
import { socialFeaturesManager } from '@/lib/socialFeatures';
import { useState, useEffect } from 'react';
import { UserPlus, MessageCircle } from 'lucide-react';

interface FollowingSectionProps {
  user: User;
  searchQuery: string;
}

export function FollowingSection({ user, searchQuery }: FollowingSectionProps) {
  console.log('FollowingSection rendered for user:', user.username);

  // Mock following data
  const following = [
    {
      id: '1',
      username: 'swiss_designer',
      fullName: 'Maria Silva',
      avatar: undefined,
      bio: 'Swiss design enthusiast • Visual identity specialist',
      followersCount: 12847,
      uploadsCount: 234,
      isVerified: true,
      followedAt: '2024-05-15'
    },
    {
      id: '2',
      username: 'minimal_studio',
      fullName: 'João Santos',
      avatar: undefined,
      bio: 'Minimal design studio • Clean aesthetics',
      followersCount: 8934,
      uploadsCount: 156,
      isVerified: false,
      followedAt: '2024-04-20'
    }
  ];

  const handleUnfollow = (userId: string) => {
    console.log('Unfollowing user:', userId);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl swiss-title font-light mb-2">Following</h1>
          <p className="swiss-body text-swiss-gray-600">
            Following {user.followingCount} designer{user.followingCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-swiss-gray-500" />
          <Input
            placeholder="Search following..."
            className="pl-10 border-swiss-black focus:border-swiss-black"
          />
        </div>
      </div>

      {/* Following List */}
      <div className="space-y-4">
        {following.map((followedUser) => (
          <div key={followedUser.id} className="border border-swiss-black rounded p-6 hover:bg-swiss-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={followedUser.avatar} />
                  <AvatarFallback className="text-lg">
                    {followedUser.fullName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="swiss-body font-medium">{followedUser.fullName}</h3>
                    {followedUser.isVerified && (
                      <div className="w-4 h-4 bg-swiss-black rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm swiss-body text-swiss-gray-600 mb-2">
                    @{followedUser.username}
                  </p>
                  <p className="text-sm swiss-body text-swiss-gray-700 mb-3">
                    {followedUser.bio}
                  </p>
                  <div className="flex items-center space-x-4 text-xs swiss-mono text-swiss-gray-600">
                    <span>{followedUser.followersCount.toLocaleString()} followers</span>
                    <span>{followedUser.uploadsCount} uploads</span>
                    <span>Following since {followedUser.followedAt}</span>
                  </div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnfollow(followedUser.id)}
                className="border-swiss-black hover:bg-red-50 hover:border-red-500 hover:text-red-600"
              >
                <UserMinus className="w-4 h-4 mr-2" />
                Unfollow
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {following.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 border border-swiss-black mx-auto mb-6 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl swiss-title font-light mb-3">
            Not following anyone yet
          </h3>
          <p className="text-sm swiss-body text-swiss-gray-700 mb-6">
            Discover and follow designers to see their latest work
          </p>
          <Button className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800">
            Discover Designers
          </Button>
        </div>
      )}
    </div>
  );
}