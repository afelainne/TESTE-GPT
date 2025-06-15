import { InspirationItem, Category, CategoryType, CategoryObject } from '@/types/inspiration';
import { externalPlatforms } from '@/lib/externalPlatforms';
import { advancedSimilarityEngine } from '@/lib/advancedSimilarityEngine';

export const categories: CategoryObject[] = [
  { id: 'all', name: 'All Categories' },
  { id: 'ui-design', name: 'UI Design' },
  { id: 'branding', name: 'Branding' },
  { id: 'typography', name: 'Typography' },
  { id: 'photography', name: 'Photography' },
  { id: 'illustration', name: 'Illustration' },
  { id: 'motion-graphics', name: 'Motion Graphics' },
];

// Minimal static fallback data (used sparingly)
const staticItems: InspirationItem[] = [
  {
    id: 'static-1',
    title: 'Swiss Design Inspiration',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
    description: 'Clean minimal design',
    category: 'ui-design',
    tags: ['minimal', 'swiss', 'design'],
    author: 'Design Studio',
    likes: 234,
    isLiked: false,
    createdAt: '2024-01-15',
    colors: ['#000000', '#ffffff', '#f0f0f0'],
    source: 'https://example.com',
    platform: 'pinterest',
    visualStyle: {
      composition: 'minimal',
      colorTone: 'monochrome',
      shapes: 'geometric',
      mood: 'elegant'
    }
  },
  {
    id: 'static-2',
    title: 'Modern Typography Layout',
    imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    description: 'Bold typography design',
    category: 'typography',
    tags: ['typography', 'bold', 'modern'],
    author: 'Type Studio',
    likes: 456,
    isLiked: false,
    createdAt: '2024-01-16',
    colors: ['#ff0000', '#000000', '#ffffff'],
    source: 'https://example.com',
    platform: 'arena',
    visualStyle: {
      composition: 'centered',
      colorTone: 'high-contrast',
      shapes: 'linear',
      mood: 'bold'
    }
  }
];

// Enhanced infinite loading function
export async function loadMoreInspirationsWithExternalContent(
  searchQuery?: string, 
  page: number = 1, 
  existingIds: Set<string> = new Set()
): Promise<InspirationItem[]> {
  console.log(`🔄 Loading page ${page} with external platform content...`);
  console.log('🔍 Search query:', searchQuery || 'general design inspiration');
  
  try {
    // Create diverse search queries with pagination variety
    const baseQueries = searchQuery 
      ? [searchQuery, `${searchQuery} design`, `${searchQuery} inspiration`]
      : [
          'graphic design typography', 
          'ui ux interface design', 
          'branding identity design',
          'illustration digital art',
          'photography creative',
          'minimal clean design',
          'experimental design',
          'color composition',
          'abstract modern design',
          'geometric patterns',
          'visual identity',
          'creative direction'
        ];
    
    // Rotate queries based on page to get more variety
    const rotatedQueries = baseQueries.slice((page - 1) % baseQueries.length).concat(baseQueries.slice(0, (page - 1) % baseQueries.length));
    const selectedQueries = rotatedQueries.slice(0, 3); // Increased to 3 queries for more content
    
    let allExternalImages: any[] = [];
    
    // Fetch from external platforms
    for (const query of selectedQueries) {
      console.log(`🎯 Fetching page ${page} content for: "${query}"`);
      try {
        const images = await externalPlatforms.fetchAllPlatforms(query);
        allExternalImages.push(...(images as any[]));
      } catch (queryError) {
        console.error(`❌ Failed to fetch for query "${query}":`, queryError);
      }
    }
    
    // Remove duplicates based on imageUrl and avoid existing IDs
    const uniqueImages = allExternalImages.filter((image: any, index: number, self: any[]) => {
      const isUnique = index === self.findIndex((img: any) => img.imageUrl === image.imageUrl);
      const isNew = !existingIds.has(`arena_${image.id}`) && !existingIds.has(`pinterest_${image.id}`);
      return isUnique && isNew;
    });
    
    console.log(`🎲 Page ${page}: Found ${uniqueImages.length} new unique external images`);
    
    // Convert to our format with enhanced tag mapping
    const externalItems = externalPlatforms.convertToInspirationItems(uniqueImages)
      .map(item => {
        // Map platform content to our categories more intelligently
        const enhancedItem = { ...item };
        
        // Map categories based on tags and content
        const tagString = item.tags.join(' ').toLowerCase();
        let newCategory: CategoryType = 'ui-design'; // Default
        
        if (tagString.includes('ui') || tagString.includes('interface') || tagString.includes('app')) {
          newCategory = 'ui-design';
        } else if (tagString.includes('brand') || tagString.includes('logo') || tagString.includes('identity')) {
          newCategory = 'branding';
        } else if (tagString.includes('typography') || tagString.includes('type') || tagString.includes('font')) {
          newCategory = 'typography';
        } else if (tagString.includes('photo') || tagString.includes('image')) {
          newCategory = 'photography';
        } else if (tagString.includes('illustration') || tagString.includes('art') || tagString.includes('draw')) {
          newCategory = 'illustration';
        } else if (tagString.includes('motion') || tagString.includes('animation') || tagString.includes('video')) {
          newCategory = 'motion-graphics';
        }
        
        return { ...enhancedItem, category: newCategory };
      });
    
    // Shuffle for variety
    const shuffledExternal = [...externalItems].sort(() => Math.random() - 0.5);
    
    console.log(`✅ Page ${page}: Loaded ${shuffledExternal.length} total new inspirations`);
    
    return shuffledExternal;
  } catch (error) {
    console.error(`❌ Failed to load page ${page} external content:`, error);
    return [];
  }
}

