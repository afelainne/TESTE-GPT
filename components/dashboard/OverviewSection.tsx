'use client';

import { Plus, TrendingUp, Heart, Bookmark, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types/user';

interface OverviewSectionProps {
  user: User;
  onUploadClick: () => void;
}

export function OverviewSection({ user, onUploadClick }: OverviewSectionProps) {
  console.log('OverviewSection rendered for user:', user.username);

  // Mock data for demonstration
  const stats = [
    {
      title: 'Total Views',
      value: '47,832',
      change: '+12.3%',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Likes This Month',
      value: '2,847',
      change: '+23.1%',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      title: 'New Followers',
      value: '186',
      change: '+8.7%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Saves',
      value: '1,294',
      change: '+15.2%',
      icon: Bookmark,
      color: 'text-purple-600'
    }
  ];

  const recentUploads = [
    {
      id: '1',
      title: 'Minimal Brand Identity',
      uploadedAt: '2 hours ago',
      views: 347,
      likes: 28
    },
    {
      id: '2',
      title: 'Swiss Typography Poster',
      uploadedAt: '1 day ago',
      views: 1284,
      likes: 156
    },
    {
      id: '3',
      title: 'UI Design System',
      uploadedAt: '3 days ago',
      views: 2847,
      likes: 389
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl swiss-title font-light mb-2">
            Welcome back, {user.fullName.split(' ')[0]}
          </h1>
          <p className="swiss-body text-swiss-gray-600">
            Here's what's happening with your designs today
          </p>
        </div>
        
        <Button 
          onClick={onUploadClick}
          className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload New Design
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-swiss-black">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs swiss-mono text-swiss-gray-600 mb-1">
                      {stat.title.toUpperCase()}
                    </p>
                    <p className="text-2xl swiss-title font-light">
                      {stat.value}
                    </p>
                    <p className={`text-xs swiss-mono mt-1 ${stat.color}`}>
                      {stat.change}
                    </p>
                  </div>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="border-swiss-black">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center justify-between p-4 border border-swiss-gray-200 rounded">
                  <div>
                    <h4 className="swiss-body font-medium">{upload.title}</h4>
                    <p className="text-xs swiss-mono text-swiss-gray-600">
                      {upload.uploadedAt}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm swiss-body">{upload.views} views</p>
                    <p className="text-xs swiss-mono text-swiss-gray-600">
                      {upload.likes} likes
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="w-full mt-4 border-swiss-black">
              View All Uploads
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-swiss-black">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start border-swiss-black hover:bg-swiss-gray-50"
                onClick={onUploadClick}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload New Design
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-swiss-black hover:bg-swiss-gray-50"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Create New Collection
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-swiss-black hover:bg-swiss-gray-50"
              >
                <Users className="w-4 h-4 mr-2" />
                Find Designers to Follow
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start border-swiss-black hover:bg-swiss-gray-50"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}