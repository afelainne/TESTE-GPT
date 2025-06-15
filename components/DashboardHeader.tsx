'use client';

import { useState } from 'react';
import { Search, Grid2X2, Bell, Plus, User, Settings, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  user?: {
    username: string;
    avatar?: string;
    fullName: string;
  };
}

export function DashboardHeader({ searchQuery, onSearchChange, user }: DashboardHeaderProps) {
  const [notifications] = useState(3); // Mock notification count

  console.log('DashboardHeader rendered for user:', user?.username);

  const handleLogout = () => {
    console.log('User logging out');
    // Simulate logout
    window.location.href = '/auth/login';
  };

  return (
    <header className="border-b border-swiss-black bg-swiss-white sticky top-0 z-50">
      <div className="grid grid-cols-12 gap-0 h-18">
        {/* Logo Section */}
        <div className="col-span-3 border-r border-swiss-black flex items-center px-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border border-swiss-black flex items-center justify-center">
              <Grid2X2 className="w-4 h-4" />
            </div>
            <div>
              <button
                onClick={() => window.location.href = '/'}
                className="text-left hover:opacity-70 transition-opacity"
              >
                <h1 className="text-lg swiss-title font-light tracking-wider">
                  UNBSERVED
                </h1>
                <p className="text-xs swiss-mono text-swiss-gray-600 mt-0.5">
                  DASHBOARD
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="col-span-6 border-r border-swiss-black flex items-center px-6">
          <div className="relative w-full">
            <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-swiss-gray-500" />
            <Input
              placeholder="Search your uploads, saved items, users..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-6 border-none bg-transparent text-sm focus:ring-0 focus:outline-none placeholder:text-swiss-gray-400 swiss-body"
            />
          </div>
        </div>

        {/* User Actions Section */}
        <div className="col-span-3 flex items-center justify-end px-6 space-x-4">
          {/* Upload Button */}
          <Button
            variant="outline"
            size="sm"
            className="border-swiss-black hover:bg-swiss-gray-50"
            onClick={() => console.log('Upload clicked')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload
          </Button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-swiss-gray-50 rounded">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 p-2 hover:bg-swiss-gray-50 rounded">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs">
                    {user?.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm swiss-body hidden sm:block">
                  {user?.username || 'User'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}