"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  setItems: (items: T[]) => void;
  loadingRef: React.RefObject<HTMLDivElement | null>;
}

export function useInfiniteScroll<T>(
  initialItems: T[],
  fetchMore: (page: number, currentItems: T[]) => Promise<T[]>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const { threshold = 1.0, rootMargin = '100px' } = options;
  
  const [items, setItems] = useState<T[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  const loadingRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  console.log('🔄 useInfiniteScroll - items:', items.length, 'loading:', loading, 'hasMore:', hasMore);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    console.log('📦 Loading more items, page:', page + 1);
    setLoading(true);
    
    try {
      const newItems = await fetchMore(page + 1, items);
      console.log('✅ Loaded', newItems.length, 'new items');
      
      if (newItems.length === 0) {
        setHasMore(false);
        console.log('🏁 No more items to load');
      } else {
        setItems(prev => [...prev, ...newItems]);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('❌ Error loading more items:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, items, fetchMore]);

  const reset = useCallback(() => {
    console.log('🔄 Resetting infinite scroll');
    setItems(initialItems);
    setPage(1);
    setHasMore(true);
    setLoading(false);
  }, [initialItems]);

  // Set up intersection observer
  useEffect(() => {
    if (!loadingRef.current) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          console.log('👁️ Intersection observed - triggering loadMore');
          loadMore();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMore, threshold, rootMargin]);

  // Update items when initialItems change
  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(true);
  }, [initialItems]);

  return {
    items,
    loading,
    hasMore,
    loadMore,
    reset,
    setItems,
    loadingRef
  };
}