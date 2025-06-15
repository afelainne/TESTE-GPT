'use client';

import { useState } from 'react';
import { Bookmark, Plus, Search, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Block } from '@/types/user';

interface SavedSectionProps {
  user: User;
  searchQuery: string;
}

export function SavedSection({ user, searchQuery }: SavedSectionProps) {
  console.log('SavedSection rendered for user:', user.username);

  // Mock saved blocks
  const blocks: Block[] = [
    {
      id: '1',
      userId: 'user1',
      name: 'Brand Inspiration',
      description: 'Collection of brand identity references',
      isPrivate: false,
      items: ['item1', 'item2', 'item3'],
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
      createdAt: '2024-06-01',
      updatedAt: '2024-06-06'
    },
    {
      id: '2',
      userId: 'user1',
      name: 'Typography Studies',
      description: 'Swiss and modern typography examples',
      isPrivate: true,
      items: ['item4', 'item5'],
      coverImage: 'https://images.unsplash.com/photo-1609445947446-8077928d8d42?w=400&q=80',
      createdAt: '2024-05-15',
      updatedAt: '2024-06-05'
    },
    {
      id: '3',
      userId: 'user1',
      name: 'UI Components',
      description: 'Modern UI design patterns and components',
      isPrivate: false,
      items: ['item6'],
      coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80',
      createdAt: '2024-06-07',
      updatedAt: '2024-06-07'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl swiss-title font-light mb-2">My Blocks</h1>
          <p className="swiss-body text-swiss-gray-600">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} • {blocks.reduce((total, block) => total + block.items.length, 0)} total items
          </p>
        </div>
        
        <Button className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          New Block
        </Button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-swiss-gray-500" />
          <Input
            placeholder="Search blocks..."
            className="pl-10 border-swiss-black focus:border-swiss-black"
          />
        </div>
      </div>

      {/* Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blocks.map((block) => (
          <div key={block.id} className="border border-swiss-black rounded overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-swiss-gray-100">
              {block.coverImage ? (
                <img
                  src={block.coverImage}
                  alt={block.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Bookmark className="w-12 h-12 text-swiss-gray-400" />
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="swiss-body font-medium">{block.name}</h3>
                <div className="flex items-center space-x-2">
                  {block.isPrivate ? (
                    <Lock className="w-4 h-4 text-swiss-gray-500" />
                  ) : (
                    <Globe className="w-4 h-4 text-swiss-gray-500" />
                  )}
                </div>
              </div>
              {block.description && (
                <p className="text-sm swiss-body text-swiss-gray-600 mb-3">
                  {block.description}
                </p>
              )}
              <div className="text-xs swiss-mono text-swiss-gray-600">
                {block.items.length} item{block.items.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 border border-swiss-black mx-auto mb-6 flex items-center justify-center">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-xl swiss-title font-light mb-3">
            No blocks yet
          </h3>
          <p className="text-sm swiss-body text-swiss-gray-700 mb-6">
            Start organizing your saved designs into blocks
          </p>
          <Button className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800">
            Create Your First Block
          </Button>
        </div>
      )}
    </div>
  );
}