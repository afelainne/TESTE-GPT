"use client";

import { Search, Grid2X2, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterButton } from './FilterButton';
import { useState } from 'react';

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onHomeClick: () => void;
  currentView: 'home' | 'admin';
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  isAuthenticated?: boolean;
  currentUser?: any;
}

export function Header({ 
  searchQuery, 
  onSearch, 
  onHomeClick, 
  currentView,
  selectedCategory = 'all',
  onCategoryChange = () => {},
  activeFilters = [],
  onFilterChange = () => {},
  isAuthenticated = false,
  currentUser = null
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  console.log('Header rendered with searchQuery:', searchQuery);

  return (
    <header className="border-b border-swiss-black bg-swiss-white sticky top-0 z-50">
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 gap-0 h-18">
          {/* Logo Section */}
          <div className="col-span-3 border-r border-swiss-black flex items-center px-6">
            <div className="flex items-center space-x-3">
              {/* Adjusted square to match text height */}
              <div className="h-10 w-10 border border-swiss-black flex items-center justify-center flex-shrink-0">
                <Grid2X2 className="w-5 h-5" />
              </div>
              <div>
                <button
                  onClick={onHomeClick}
                  className="text-left hover:opacity-70 transition-opacity"
                >
                  <h1 className="text-lg swiss-title font-light tracking-wider leading-6">
                    UNBSERVED
                  </h1>
                  <p className="text-xs swiss-mono text-swiss-gray-600 mt-0.5 leading-4">
                    001—∞
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="col-span-6 border-r border-swiss-black flex items-center px-6">
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-swiss-gray-500" />
                <Input
                  placeholder="Visual references search..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-6 border-none bg-transparent text-sm focus:ring-0 focus:outline-none placeholder:text-swiss-gray-400 swiss-mono"
                />
              </div>
              
              <FilterButton
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
              />
            </div>
          </div>

          {/* Meta Info Section */}
          <div className="col-span-3 flex items-center justify-between px-6">
            <div className="text-xs swiss-mono text-swiss-gray-600">
              <span className="block">Follow-us</span>
              <div className="flex items-center space-x-2">
                <a 
                  href="https://www.instagram.com/unbserved/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium hover:text-swiss-black transition-colors"
                >
                  @unbserved
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && currentUser ? (
                <div className="flex items-center space-x-3">
                  <div className="text-xs swiss-mono text-swiss-gray-600 text-right">
                    <span className="block">{currentUser.name || 'User'}</span>
                    <span className="text-swiss-gray-400">{currentUser.isAdmin ? 'Admin' : 'Member'}</span>
                  </div>
                  
                  {currentUser.email === 'afelainne@gmail.com' && (
                    <a 
                      href="/dashboard?view=admin" 
                      className="px-3 py-2 border border-swiss-black text-swiss-black text-sm swiss-mono hover:bg-swiss-gray-100 transition-colors"
                    >
                      Admin
                    </a>
                  )}
                  
                  <a 
                    href="/dashboard" 
                    className="px-4 py-2 bg-swiss-black text-swiss-white text-sm swiss-mono hover:bg-swiss-gray-800 transition-colors"
                  >
                    Dashboard
                  </a>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <a 
                    href="/auth/login" 
                    className="px-3 py-2 border border-swiss-black text-swiss-black text-sm swiss-mono hover:bg-swiss-gray-100 transition-colors"
                  >
                    Login
                  </a>
                  <a 
                    href="/auth/register" 
                    className="px-4 py-2 bg-swiss-black text-swiss-white text-sm swiss-mono hover:bg-swiss-gray-800 transition-colors"
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 h-16">
          {/* Mobile Logo */}
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 border border-swiss-black flex items-center justify-center flex-shrink-0">
              <Grid2X2 className="w-4 h-4" />
            </div>
            <button
              onClick={onHomeClick}
              className="text-left hover:opacity-70 transition-opacity"
            >
              <h1 className="text-base swiss-title font-light tracking-wider leading-5">
                UNBSERVED
              </h1>
              <p className="text-xs swiss-mono text-swiss-gray-600 leading-3">
                001—∞
              </p>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 border border-swiss-black bg-swiss-white hover:bg-swiss-gray-50 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-swiss-black bg-swiss-white">
            {/* Mobile Search */}
            <div className="p-4 border-b border-swiss-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-swiss-gray-500" />
                <Input
                  placeholder="Search references..."
                  value={searchQuery}
                  onChange={(e) => onSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-swiss-gray-300 text-sm focus:ring-0 focus:border-swiss-black placeholder:text-swiss-gray-400 swiss-mono"
                />
              </div>
            </div>

            {/* Mobile Filter */}
            <div className="p-4 border-b border-swiss-gray-200">
              <FilterButton
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                activeFilters={activeFilters}
                onFilterChange={onFilterChange}
              />
            </div>

            {/* Mobile User Actions */}
            <div className="p-4">
              {isAuthenticated && currentUser ? (
                <div className="space-y-3">
                  <div className="text-sm swiss-mono text-swiss-gray-600">
                    <span className="block font-medium">{currentUser.name || 'User'}</span>
                    <span className="text-swiss-gray-400">{currentUser.isAdmin ? 'Admin' : 'Member'}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {currentUser.email === 'afelainne@gmail.com' && (
                      <a 
                        href="/dashboard?view=admin" 
                        className="w-full py-3 px-4 border border-swiss-black text-swiss-black text-sm swiss-mono hover:bg-swiss-gray-100 transition-colors text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Panel
                      </a>
                    )}
                    
                    <a 
                      href="/dashboard" 
                      className="w-full py-3 px-4 bg-swiss-black text-swiss-white text-sm swiss-mono hover:bg-swiss-gray-800 transition-colors text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <a 
                    href="/auth/login" 
                    className="w-full py-3 px-4 border border-swiss-black text-swiss-black text-sm swiss-mono hover:bg-swiss-gray-100 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </a>
                  <a 
                    href="/auth/register" 
                    className="w-full py-3 px-4 bg-swiss-black text-swiss-white text-sm swiss-mono hover:bg-swiss-gray-800 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}