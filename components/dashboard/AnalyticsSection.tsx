'use client';

import { TrendingUp, Eye, Heart, Bookmark, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types/user';

interface AnalyticsSectionProps {
  user: User;
}

export function AnalyticsSection({ user }: AnalyticsSectionProps) {
  console.log('AnalyticsSection rendered for user:', user.username);

  // Mock analytics data
  const analytics = {
    totalViews: 47832,
    totalLikes: 2847,
    totalSaves: 1294,
    newFollowers: 186,
    topPerformingUpload: {
      title: 'Minimal Brand Identity System',
      views: 3156,
      likes: 445
    },
    monthlyStats: [
      { month: 'Jan', views: 3200, likes: 234 },
      { month: 'Feb', views: 4100, likes: 289 },
      { month: 'Mar', views: 3800, likes: 267 },
      { month: 'Apr', views: 5200, likes: 345 },
      { month: 'May', views: 6100, likes: 398 },
      { month: 'Jun', views: 7200, likes: 456 }
    ]
  };

  const statCards = [
    {
      title: 'Total Profile Views',
      value: analytics.totalViews.toLocaleString(),
      change: '+12.3%',
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Total Likes',
      value: analytics.totalLikes.toLocaleString(),
      change: '+23.1%',
      icon: Heart,
      color: 'text-red-500'
    },
    {
      title: 'Total Saves',
      value: analytics.totalSaves.toLocaleString(),
      change: '+15.2%',
      icon: Bookmark,
      color: 'text-purple-600'
    },
    {
      title: 'New Followers',
      value: analytics.newFollowers.toString(),
      change: '+8.7%',
      icon: Users,
      color: 'text-green-600'
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl swiss-title font-light mb-2">Analytics</h1>
        <p className="swiss-body text-swiss-gray-600">
          Insights into your design performance and audience
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
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
                      {stat.change} this month
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
        {/* Monthly Performance */}
        <Card className="border-swiss-black">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Monthly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyStats.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-swiss-gray-200 rounded">
                  <span className="swiss-mono text-sm font-medium">{month.month}</span>
                  <div className="flex items-center space-x-4 text-sm swiss-body">
                    <span>{month.views.toLocaleString()} views</span>
                    <span>{month.likes} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Upload */}
        <Card className="border-swiss-black">
          <CardHeader>
            <CardTitle>Top Performing Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-swiss-gray-200 rounded">
              <h4 className="swiss-body font-medium mb-3">
                {analytics.topPerformingUpload.title}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl swiss-title font-light">
                    {analytics.topPerformingUpload.views.toLocaleString()}
                  </div>
                  <div className="text-xs swiss-mono text-swiss-gray-600">
                    VIEWS
                  </div>
                </div>
                <div>
                  <div className="text-2xl swiss-title font-light">
                    {analytics.topPerformingUpload.likes}
                  </div>
                  <div className="text-xs swiss-mono text-swiss-gray-600">
                    LIKES
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center text-sm swiss-body">
                <span>Engagement Rate</span>
                <span className="font-medium">14.1%</span>
              </div>
              <div className="flex justify-between items-center text-sm swiss-body">
                <span>Save Rate</span>
                <span className="font-medium">7.4%</span>
              </div>
              <div className="flex justify-between items-center text-sm swiss-body">
                <span>Share Rate</span>
                <span className="font-medium">2.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}