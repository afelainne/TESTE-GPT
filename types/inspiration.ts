export interface VisualStyle {
  composition: string;
  colorTone: string;
  shapes: string;
  mood: string;
}

export interface InspirationItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  colors: string[];
  source: string;
  platform: string;
  visualStyle: VisualStyle;
  colorMood?: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted';
  colorContrast?: 'high' | 'medium' | 'low';
  // Additional CLIP and AI features
  colorFilters?: string[];
  clipVector?: number[]; // CLIP embedding for similarity search
  classification?: {
    label: string;
    score: number;
  };
}

export interface SearchResult {
  items: InspirationItem[];
  totalCount: number;
  hasMore: boolean;
}

// Category types
export type Category = 'all' | 'uploads' | 'architecture' | 'ui' | 'branding' | 'photography' | 'ui-design' | 'typography' | 'illustration' | 'motion-graphics';
export type CategoryType = Category;

// Category interface for objects with id and name
export interface CategoryObject {
  id: Category;
  name: string;
}