'use client';

import { useState, useEffect } from 'react';
import { MapPin, Globe, Calendar, Users, Upload, Heart, Eye, Grid2X2, ExternalLink, UserPlus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Block } from '@/types/user';

interface PublicProfilePageProps {
  params: {
    username: string;
  };
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('uploads');

  console.log('PublicProfilePage rendered for username:', params.username);

  useEffect(() => {
    // Mock user data loading
    console.log('Loading public profile for:', params.username);
    
    // Simulate API call
    setTimeout(() => {
      setUser({
        id: '1',
        username: params.username,
        email: 'designer@example.com',
        fullName: 'João Designer',
        avatar: undefined,
        bio: 'Visual designer passionate about minimalism and Swiss typography. Creating clean, functional designs that speak volumes.',
        website: 'https://joaodesigner.com',
        location: 'São Paulo, Brasil',
        joinedAt: '2024-01-15',
        isVerified: true,
        followersCount: 1247,
        followingCount: 89,
        uploadsCount: 156,
        savedCount: 892,
        isPrivate: false,
        allowComments: true,
        showEmail: false
      });
    }, 1000);
  }, [params.username]);

  // Mock uploads data
  const uploads = [
    {
      id: '1',
      title: 'Minimal Brand Identity System',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
      likes: 389,
      views: 2847,
      uploadedAt: '2024-06-06'
    },
    {
      id: '2',
      title: 'Swiss Typography Poster',
      imageUrl: 'https://images.unsplash.com/photo-1609445947446-8077928d8d42?w=400&q=80',
      likes: 267,
      views: 1924,
      uploadedAt: '2024-06-05'
    },
    {
      id: '3',
      title: 'UI Design System',
      imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80',
      likes: 445,
      views: 3156,
      uploadedAt: '2024-06-04'
    }
  ];

  // Mock blocks data
  const publicBlocks: Block[] = [
    {
      id: '1',
      userId: '1',
      name: 'Brand Inspiration',
      description: 'Collection of brand identity references',
      isPrivate: false,
      items: ['1', '2', '3'],
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
      createdAt: '2024-06-01',
      updatedAt: '2024-06-06'
    },
    {
      id: '3',
      userId: '1',
      name: 'UI Components',
      description: 'Modern UI design patterns',
      isPrivate: false,
      items: ['4', '5'],
      coverImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&q=80',
      createdAt: '2024-06-07',
      updatedAt: '2024-06-07'
    }
  ];

  const handleFollow = () => {
    console.log('Toggle follow for user:', params.username);
    setIsFollowing(!isFollowing);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-swiss-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-swiss-black border-t-transparent mx-auto mb-4"></div>
          <p className="font-mono text-sm text-swiss-black">LOADING PROFILE</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-swiss-white">
      {/* Header */}
      <header className="border-b border-swiss-black bg-swiss-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border border-swiss-black flex items-center justify-center">
                <Grid2X2 className="w-4 h-4" />
              </div>
              <div>
                <a href="/" className="text-lg swiss-title font-light tracking-wider hover:underline">
                  UNBSERVED
                </a>
                <p className="text-xs swiss-mono text-swiss-gray-600 mt-0.5">
                  PUBLIC PROFILE
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="/" className="text-sm swiss-body hover:underline">
                Back to Feed
              </a>
              <a href="/auth/login" className="text-sm swiss-body hover:underline">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start space-y-8 md:space-y-0 md:space-x-12 mb-12">
          <div className="flex-shrink-0">
            <Avatar className="w-32 h-32 md:w-40 md:h-40">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-4xl md:text-5xl">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl swiss-title font-light">{user.fullName}</h1>
                  {user.isVerified && (
                    <div className="w-6 h-6 bg-swiss-black rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-lg swiss-mono text-swiss-gray-600 mb-4">@{user.username}</p>
              </div>
              
              <Button
                onClick={handleFollow}
                className={`${
                  isFollowing
                    ? 'bg-swiss-gray-100 text-swiss-black border-swiss-black hover:bg-red-50 hover:text-red-600 hover:border-red-500'
                    : 'bg-swiss-black text-swiss-white hover:bg-swiss-gray-800'
                }`}
                variant={isFollowing ? 'outline' : 'default'}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </div>

            {user.bio && (
              <p className="swiss-body text-swiss-gray-700 leading-relaxed mb-6 max-w-2xl">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm swiss-body text-swiss-gray-600 mb-6">
              {user.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {user.website.replace('https://', '')}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl swiss-title font-light">
                  {user.uploadsCount}
                </div>
                <div className="text-xs swiss-mono text-swiss-gray-600">
                  UPLOADS
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl swiss-title font-light">
                  {user.followersCount.toLocaleString()}
                </div>
                <div className="text-xs swiss-mono text-swiss-gray-600">
                  FOLLOWERS
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl swiss-title font-light">
                  {user.followingCount}
                </div>
                <div className="text-xs swiss-mono text-swiss-gray-600">
                  FOLLOWING
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl swiss-title font-light">
                  {publicBlocks.length}
                </div>
                <div className="text-xs swiss-mono text-swiss-gray-600">
                  PUBLIC BLOCKS
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="uploads" className="swiss-body">
              <Upload className="w-4 h-4 mr-2" />
              Uploads
            </TabsTrigger>
            <TabsTrigger value="blocks" className="swiss-body">
              <Grid2X2 className="w-4 h-4 mr-2" />
              Public Blocks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uploads">
            {uploads.length > 0 ? (
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
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{upload.likes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{upload.views}</span>
                          </span>
                        </div>
                        <span>{upload.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 border border-swiss-black mx-auto mb-6 flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl swiss-title font-light mb-3">
                  No uploads yet
                </h3>
                <p className="text-sm swiss-body text-swiss-gray-700">
                  {user.fullName} hasn't shared any designs yet
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocks">
            {publicBlocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicBlocks.map((block) => (
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
                          <Grid2X2 className="w-12 h-12 text-swiss-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="swiss-body font-medium mb-1">{block.name}</h3>
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
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 border border-swiss-black mx-auto mb-6 flex items-center justify-center">
                  <Grid2X2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl swiss-title font-light mb-3">
                  No public blocks
                </h3>
                <p className="text-sm swiss-body text-swiss-gray-700">
                  {user.fullName} hasn't made any blocks public yet
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}