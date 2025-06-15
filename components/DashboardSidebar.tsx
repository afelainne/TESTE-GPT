'use client';

import { Home, Upload, Heart, Bookmark, Users, User, Settings, TrendingUp, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/lib/auth';

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: UserType;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'uploads', label: 'My Uploads', icon: Upload },
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'likes', label: 'Liked', icon: Heart },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar({ activeSection, onSectionChange, user }: DashboardSidebarProps) {
  console.log('DashboardSidebar rendered with active section:', activeSection);
  console.log('DashboardSidebar received user:', user);

  // Safe fallbacks for user data
  const displayName = user.fullName || user.name || user.email.split('@')[0] || 'User';
  const username = user.username || user.email.split('@')[0] || 'user';
  const avatar = user.avatar;

  return (
    <aside className="w-64 border-r border-swiss-black bg-swiss-white h-screen sticky top-18">
      {/* User Profile Card */}
      <div className="p-6 border-b border-swiss-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={avatar} />
            <AvatarFallback className="text-lg">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm swiss-body font-medium truncate">
              {displayName}
            </h3>
            <p className="text-xs swiss-mono text-swiss-gray-600 truncate">
              @{username}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg swiss-title font-light">
              {(user.uploadsCount || 0).toLocaleString()}
            </div>
            <div className="text-xs swiss-mono text-swiss-gray-600">
              UPLOADS
            </div>
          </div>
          <div>
            <div className="text-lg swiss-title font-light">
              {(user.followersCount || 0).toLocaleString()}
            </div>
            <div className="text-xs swiss-mono text-swiss-gray-600">
              FOLLOWERS
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start h-12 ${
                  isActive 
                    ? 'bg-swiss-black text-swiss-white' 
                    : 'hover:bg-swiss-gray-50 text-swiss-black'
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
        
        {/* Quick Stats */}
        <div className="mt-8 pt-6 border-t border-swiss-gray-200">
          <div className="space-y-3 text-xs swiss-mono">
            <div className="flex justify-between">
              <span className="text-swiss-gray-600">Profile Views</span>
              <span className="font-medium">2,847</span>
            </div>
            <div className="flex justify-between">
              <span className="text-swiss-gray-600">This Month</span>
              <span className="font-medium">+18%</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4 border-swiss-black hover:bg-swiss-gray-50"
            onClick={() => window.open('/profile/' + username, '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Public Profile
          </Button>
        </div>
      </nav>
    </aside>
  );
}