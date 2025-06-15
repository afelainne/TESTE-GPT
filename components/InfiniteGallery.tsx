"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { InspirationItem } from '@/types/inspiration';
import { InspirationCard } from './InspirationCard';
import Masonry from 'react-masonry-css';

interface InfiniteGalleryProps {
  onSave: (id: string) => void;
  onViewItem: (item: InspirationItem, index?: number) => void;
  imageSize?: number;
  className?: string;
}

export function InfiniteGallery({ 
  onSave, 
  onViewItem, 
  imageSize = 3,
  className = ""
}: InfiniteGalleryProps) {
  const [images, setImages] = useState<InspirationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadingRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load more images function
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`[InfiniteGallery] Loading page ${page} with limit 20`);
      
      const response = await fetch(`/api/images?page=${page}&limit=20`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`[InfiniteGallery] Loaded ${data.images?.length || 0} images, hasMore: ${data.hasMore}`);
      
      if (data.success && data.images && Array.isArray(data.images)) {
        // Transform API response to InspirationItem format
        const newItems: InspirationItem[] = data.images.map((img: any) => ({
          id: img.id,
          title: img.title || 'Untitled',
          imageUrl: img.imageUrl,
          author: img.author || 'Unknown',
          authorName: img.author || 'Unknown',
          authorProfileUrl: '#',
          platform: 'Database',
          category: 'inspiration',
          tags: [],
          colors: [],
          likes: Math.floor(Math.random() * 100),
          description: 'Image from database',
          sourceUrl: img.sourceUrl || img.imageUrl,
          createdAt: img.createdAt || new Date().toISOString()
        }));
        
        setImages(prevImages => [...prevImages, ...newItems]);
        setHasMore(data.hasMore);
        setPage(prevPage => prevPage + 1);
      } else {
        setHasMore(false);
        console.warn('[InfiniteGallery] Invalid response format:', data);
      }
    } catch (error) {
      console.error('[InfiniteGallery] Error loading images:', error);
      setError(error instanceof Error ? error.message : 'Failed to load images');
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore, isLoading]);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []); // Empty dependency array for initial load only

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const currentLoadingRef = loadingRef.current;
    
    if (!currentLoadingRef) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && hasMore) {
          console.log('[InfiniteGallery] Intersection detected, loading more...');
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(currentLoadingRef);

    return () => {
      if (observerRef.current && currentLoadingRef) {
        observerRef.current.unobserve(currentLoadingRef);
      }
    };
  }, [loadMore, isLoading, hasMore]);

  // Dynamic breakpoints based on image size
  const getBreakpointColumns = (size: number) => {
    const baseColumns = {
      1: { default: 8, 1536: 7, 1280: 6, 1024: 4, 768: 3, 640: 2, 480: 1 },
      2: { default: 7, 1536: 6, 1280: 5, 1024: 4, 768: 3, 640: 2, 480: 1 },
      3: { default: 6, 1536: 5, 1280: 4, 1024: 3, 768: 2, 640: 2, 480: 1 },
      4: { default: 5, 1536: 4, 1280: 3, 1024: 3, 768: 2, 640: 2, 480: 1 },
      5: { default: 4, 1536: 3, 1280: 3, 1024: 2, 768: 2, 640: 1, 480: 1 },
      6: { default: 3, 1536: 2, 1280: 2, 1024: 2, 768: 1, 640: 1, 480: 1 },
      7: { default: 2, 1536: 2, 1280: 1, 1024: 1, 768: 1, 640: 1, 480: 1 },
      8: { default: 1, 1536: 1, 1280: 1, 1024: 1, 768: 1, 640: 1, 480: 1 }
    };
    return baseColumns[size as keyof typeof baseColumns] || baseColumns[3];
  };

  const breakpointColumnsObj = getBreakpointColumns(imageSize);

  return (
    <div className={`w-full ${className}`}>
      {/* Gallery Grid */}
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-3 lg:gap-6 w-full animate-grid-appear"
        columnClassName="flex flex-col gap-3 lg:gap-6"
      >
        {images.map((item, index) => (
          <div
            key={item.id}
            style={{
              animationDelay: `${index * 0.05}s`
            }}
          >
            <InspirationCard
              item={item}
              onSave={onSave}
              onView={(clickedItem) => onViewItem(clickedItem, index)}
              interactiveMode={false}
              hoverZoom={1.05}
            />
          </div>
        ))}
      </Masonry>

      {/* Loading Indicator and Trigger */}
      <div ref={loadingRef} className="w-full py-8">
        {isLoading && (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin text-swiss-gray-400" />
            <span className="text-sm swiss-mono text-swiss-gray-500">
              Loading more images...
            </span>
          </div>
        )}
        
        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-red-500 swiss-mono">{error}</p>
            <button
              onClick={() => {
                setError(null);
                loadMore();
              }}
              className="mt-2 text-xs swiss-mono text-swiss-gray-600 hover:text-swiss-black underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {!hasMore && !isLoading && images.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm swiss-mono text-swiss-gray-400">
              All images loaded • {images.length} total
            </p>
          </div>
        )}
        
        {!hasMore && !isLoading && images.length === 0 && !error && (
          <div className="text-center py-8">
            <p className="text-lg swiss-title font-light text-swiss-gray-600 mb-2">
              No images found
            </p>
            <p className="text-sm swiss-mono text-swiss-gray-400">
              The gallery appears to be empty
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {images.length > 0 && (
        <div className="text-center py-4 border-t border-swiss-gray-200 mt-8">
          <p className="text-xs swiss-mono text-swiss-gray-400">
            Showing {images.length} images • Page {page - 1} • 
            {hasMore ? ' More available' : ' All loaded'}
          </p>
        </div>
      )}
    </div>
  );
}