"use client";

import { useState } from 'react';
import { similarityDedupeUtils } from '@/lib/similarityDedupe';

// Hook for using deduplication in React components
export function useSimilarityDedupe() {
  const [isDeduping, setIsDeduping] = useState(false);
  
  const dedupeResults = async (items: any[]): Promise<any[]> => {
    return similarityDedupeUtils.dedupeWithLoading(items, setIsDeduping);
  };

  return {
    dedupeResults,
    isDeduping
  };
}