"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { SidebarToggle } from '@/components/SidebarToggle';
import { InspirationGrid } from '@/components/InspirationGrid';
import { InspirationItem } from '@/types/inspiration';
import { MainInterface } from '@/components/MainInterface';
import { authManager } from '@/lib/auth';

export function HomeClient() {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [imageSize, setImageSize] = useState<number>(3);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [inspirationItems, setInspirationItems] = useState<InspirationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  console.log('HomeClient rendered with view:', view);

  // Load content for homepage
  useEffect(() => {
    if (view !== 'home') return;
    
    console.log('🔄 Loading content for homepage...');
    setIsLoading(true);
    
    const loadContent = async () => {
      try {
        console.log('📡 Fetching indexed content...');
        const response = await fetch('/api/indexed-content');
        const data = await response.json();
        
        console.log('📦 Indexed content received:', data.total, 'items');
        
        if (data.content && data.content.length > 0) {
          console.log('✅ Setting', data.content.length, 'items to state');
          setInspirationItems(data.content);
        } else {
          console.warn('⚠️ No content received');
          setInspirationItems([]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error loading content:', error);
        setIsLoading(false);
      }
    };

    loadContent();
  }, [view]);

  const handleSaveItem = (id: string) => {
    console.log('Saving item:', id);
    setSavedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredItems = inspirationItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  console.log('🔍 Filtering logic:', {
    totalItems: inspirationItems.length,
    selectedCategory,
    searchQuery,
    filteredCount: filteredItems.length,
    sampleItem: inspirationItems[0] || 'none'
  });

  // Admin mode
  if (view === 'admin') {
    return <MainInterface />;
  }

  // Check if user is authenticated for some features
  const isAuthenticated = authManager.isAuthenticated();

  // Home mode with inspiration grid
  return (
    <div className="min-h-screen bg-swiss-white">
      {/* Header */}
      <Header 
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onHomeClick={() => setView('home')}
        currentView={view}
        isAuthenticated={isAuthenticated}
        currentUser={null}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          isCollapsed={!sidebarOpen}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <SidebarToggle
              isCollapsed={!sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>

          {/* Content */}
          {filteredItems.length > 0 ? (
            <InspirationGrid
              items={filteredItems}
              onSave={handleSaveItem}
              imageSize={imageSize}
              onImageSizeChange={setImageSize}
              totalCount={filteredItems.length}
            />
          ) : !isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8">
              <div className="w-24 h-24 border border-swiss-black mx-auto mb-8 flex items-center justify-center">
                <div className="w-12 h-12 border border-swiss-black"></div>
              </div>
              
              <h2 className="text-2xl swiss-title font-light mb-4 tracking-wide">
                No Content Found
              </h2>
              
              <p className="text-swiss-gray-600 swiss-body max-w-md leading-relaxed mb-8">
                No content matches your current search criteria. Try adjusting your filters or search terms.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-6 py-3 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-colors swiss-body"
                >
                  Clear Filters
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => setView('admin')}
                    className="px-6 py-3 border border-swiss-black text-swiss-black hover:bg-swiss-gray-100 transition-colors swiss-body"
                  >
                    Add Content
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Loading indicator */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border border-swiss-black mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 border border-swiss-black animate-pulse"></div>
              </div>
              <p className="text-swiss-gray-600 font-mono text-sm">LOADING CONTENT...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}