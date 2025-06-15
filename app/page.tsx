"use client";

import { useState, useEffect } from 'react';
import { InspirationGrid } from '@/components/InspirationGrid';
import { Header } from '@/components/Header';
import { InfiniteGallery } from '@/components/InfiniteGallery';
import { ExpandedInspirationView } from '@/components/ExpandedInspirationView';
import { ImageSizeSlider } from '@/components/ImageSizeSlider';
import { SimilarityStatusIndicator } from '@/components/SimilarityStatusIndicator';
import { InspirationItem } from '@/types/inspiration';
import { authManager } from '@/lib/auth';
import { EnvDebugger } from '@/components/EnvDebugger';

export default function Home() {
  const [items, setItems] = useState<InspirationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [imageSize, setImageSize] = useState<number>(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [viewMode, setViewMode] = useState<'original' | 'infinite'>('original');

  console.log('🎯 Home: Rendering with', items.length, 'items, loading:', loading, 'error:', error, 'mounted:', mounted);
  
  // Hydration check
  if (typeof window !== 'undefined' && !mounted) {
    console.log('🖥️ Client side detected, setting mounted...');
    setMounted(true);
  }

  // Simplified load function
  const loadClipVectors = async () => {
    console.log('🚀 FORCE LOADING: Starting clip-vectors fetch...');
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/clip-vectors', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('🚀 FORCE LOADING: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🚀 FORCE LOADING: Data received:', {
        success: data.success,
        total: data.total,
        itemsLength: data.items?.length || 0
      });
      
      if (data.success && data.items && Array.isArray(data.items) && data.items.length > 0) {
        console.log('✅ FORCE LOADING: Setting', data.items.length, 'items');
        setItems(data.items);
        setHasMore(true); // Enable infinite scroll
        setError(null);
      } else {
        console.log('❌ FORCE LOADING: No items found');
        setError('No images found in clip_vectors table');
        setHasMore(false);
      }
      
    } catch (err) {
      console.error('❌ FORCE LOADING: Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Hydration effect
  useEffect(() => {
    console.log('🌊 Hydration effect triggered, setting mounted to true');
    setMounted(true);
  }, []);

  // Main initialization effect - only runs after hydration
  useEffect(() => {
    if (!mounted) {
      console.log('⏳ Not mounted yet, skipping initialization...');
      return;
    }
    
    console.log('🚀 Home: Starting initialization (mounted)...');
    
    // Auth loading (synchronous)
    try {
      authManager.loadFromStorage();
      const user = authManager.getCurrentUser();
      const authenticated = authManager.isAuthenticated();
      
      setCurrentUser(user);
      setIsAuthenticated(authenticated);
      console.log('🔑 Auth loaded:', { authenticated, user: user?.email });
    } catch (error) {
      console.error('🔑 Auth error:', error);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
    
    // Data loading (async) - immediate execution
    console.log('📡 Starting data load immediately...');
    loadClipVectors();
    
  }, [mounted]); // Depends on mounted state

  const loadMore = async () => {
    // Always allow infinite scroll even after similar references
    if (loading || !hasMore) return;
    
    console.log('🔄 Load more called - fetching additional content...');
    setLoading(true);
    
    try {
      const response = await fetch('/api/clip-vectors', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.items && data.items.length > 0) {
          // Add new items without duplicates
          const newItems = data.items.filter((newItem: InspirationItem) => 
            !items.some(existingItem => existingItem.id === newItem.id)
          );
          
          if (newItems.length > 0) {
            setItems(prev => [...prev, ...newItems]);
            console.log('✅ Added', newItems.length, 'new items');
          }
        }
      }
    } catch (error) {
      console.error('❌ Load more error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (id: string) => {
    console.log('💾 Save item:', id);
  };

  const handleImageSizeChange = (size: number) => {
    console.log('📏 Image size changed to:', size);
    setImageSize(size);
  };

  const handleSearch = (query: string) => {
    console.log('🔍 Search query:', query);
    setSearchQuery(query);
  };

  const handleViewItem = (item: InspirationItem, index?: number) => {
    console.log('View item:', item.id, 'at index:', index);
    setSelectedItem(item);
  };

  const handleCloseExpanded = () => {
    setSelectedItem(null);
  };

  const handleItemSelect = (item: InspirationItem) => {
    setSelectedItem(item);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilters = true;
    if (activeFilters.includes('popular')) {
      matchesFilters = matchesFilters && (item.likes || 0) > 30;
    }
    
    return matchesCategory && matchesSearch && matchesFilters;
  });

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-swiss-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border border-swiss-black mx-auto mb-4 flex items-center justify-center">
            <div className="w-6 h-6 border border-swiss-black animate-pulse"></div>
          </div>
          <p className="text-swiss-gray-600 font-mono text-sm tracking-wider">LOADING UNOBSERVED VISUAL SYSTEMS</p>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen bg-swiss-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 border border-red-500 mx-auto mb-4 flex items-center justify-center">
            <div className="w-6 h-6 border border-red-500"></div>
          </div>
          <h2 className="text-xl mb-2">Error Loading Content</h2>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button 
            onClick={loadClipVectors} 
            className="px-4 py-2 bg-swiss-black text-white hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-swiss-white">
      <Header 
        onSearch={handleSearch} 
        searchQuery={searchQuery} 
        onHomeClick={() => window.location.href = '/'}
        currentView="home"
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
      />
      
      {/* Visual References Collection Section */}
      <div className="border-b border-swiss-black bg-swiss-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            {/* Left Column - Content */}
            <div className="lg:col-span-8 space-y-4">
              <h1 className="text-3xl lg:text-4xl font-light text-swiss-black tracking-tight swiss-title">
                Visual References Collection
              </h1>
              <p className="text-base text-swiss-gray-600 font-light max-w-2xl swiss-body leading-relaxed">
                Visual systems from awesome but unobserved designers. Scroll down to automatically 
                discover more inspiration. Each piece is algorithmically curated for visual coherence 
                and contemporary relevance.
              </p>
            </div>
            
            {/* Right Column - Controls */}
            <div className="lg:col-span-4 flex items-center justify-end gap-4">
              {/* View Mode Buttons */}
              <div className="flex border border-swiss-black bg-swiss-white">
                <button
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-2 text-xs font-medium tracking-wider swiss-mono transition-colors ${
                    viewMode === 'original' 
                      ? 'bg-swiss-black text-swiss-white' 
                      : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-50'
                  }`}
                >
                  GRID
                </button>
                <button
                  onClick={() => setViewMode('infinite')}
                  className={`px-3 py-2 text-xs font-medium tracking-wider swiss-mono border-l border-swiss-black transition-colors ${
                    viewMode === 'infinite' 
                      ? 'bg-swiss-black text-swiss-white' 
                      : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-50'
                  }`}
                >
                  INFINITE
                </button>
              </div>
              
              {/* Interactive Button */}
              <button
                onClick={() => setInteractiveMode(!interactiveMode)}
                className={`px-3 py-2 text-xs font-medium tracking-wider border border-swiss-black swiss-mono transition-colors ${
                  interactiveMode 
                    ? 'bg-swiss-black text-swiss-white' 
                    : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-50'
                }`}
              >
                INTERACTIVE
              </button>
              
              {/* Size Control */}
              <ImageSizeSlider
                imageSize={imageSize}
                onSizeChange={setImageSize}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {selectedItem ? (
          /* Expanded View */
          <ExpandedInspirationView
            item={selectedItem}
            allItems={[]} // Will be populated by CLIP API
            onClose={handleCloseExpanded}
            onSave={handleSave}
            onItemSelect={handleItemSelect}
          />
        ) : viewMode === 'infinite' ? (
          /* Infinite Gallery View */
          <div className="p-4 lg:p-8">
            <InfiniteGallery
              onSave={handleSave}
              onViewItem={handleViewItem}
              imageSize={imageSize}
              className="animate-fade-in"
            />
          </div>
        ) : (
          /* Original Grid View */
          filteredItems.length > 0 ? (
            <InspirationGrid
              items={filteredItems}
              onSave={handleSave}
              imageSize={imageSize}
              onImageSizeChange={handleImageSizeChange}
              totalCount={items.length}
              hasMore={hasMore}
              isLoading={loading}
              onLoadMore={loadMore}
            />
          ) : (
            <div className="text-center py-32">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 border border-swiss-black mx-auto mb-8 flex items-center justify-center">
                  <div className="w-12 h-12 border border-swiss-black"></div>
                </div>
                <h2 className="text-2xl swiss-title font-light mb-4">
                  {items.length === 0 ? 'No Content Available' : 'No Content Found'}
                </h2>
                <p className="text-swiss-gray-600 swiss-body mb-6">
                  {items.length === 0 
                    ? 'No images are available in the database yet.' 
                    : 'No content matches your search criteria. Try adjusting your filters.'
                  }
                </p>
                {items.length === 0 ? (
                  <button 
                    onClick={loadClipVectors}
                    className="px-6 py-3 bg-swiss-black text-swiss-white hover:bg-gray-800 transition-colors"
                  >
                    Retry Loading
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setActiveFilters([]);
                    }}
                    className="px-6 py-3 bg-swiss-black text-swiss-white hover:bg-gray-800 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
      
      {/* Debug info */}
      <div className="fixed bottom-4 right-4 bg-black text-white p-2 text-xs font-mono opacity-75">
        Items: {items.length} | Filtered: {filteredItems.length} | Loading: {loading ? 'Yes' : 'No'} | Mode: {viewMode}
      </div>
      
      {process.env.NODE_ENV === 'development' && <EnvDebugger />}
    </div>
  );
}