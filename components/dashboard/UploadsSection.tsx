'use client';

import { useState } from 'react';
import { Grid2X2, List, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from '@/types/user';

interface UploadsSectionProps {
  user: User;
  searchQuery: string;
}

export function UploadsSection({ user, searchQuery }: UploadsSectionProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');

  console.log('UploadsSection rendered for user:', user.username);

  // Mock uploads data
  const uploads = [
    {
      id: '1',
      title: 'Minimal Brand Identity System',
      category: 'branding',
      uploadedAt: '2024-06-06',
      views: 2847,
      likes: 389,
      saves: 156,
      comments: 23,
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'
    },
    {
      id: '2',
      title: 'Swiss Typography Poster Collection',
      category: 'typography',
      uploadedAt: '2024-06-05',
      views: 1924,
      likes: 267,
      saves: 89,
      comments: 18,
      imageUrl: 'https://images.unsplash.com/photo-1609445947446-8077928d8d42?w=400&q=80'
    },
    {
      id: '3',
      title: 'UI Design System Components',
      category: 'ui-design',
      uploadedAt: '2024-06-04',
      views: 3156,
      likes: 445,
      saves: 234,
      comments: 34,
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl swiss-title font-light mb-2">My Uploads</h1>
          <p className="swiss-body text-swiss-gray-600">
            {uploads.length} design{uploads.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Toggle */}
          <div className="flex border border-swiss-black rounded overflow-hidden">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`rounded-none ${viewMode === 'grid' ? 'bg-swiss-black text-swiss-white' : ''}`}
            >
              <Grid2X2 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`rounded-none ${viewMode === 'list' ? 'bg-swiss-black text-swiss-white' : ''}`}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-8 p-4 border border-swiss-gray-200 rounded">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-swiss-gray-500" />
            <Input
              placeholder="Search your uploads..."
              className="pl-10 border-swiss-black focus:border-swiss-black"
            />
          </div>
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48 border-swiss-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-liked">Most Liked</SelectItem>
            <SelectItem value="most-viewed">Most Viewed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48 border-swiss-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ui-design">UI Design</SelectItem>
            <SelectItem value="branding">Branding</SelectItem>
            <SelectItem value="typography">Typography</SelectItem>
            <SelectItem value="photography">Photography</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Uploads Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((upload) => (
            <div key={upload.id} className="border border-swiss-black rounded overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-swiss-gray-100">
                <img
                  src={upload.imageUrl}
                  alt={upload.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="swiss-body font-medium mb-2">{upload.title}</h3>
                <div className="flex items-center justify-between text-xs swiss-mono text-swiss-gray-600">
                  <span>{upload.views} views</span>
                  <span>{upload.likes} likes</span>
                  <span>{upload.saves} saves</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {uploads.map((upload) => (
            <div key={upload.id} className="border border-swiss-black rounded p-4 hover:bg-swiss-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-swiss-gray-100 rounded overflow-hidden">
                  <img
                    src={upload.imageUrl}
                    alt={upload.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="swiss-body font-medium mb-1">{upload.title}</h3>
                  <p className="text-sm swiss-body text-swiss-gray-600 capitalize">
                    {upload.category.replace('-', ' ')} • {upload.uploadedAt}
                  </p>
                </div>
                <div className="flex items-center space-x-6 text-sm swiss-mono text-swiss-gray-600">
                  <span>{upload.views} views</span>
                  <span>{upload.likes} likes</span>
                  <span>{upload.saves} saves</span>
                  <span>{upload.comments} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {uploads.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 border border-swiss-black mx-auto mb-6 flex items-center justify-center">
            <Grid2X2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl swiss-title font-light mb-3">
            No uploads yet
          </h3>
          <p className="text-sm swiss-body text-swiss-gray-700 mb-6">
            Start sharing your designs with the community
          </p>
          <Button className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800">
            Upload Your First Design
          </Button>
        </div>
      )}
    </div>
  );
}