export async function loadInspirationsWithExternalContent(searchQuery?: string): Promise<InspirationItem[]> {
  console.log('🔄 Loading inspirations with external platform content...');
  console.log('🔍 Search query:', searchQuery || 'general design inspiration');
  
  try {
    // Create diverse search queries based on user input or default categories
    const searchQueries = searchQuery 
      ? [searchQuery, `${searchQuery} design`, `${searchQuery} inspiration`]
      : [
          'graphic design typography', 
          'ui ux interface design', 
          'branding identity design',
          'illustration digital art',
          'photography creative',
          'minimal clean design',
          'experimental design',
          'color composition'
        ];
    
    // Cache content for better performance
    const cacheKey = `external_${searchQuery || 'default'}`;
    const cacheTimeKey = `${cacheKey}_time`;
    
    let allExternalImages: any[] = [];
    
    // Check cache first (5 minutes expiry)
    try {
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheTimeKey);
      
      if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
        console.log('📦 Using cached external content');
        allExternalImages = JSON.parse(cached);
      } else {
        // Fetch fresh content with reduced queries for performance
        for (const query of searchQueries.slice(0, 2)) { // Reduced to 2 queries
          console.log(`🎯 Fetching content for: "${query}"`);
          try {
            const images = await externalPlatforms.fetchAllPlatforms(query);
            allExternalImages.push(...(images as any[]));
          } catch (queryError) {
            console.error(`❌ Failed to fetch for query "${query}":`, queryError);
          }
        }
        
        // Cache the results
        localStorage.setItem(cacheKey, JSON.stringify(allExternalImages));
        localStorage.setItem(cacheTimeKey, Date.now().toString());
      }
    } catch (storageError) {
      console.warn('⚠️ Cache unavailable, fetching directly');
      // Fallback to direct fetch
      for (const query of searchQueries.slice(0, 2)) {
        try {
          const images = await externalPlatforms.fetchAllPlatforms(query);
          allExternalImages.push(...(images as any[]));
        } catch (queryError) {
          console.error(`❌ Failed to fetch for query "${query}":`, queryError);
        }
      }
    }
    
    // Remove duplicates based on imageUrl
    const uniqueImages = allExternalImages.filter((image: any, index: number, self: any[]) => 
      index === self.findIndex((img: any) => img.imageUrl === image.imageUrl)
    );
    
    console.log(`🎲 Found ${uniqueImages.length} unique external images`);
    
    // Convert to our format with enhanced tag mapping
    const externalItems = externalPlatforms.convertToInspirationItems(uniqueImages)
      .map(item => {
        // Map platform content to our categories more intelligently
        const enhancedItem = { ...item };
        
        // Map categories based on tags and content
        const tagString = item.tags.join(' ').toLowerCase();
        let newCategory: CategoryType = 'ui-design'; // Default
        
        if (tagString.includes('ui') || tagString.includes('interface') || tagString.includes('app')) {
          newCategory = 'ui-design';
        } else if (tagString.includes('brand') || tagString.includes('logo') || tagString.includes('identity')) {
          newCategory = 'branding';
        } else if (tagString.includes('typography') || tagString.includes('type') || tagString.includes('font')) {
          newCategory = 'typography';
        } else if (tagString.includes('photo') || tagString.includes('image')) {
          newCategory = 'photography';
        } else if (tagString.includes('illustration') || tagString.includes('art') || tagString.includes('draw')) {
          newCategory = 'illustration';
        } else if (tagString.includes('motion') || tagString.includes('animation') || tagString.includes('video')) {
          newCategory = 'motion-graphics';
        }
        
        return { ...enhancedItem, category: newCategory };

      });
    
    // Use only external images, no static mixing
    const shuffledExternal = [...externalItems].sort(() => Math.random() - 0.5);
    
    console.log(`✅ Loaded ${shuffledExternal.length} total external inspirations`);
    
    return shuffledExternal;
  } catch (error) {
    console.error('❌ Failed to load external content, using static fallback:', error);
    console.log('🔧 Returning', staticItems.length, 'static items as emergency fallback');
    return staticItems.sort(() => Math.random() - 0.5); // Randomize static fallback
  }
}

