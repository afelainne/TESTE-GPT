// Server-side deduplication utilities

// Normalize image URLs to catch duplicates with different parameters
function normalizeImageUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // Remove common cache-busting and variation parameters
    const paramsToRemove = [
      't', 'cache', 'v', 'version', 'timestamp', 'bc', '_nc', 
      'w', 'h', 'q', 'quality', 'format', 'auto', 'fit',
      'crop', 'dpr', 'fm', 'cs', 'ch', 'max-w', 'max-h'
    ];
    
    paramsToRemove.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    // Also normalize the path by removing size suffixes
    let pathname = urlObj.pathname;
    pathname = pathname.replace(/[-_](thumb|small|medium|large|xl|xxl|\d+x\d+)\.(jpg|jpeg|png|gif|webp)$/i, '.$2');
    urlObj.pathname = pathname;
    
    return urlObj.toString().toLowerCase();
  } catch (error) {
    // If URL parsing fails, just return lowercase version
    return url.toLowerCase();
  }
}

// Deduplication utilities for similar image results
export interface DedupeUtils {
  dedupeByUrl: (items: any[]) => any[];
  normalizeImageUrl: (url: string) => string;
  dedupeWithLoading: (items: any[], setLoading?: (loading: boolean) => void) => Promise<any[]>;
}

export const similarityDedupeUtils: DedupeUtils = {
  // Main deduplication function by URL
  dedupeByUrl: (items: any[]) => {
    console.log('🔍 Deduplicating', items.length, 'similar items by URL...');
    
    const seen = new Set<string>();
    const unique = items.filter(img => {
      // Normalize URL to catch variations
      const normalizedUrl = normalizeImageUrl(img.image_url || img.imageUrl);
      
      if (seen.has(normalizedUrl)) {
        console.log('🗑️ Removed duplicate URL:', img.title || 'Untitled');
        return false;
      }
      
      seen.add(normalizedUrl);
      return true;
    });
    
    console.log(`✅ Deduplication complete: ${unique.length} unique items (removed ${items.length - unique.length})`);
    return unique;
  },

  // Normalize image URLs
  normalizeImageUrl,

  // Async deduplication with loading state
  dedupeWithLoading: async (items: any[], setLoading?: (loading: boolean) => void): Promise<any[]> => {
    if (setLoading) setLoading(true);
    
    // Simulate some processing time for UX
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const result = similarityDedupeUtils.dedupeByUrl(items);
    
    if (setLoading) setLoading(false);
    
    return result;
  }
};

// Hook for using deduplication in React components - moved to separate client file if needed

// Utility to combine deduplication with similarity scoring
export function dedupeSimilarityResults(
  items: any[], 
  queryItem?: any,
  preserveTopMatch: boolean = true
): any[] {
  console.log('🎯 Deduplicating similarity results with scoring...');
  
  // First deduplicate by URL
  let deduped = similarityDedupeUtils.dedupeByUrl(items);
  
  // If we have a query item, ensure it's not in the results
  if (queryItem) {
    deduped = deduped.filter(item => {
      const queryUrl = normalizeImageUrl(queryItem.imageUrl || queryItem.image_url);
      const itemUrl = normalizeImageUrl(item.imageUrl || item.image_url);
      return queryUrl !== itemUrl;
    });
  }
  
  // Sort by similarity if available, otherwise by relevance
  deduped.sort((a, b) => {
    // Primary sort: similarity score (higher is better)
    if (a.similarity !== undefined && b.similarity !== undefined) {
      return b.similarity - a.similarity;
    }
    
    // Secondary sort: title length (shorter often means more relevant)
    const aTitle = (a.title || '').length;
    const bTitle = (b.title || '').length;
    return aTitle - bTitle;
  });
  
  console.log(`✅ Sorted ${deduped.length} unique similarity results`);
  return deduped;
}