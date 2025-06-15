'use client';

import { Heart, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/lib/auth';
import { socialFeaturesManager } from '@/lib/socialFeatures';
import { useState, useEffect } from 'react';

interface LikesSectionProps {
  user: User;
  searchQuery: string;
}

export function LikesSection({ user, searchQuery }: LikesSectionProps) {
  const [likedItems, setLikedItems] = useState<any[]>([]);
  
  console.log('LikesSection rendered for user:', user.username);

  useEffect(() => {
    // Load liked items from social features manager
    socialFeaturesManager.loadFromStorage();
    const userLikes = socialFeaturesManager.getUserLikes(user.id);
    setLikedItems(userLikes);
    console.log('User likes loaded:', userLikes.length);
  }, [user.id]);

  // Mock liked designs - will be replaced with real data
  const likedDesigns = [
    {
      id: '1',
      title: 'Minimal Website Design',
      author: 'design_studio',
      likedAt: '2024-06-06',
      category: 'ui-design',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80'
    },
    {
      id: '2',
      title: 'Swiss Poster Series',
      author: 'swiss_designer',
      likedAt: '2024-06-05',
      category: 'typography',
      imageUrl: 'https://images.unsplash.com/photo-1609445947446-8077928d8d42?w=400&q=80'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl swiss-title font-light mb-2">Liked Designs</h1>
          <p className="swiss-body text-swiss-gray-600">
            {likedDesigns.length} design{likedDesigns.length !== 1 ? 's' : ''} liked
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-8 p-4 border border-swiss-gray-200 rounded">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-swiss-gray-500" />
            <Input
              placeholder="Search liked designs..."
              className="pl-10 border-swiss-black focus:border-swiss-black"
            />
          </div>
        </div>
        
        <Select defaultValue="newest">
          <SelectTrigger className="w-48 border-swiss-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Recently Liked</SelectItem>
            <SelectItem value="oldest">Oldest Liked</SelectItem>
            <SelectItem value="category">By Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liked Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedDesigns.map((design) => (
          <div key={design.id} className="border border-swiss-black rounded overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-swiss-gray-100">
              <img
                src={design.imageUrl}
                alt={design.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="swiss-body font-medium mb-1">{design.title}</h3>
              <p className="text-sm swiss-body text-swiss-gray-600 mb-2">
                by @{design.author}
              </p>
              <div className="flex items-center justify-between text-xs swiss-mono text-swiss-gray-600">
                <span className="capitalize">{design.category.replace('-', ' ')}</span>
                <span>Liked {design.likedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {likedDesigns.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 border border-swiss-black mx-auto mb-6 flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl swiss-title font-light mb-3">
            No liked designs yet
          </h3>
          <p className="text-sm swiss-body text-swiss-gray-700 mb-6">
            Start exploring and like designs you love
          </p>
        </div>
      )}
    </div>
  );
}