// Fallback similarity function (simplified)
function findSimilarItemsFallback(currentItem: InspirationItem, allItems: InspirationItem[], limit: number = 6): InspirationItem[] {
  console.log('🔄 Using fallback similarity for:', currentItem.id);
  
  const similar = allItems
    .filter(item => item.id !== currentItem.id)
    .map(item => {
      let score = 0;
      
      // Visual style similarity (highest weight - 40 points max)
      const visualStyle = item.visualStyle;
      const currentVisualStyle = currentItem.visualStyle;
      
      if (visualStyle.composition === currentVisualStyle.composition) score += 10;
      if (visualStyle.colorTone === currentVisualStyle.colorTone) score += 10;
      if (visualStyle.shapes === currentVisualStyle.shapes) score += 10;
      if (visualStyle.mood === currentVisualStyle.mood) score += 10;
      
      // Color palette similarity (30 points max)
      const colorSimilarity = calculateColorSimilarity(item.colors, currentItem.colors);
      score += (colorSimilarity / 100) * 30;
      
      // Category bonus (lower weight - 8 points max)
      if (item.category === currentItem.category) {
        score += 8;
      }
      
      // Common visual tags (5 points max)
      const visualTags = ['minimal', 'bold', 'geometric', 'organic', 'colorful', 'clean', 'elegant'];
      const commonVisualTags = item.tags.filter(tag => 
        currentItem.tags.includes(tag) && visualTags.includes(tag)
      );
      score += commonVisualTags.length * 2.5;
      
      return { item, score };
    })
    .filter(({ score }) => score > 15) // Higher threshold for visual similarity
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item }) => item);
    
  console.log('Found fallback similar items:', similar.length);
  return similar;
}

// Export static items as fallback
export const inspirationItems = staticItems;

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Function to calculate color similarity using RGB distance
function calculateColorSimilarity(colors1: string[], colors2: string[]): number {
  let totalSimilarity = 0;
  let comparisons = 0;

  for (const color1 of colors1) {
    for (const color2 of colors2) {
      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);
      
      if (rgb1 && rgb2) {
        // Calculate Euclidean distance in RGB space
        const distance = Math.sqrt(
          Math.pow(rgb1.r - rgb2.r, 2) +
          Math.pow(rgb1.g - rgb2.g, 2) +
          Math.pow(rgb1.b - rgb2.b, 2)
        );
        
        // Convert distance to similarity (0-100 scale, inverted)
        const similarity = Math.max(0, 100 - (distance / 4.41)); // 441 is max RGB distance
        totalSimilarity += similarity;
        comparisons++;
      }
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 0;
}

// Advanced similarity function with external database access
export async function findSimilarItemsFromExternalDatabase(
  targetItem: InspirationItem,
  similarityType: 'visual' | 'color' | 'semantic' | 'style' | 'thematic' | 'mixed' = 'visual',
  limit: number = 30
): Promise<InspirationItem[]> {
  console.log('🎯 Finding similar items from complete Pinterest + Arena database...');
  console.log('🔍 Target item:', targetItem.id, '| Type:', similarityType);
  
  try {
    // Load fresh content from external platforms specifically for similarity
    const externalDatabase: InspirationItem[] = [];
    
    // Create targeted search queries based on the target item
    const targetTags = targetItem.tags.join(' ');
    const searchQueries = [
      targetItem.category,
      targetTags.length > 0 ? targetTags : 'design inspiration',
      `${targetItem.category} ${similarityType}`,
      'creative design inspiration',
      'visual design references'
    ];
    
    // Load multiple pages of targeted content
    for (const query of searchQueries.slice(0, 3)) { // Use 3 targeted queries
      console.log(`🔍 Loading external content for: "${query}"`);
      
      for (let page = 1; page <= 3; page++) { // 3 pages per query
        const content = await loadMoreInspirationsWithExternalContent(
          query,
          page,
          new Set(externalDatabase.map(item => item.id)) // Avoid duplicates
        );
        externalDatabase.push(...content);
      }
    }
    
    console.log('📊 Complete external database loaded:', externalDatabase.length, 'items');
    
    // Use advanced similarity engine with complete database
    const { advancedSimilarityEngine } = await import('@/lib/advancedSimilarityEngine');
    
    const matches = await advancedSimilarityEngine.findSimilarItems(
      targetItem,
      externalDatabase, // Complete external database
      {
        limit,
        emphasize: similarityType === 'visual' ? 'visual' :
                  similarityType === 'color' ? 'color' :
                  similarityType === 'semantic' ? 'semantic' :
                  similarityType === 'style' ? 'style' :
                  similarityType === 'thematic' ? 'content' :
                  undefined,
        minScore: 0.15, // Lower threshold for more diverse results
        diversify: true
      }
    );

    const similarItems = matches.map(match => {
      console.log(`✨ Similar: ${match.item.title} | Score: ${(match.score * 100).toFixed(1)}% | Type: ${match.matchType}`);
      return match.item;
    });

    console.log('✅ Found', similarItems.length, 'similar items from external database');
    return similarItems;
    
  } catch (error) {
    console.error('❌ External database similarity failed:', error);
    return [];
  }
}