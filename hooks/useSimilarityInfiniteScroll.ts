'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { InspirationItem } from '@/types/inspiration';

interface UseSimilarityInfiniteScrollProps {
  targetItem: InspirationItem;
  allItems: InspirationItem[];
  similarityType: 'visual' | 'color' | 'semantic' | 'style' | 'thematic' | 'mixed';
  initialLimit?: number;
}

export function useSimilarityInfiniteScroll({ 
  targetItem, 
  allItems, 
  similarityType,
  initialLimit = 12
}: UseSimilarityInfiniteScrollProps) {
  const [similarItems, setSimilarItems] = useState<InspirationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const loadingRef = useRef(false);
  const existingIdsRef = useRef(new Set<string>());

  // Update existing IDs when items change
  useEffect(() => {
    existingIdsRef.current = new Set(similarItems.map(item => item.id));
  }, [similarItems]);

  // Reset and load initial similar items when similarity type or target changes
  useEffect(() => {
    if (!targetItem) return;
    
    setIsLoading(true);
    setError(null);
    setSimilarItems([]); // Reset array completely
    setPage(1);
    setHasMore(true);
    existingIdsRef.current.clear();
    
    console.log('🔍 Loading initial similar items with type:', similarityType, 'for target:', targetItem.id);
    
    const loadInitialItems = async () => {
      try {
        // Use find-similar API endpoint instead of mockData
        const response = await fetch(`/api/find-similar?imageId=${targetItem.id}&cursor=0`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const initial = data.similar || [];
        
        console.log('✅ Initial similar items loaded:', initial.length);
        setSimilarItems(initial);
        initial.forEach((item: any) => existingIdsRef.current.add(item.id));
        setHasMore(data.hasMore || false);
      } catch (error) {
        console.error('❌ Failed to load initial similar items:', error);
        setError('Failed to load similar content');
        setSimilarItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialItems();
  }, [targetItem.id, similarityType]); // Remove allItems dependency to avoid unnecessary reloads

  const loadMoreSimilarItems = useCallback(async () => {
    if (loadingRef.current || !hasMore || isLoading || !targetItem) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Loading more similar content - page ${page + 1} for target: ${targetItem.id}`);
      
      const cursor = similarItems.length;
      const response = await fetch(`/api/find-similar?imageId=${targetItem.id}&cursor=${cursor}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const newItems = data.similar || [];
      
      if (newItems.length > 0) {
        // Filter out items we already have
        const uniqueNewItems = newItems.filter((item: any) => 
          !existingIdsRef.current.has(item.id)
        );
        
        console.log(`✅ Found ${uniqueNewItems.length} new similar items from ${newItems.length} candidates`);
        
        if (uniqueNewItems.length > 0) {
          setSimilarItems(prevItems => [...prevItems, ...uniqueNewItems]);
          uniqueNewItems.forEach((item: any) => existingIdsRef.current.add(item.id));
          setPage(prevPage => prevPage + 1);
        }
        
        setHasMore(data.hasMore || false);
      } else {
        console.log('📭 No new similar items found');
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ Failed to load more similar items:', error);
      setError('Failed to load more similar content');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [targetItem.id, page, hasMore, isLoading, similarItems.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoading && hasMore) {
          console.log('🎯 Similarity scroll trigger detected - loading more content');
          loadMoreSimilarItems();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Load when 200px from bottom
        threshold: 0.1,
      }
    );

    // Observe the loading trigger element
    const loadingTrigger = document.getElementById('similarity-scroll-trigger');
    if (loadingTrigger) {
      observer.observe(loadingTrigger);
    }

    return () => {
      if (loadingTrigger) {
        observer.unobserve(loadingTrigger);
      }
    };
  }, [loadMoreSimilarItems, isLoading, hasMore]);

  return {
    similarItems,
    isLoading,
    hasMore,
    error,
    loadMore: loadMoreSimilarItems,
    totalCount: similarItems.length
  };
}