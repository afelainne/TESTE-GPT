"use client";

import { InspirationItem } from '@/types/inspiration';

// Advanced deduplication system
export class ContentDeduplicator {
  private static instance: ContentDeduplicator;
  
  static getInstance(): ContentDeduplicator {
    if (!ContentDeduplicator.instance) {
      ContentDeduplicator.instance = new ContentDeduplicator();
    }
    return ContentDeduplicator.instance;
  }

  // Remove duplicates from an array of inspiration items
  removeDuplicates(items: InspirationItem[]): InspirationItem[] {
    console.log('🔍 Deduplicating', items.length, 'items...');
    
    const seen = new Set<string>();
    const deduplicated: InspirationItem[] = [];
    
    for (const item of items) {
      const fingerprint = this.generateFingerprint(item);
      
      if (!seen.has(fingerprint)) {
        seen.add(fingerprint);
        deduplicated.push(item);
      } else {
        console.log('🗑️ Removed duplicate:', item.title);
      }
    }
    
    console.log('✅ Deduplication complete:', deduplicated.length, 'unique items');
    return deduplicated;
  }

  // Remove duplicates specifically from similar items
  removeSimilarDuplicates(originalItem: InspirationItem, similarItems: InspirationItem[]): InspirationItem[] {
    console.log('🔍 Deduplicating similar items for:', originalItem.title);
    
    // First remove the original item from similar items
    let filtered = similarItems.filter(item => item.id !== originalItem.id);
    
    // Then remove duplicates
    filtered = this.removeDuplicates(filtered);
    
    // Sort by relevance/similarity score
    filtered = this.sortBySimilarityRelevance(originalItem, filtered);
    
    console.log('✅ Similar items deduplicated:', filtered.length, 'items');
    return filtered;
  }

  // Generate a unique fingerprint for an item
  private generateFingerprint(item: InspirationItem): string {
    // Multiple strategies for detecting duplicates
    const strategies = [
      // 1. Exact image URL match
      `url:${this.normalizeUrl(item.imageUrl)}`,
      
      // 2. Title + author combination
      `title:${this.normalizeText(item.title)}_${this.normalizeText(item.author)}`,
      
      // 3. Image dimensions from URL (if available)
      `dims:${this.extractImageDimensions(item.imageUrl)}`,
      
      // 4. Content-based hash for Are.na items
      item.platform === 'arena' ? `arena:${this.extractArenaId(item.source)}` : '',
    ];
    
    // Use the most specific available fingerprint
    for (const strategy of strategies) {
      if (strategy && strategy !== 'dims:' && strategy !== 'arena:') {
        return strategy;
      }
    }
    
    // Fallback to ID
    return `id:${item.id}`;
  }

  private normalizeUrl(url: string): string {
    try {
      // Remove query parameters that don't affect the actual image
      const urlObj = new URL(url);
      
      // Remove common cache-busting parameters
      const paramsToRemove = ['t', 'cache', 'v', 'version', 'timestamp'];
      paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
      
      return urlObj.toString().toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  private extractImageDimensions(url: string): string {
    // Extract dimensions from common image URL patterns
    const patterns = [
      /(\d+)x(\d+)/,           // 800x600
      /w_(\d+),h_(\d+)/,       // w_800,h_600
      /(\d+)_(\d+)/,           // 800_600
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return `${match[1]}x${match[2]}`;
      }
    }
    
    return '';
  }

  private extractArenaId(source: string): string {
    // Extract Are.na block ID from various URL formats
    const patterns = [
      /block\/(\d+)/,          // are.na/block/12345
      /(\d+)$/,                // ends with number
      /id=(\d+)/,              // id=12345
    ];
    
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return '';
  }

  private sortBySimilarityRelevance(originalItem: InspirationItem, items: InspirationItem[]): InspirationItem[] {
    return items.sort((a, b) => {
      // Sort by multiple relevance factors
      let scoreA = 0;
      let scoreB = 0;
      
      // 1. Platform similarity (same platform gets higher score)
      if (a.platform === originalItem.platform) scoreA += 2;
      if (b.platform === originalItem.platform) scoreB += 2;
      
      // 2. Category similarity
      if (a.category === originalItem.category) scoreA += 3;
      if (b.category === originalItem.category) scoreB += 3;
      
      // 3. Tag overlap
      const aTagOverlap = a.tags.filter(tag => originalItem.tags.includes(tag)).length;
      const bTagOverlap = b.tags.filter(tag => originalItem.tags.includes(tag)).length;
      scoreA += aTagOverlap;
      scoreB += bTagOverlap;
      
      // 4. Visual style similarity
      const aStyleScore = this.calculateStyleSimilarity(originalItem.visualStyle, a.visualStyle);
      const bStyleScore = this.calculateStyleSimilarity(originalItem.visualStyle, b.visualStyle);
      scoreA += aStyleScore;
      scoreB += bStyleScore;
      
      return scoreB - scoreA; // Higher score first
    });
  }

  private calculateStyleSimilarity(styleA: any, styleB: any): number {
    let score = 0;
    
    if (styleA.composition === styleB.composition) score += 1;
    if (styleA.colorTone === styleB.colorTone) score += 1;
    if (styleA.shapes === styleB.shapes) score += 1;
    if (styleA.mood === styleB.mood) score += 1;
    
    return score;
  }

  // Utility to remove duplicates from multiple sources
  mergeDeduplicated(...sources: InspirationItem[][]): InspirationItem[] {
    const allItems = sources.flat();
    return this.removeDuplicates(allItems);
  }
}

export const contentDeduplicator = ContentDeduplicator.getInstance();