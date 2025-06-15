"use client";

import { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, ArrowUpRight, RefreshCw, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { InspirationItem } from '@/types/inspiration';
import { SaveToFolderModal } from './SaveToFolderModal';
import { AuthorInfo } from './AuthorInfo';
import { cn } from '@/lib/utils';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
// Removed colormind dependency - using direct palette API

interface PinterestExpansionProps {
  item: InspirationItem;
  allItems: InspirationItem[];
  onClose: () => void;
  onSave: (id: string) => void;
  onItemSelect: (item: InspirationItem) => void;
  expandedIndex: number;
  onViewItem?: (item: InspirationItem, index?: number) => void;
}

export function PinterestExpansion({ 
  item, 
  allItems, 
  onClose, 
  onSave, 
  onItemSelect,
  expandedIndex,
  onViewItem 
}: PinterestExpansionProps) {
  const [currentItem, setCurrentItem] = useState(item);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [similarItems, setSimilarItems] = useState<InspirationItem[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isTabOpen, setIsTabOpen] = useState(true);
  const [colorPalettes, setColorPalettes] = useState<string[][]>([]);
  const [isGeneratingColors, setIsGeneratingColors] = useState(false);
  const expansionRef = useRef<HTMLDivElement>(null);

  // Infinite scroll for Other References with real API
  const fetchMoreOtherItems = async (page: number, currentItems: InspirationItem[]) => {
    console.log('📦 Fetching more other references from API, page:', page);
    
    try {
      const cursor = (page - 1) * 15; // 15 items per page
      const response = await fetch(`/api/references?cursor=${cursor}&excludeId=${currentItem.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch references');
      }
      
      const data = await response.json();
      
      if (data.success && data.references) {
        // Transform API response to InspirationItem format
        const pageItems: InspirationItem[] = data.references.map((ref: any) => ({
          id: ref.id,
          title: ref.title,
          imageUrl: ref.image_url,
          authorName: ref.author_name,
          authorProfileUrl: '#',
          platform: 'Database',
          category: 'inspiration',
          tags: [],
          colors: [],
          description: 'Other reference from database',
          sourceUrl: ref.source_url,
          createdAt: ref.created_at
        }));
        
        console.log(`📦 Returning ${pageItems.length} items from API for page ${page}`);
        return pageItems;
      }
      
      return []; // No more items
    } catch (error) {
      console.error('❌ Error fetching references:', error);
      return []; // Return empty on error
    }
  };

  const otherItemsBase: InspirationItem[] = []; // Start with empty array for API-driven content
  const {
    items: otherReferences,
    loading: loadingMoreOthers,
    hasMore: hasMoreOthers,
    loadingRef: otherLoadingRef,
    reset: resetOtherReferences
  } = useInfiniteScroll(
    otherItemsBase, // Start empty
    fetchMoreOtherItems,
    { threshold: 0.8, rootMargin: '200px' }
  );

  console.log('PinterestExpansion rendered for item:', item?.id);

  // Scroll to the expansion when it opens and when switching items
  useEffect(() => {
    if (expansionRef.current) {
      const scrollToExpansion = () => {
        const headerHeight = 100; // Account for header
        const rect = expansionRef.current!.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - headerHeight;
        
        console.log('📍 Scrolling to expanded item at position:', scrollTop);
        
        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      };

      // Small delay to ensure the content is rendered
      const timer = setTimeout(scrollToExpansion, 100);
      return () => clearTimeout(timer);
    }
  }, [currentItem.id]); // Trigger when current item changes

  // Function to fetch similar items using CLIP embeddings by ID
  const fetchSimilarItems = async (targetItem: InspirationItem) => {
    setIsLoadingSimilar(true);
    try {
      console.log('🔍 Fetching CLIP-based similar images for ID:', targetItem.id);
      
      // Use the updated find-similar endpoint with CLIP API
      console.log('[PinterestExpansion] Calling find-similar API for:', targetItem.imageUrl);
      
      const response = await fetch('/api/find-similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: targetItem.imageUrl
        }),
      });
      
      console.log('[PinterestExpansion] API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[PinterestExpansion] API response data:', data);
        
        if (data.similar && Array.isArray(data.similar) && data.similar.length > 0) {
          // Transform CLIP results (URLs) to InspirationItem format
          const clipSimilarItems: InspirationItem[] = data.similar.map((url: string, index: number) => ({
            id: `clip_similar_${index}_${Date.now()}`,
            title: `Similar Image ${index + 1}`,
            imageUrl: url,
            author: 'CLIP API',
            category: 'inspiration',
            tags: [],
            colors: [],
            likes: Math.floor(Math.random() * 100),
            description: 'Found via CLIP similarity',
            sourceUrl: url,
            platform: 'CLIP',
            createdAt: new Date().toISOString()
          }));
          
          setSimilarItems(clipSimilarItems);
          console.log(`✅ Loaded ${clipSimilarItems.length} CLIP-based similar items from API`);
        } else {
          console.log('⚠️ No similar items found in database, loading fallback content');
          // Load fresh content from API as fallback
          try {
            const fallbackResponse = await fetch('/api/clip-vectors?limit=12');
            const fallbackData = await fallbackResponse.json();
            
            if (fallbackData.success && fallbackData.items) {
              const fallbackItems: InspirationItem[] = fallbackData.items
                .filter((item: any) => item.id !== targetItem.id)
                .slice(0, 8)
                .map((item: any) => ({
                  id: item.id,
                  title: item.title,
                  imageUrl: item.image_url,
                  author: item.metadata?.author_name || 'Unknown',
                  category: 'inspiration',
                  tags: [],
                  colors: [],
                  likes: Math.floor(Math.random() * 100),
                  sourceUrl: item.source_url
                }));
              
              setSimilarItems(fallbackItems);
              console.log(`✅ Loaded ${fallbackItems.length} fallback items from API`);
            } else {
              const filtered = allItems.filter(i => i.id !== targetItem.id);
              setSimilarItems(filtered.slice(0, 6));
            }
          } catch (fallbackError) {
            console.error('❌ Fallback API failed:', fallbackError);
            const filtered = allItems.filter(i => i.id !== targetItem.id);
            setSimilarItems(filtered.slice(0, 6));
          }
        }
      } else {
        console.log('⚠️ Similar items API failed, loading fallback content');
        try {
          const fallbackResponse = await fetch('/api/clip-vectors?limit=12');
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.success && fallbackData.items) {
            const fallbackItems: InspirationItem[] = fallbackData.items
              .filter((item: any) => item.id !== targetItem.id)
              .slice(0, 8)
              .map((item: any) => ({
                id: item.id,
                title: item.title,
                imageUrl: item.image_url,
                author: item.metadata?.author_name || 'Unknown',
                category: 'inspiration',
                tags: [],
                colors: [],
                likes: Math.floor(Math.random() * 100),
                sourceUrl: item.source_url
              }));
            
            setSimilarItems(fallbackItems);
            console.log(`✅ Loaded ${fallbackItems.length} fallback items from API`);
          } else {
            const filtered = allItems.filter(i => i.id !== targetItem.id);
            setSimilarItems(filtered.slice(0, 6));
          }
        } catch (fallbackError) {
          console.error('❌ Fallback API failed:', fallbackError);
          const filtered = allItems.filter(i => i.id !== targetItem.id);
          setSimilarItems(filtered.slice(0, 6));
        }
      }
    } catch (error) {
      console.error('❌ Error fetching CLIP similar items:', error);
      // Fallback to filtered items from existing data
      const filtered = allItems.filter(i => i.id !== targetItem.id);
      setSimilarItems(filtered.slice(0, 15));
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  // Function to generate color palettes using real extraction
  const generateColorPalettes = async (targetItem: InspirationItem) => {
    setIsGeneratingColors(true);
    try {
      console.log('🎨 Generating color palette for:', targetItem.title);
      
      const response = await fetch(`/api/color-palette?imageUrl=${encodeURIComponent(targetItem.imageUrl)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.palette) {
          // Convert RGB arrays to hex colors
          const hexColors = data.palette.map((rgb: number[]) => 
            `#${rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('')}`
          );
          
          // Update the current item with generated colors
          const updatedItem = {
            ...targetItem,
            colors: hexColors
          };
          setCurrentItem(updatedItem);
          console.log(`✅ Generated color palette:`, hexColors);
        }
      }
    } catch (error) {
      console.error('❌ Error generating color palettes:', error);
    } finally {
      setIsGeneratingColors(false);
    }
  };

  // Load similar items and color palettes when component mounts or current item changes
  useEffect(() => {
    console.log('🔄 Loading similar items for new current item:', currentItem.id);
    fetchSimilarItems(currentItem);
    generateColorPalettes(currentItem);
    resetOtherReferences(); // Reset infinite scroll when item changes
  }, [currentItem.id]);

  const handleSimilarItemClick = (similarItem: InspirationItem, index?: number) => {
    console.log('🖼️ Switching to similar/reference item:', similarItem.id);
    
    // Update current item immediately
    setCurrentItem(similarItem);
    onItemSelect(similarItem);
    
    // Clear similar items while loading new ones
    setSimilarItems([]);
    
    // If external onViewItem is provided, use it for full expansion behavior
    if (onViewItem) {
      onViewItem(similarItem, index);
    }

    // Force scroll update after state change
    setTimeout(() => {
      if (expansionRef.current) {
        const headerHeight = 100;
        const rect = expansionRef.current.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - headerHeight;
        
        console.log('📍 Re-scrolling to new expanded item at position:', scrollTop);
        
        window.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        });
      }
    }, 150);
  };

  return (
    <div 
      ref={expansionRef}
      className="w-full bg-swiss-white border border-swiss-black animate-fade-in"
    >


      {/* Main Content - Vertical Layout */}
      <div className="flex flex-col gap-0 relative">
        
        {/* Image Container with Close Button */}
        <div className="relative bg-swiss-gray-50 flex items-center justify-center">
          <img
            key={currentItem.id}
            src={currentItem.imageUrl}
            alt={currentItem.title}
            className="max-w-full max-h-[70vh] object-contain animate-fade-in"
          />
          
          {/* Close Button - Mobile Optimized */}
          <button
            className="absolute top-2 right-2 lg:top-4 lg:right-4 w-8 h-8 lg:w-10 lg:h-10 bg-swiss-white/90 backdrop-blur border border-swiss-black flex items-center justify-center swiss-hover shadow-lg"
            onClick={onClose}
            title="Close expanded view"
          >
            <X className="w-3 h-3 lg:w-4 lg:h-4" />
          </button>
        </div>

        {/* Info Panel - Same Width as Image */}
        <div className="bg-white border-t border-swiss-black">
          
          {/* Panel Toggle */}
          <div className="flex justify-center p-3 border-b border-swiss-gray-200">
            <button
              onClick={() => setIsTabOpen(!isTabOpen)}
              className="flex items-center space-x-2 bg-swiss-gray-50 hover:bg-swiss-gray-100 px-4 py-2 border border-swiss-gray-300 transition-colors"
            >
              {isTabOpen ? (
                <>
                  <ChevronUp className="w-4 h-4 text-swiss-gray-600" />
                  <span className="text-sm swiss-mono text-swiss-gray-600">HIDE DETAILS</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 text-swiss-gray-600" />
                  <span className="text-sm swiss-mono text-swiss-gray-600">SHOW DETAILS</span>
                </>
              )}
            </button>
          </div>

          {/* Panel Content */}
          <div className={cn(
            "transition-all duration-300 ease-out overflow-hidden",
            isTabOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}>
            <div className="p-4 lg:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                
                {/* Left Column - Title & Author */}
                <div className="space-y-4">
                  <div>
                    <h1 className="text-xl swiss-title font-light leading-tight mb-2">
                      {currentItem.title}
                    </h1>
                    <div className="w-12 h-px bg-swiss-black"></div>
                  </div>

                  <div>
                    <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider mb-2">
                      AUTHOR
                    </h3>
                    <AuthorInfo key={currentItem.id} item={currentItem} />
                  </div>

                  <div className="text-xs swiss-mono">
                    <div className="mb-2">
                      <span className="text-swiss-gray-500 block mb-1">CATEGORY</span>
                      <span className="text-swiss-black">{currentItem.category}</span>
                    </div>
                    <div>
                      <span className="text-swiss-gray-500 block mb-1">PLATFORM</span>
                      <span className="text-swiss-black">{currentItem.platform}</span>
                    </div>
                  </div>
                </div>

                {/* Color Palette - Use only Colormind colors */}
                <div className="space-y-4">
                  {currentItem.colors.length > 0 && (
                    <div>
                      <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider mb-3">
                        COLOR PALETTE
                      </h3>
                      <div className="grid grid-cols-6 gap-2">
                        {currentItem.colors.slice(0, 6).map((color, index) => (
                          <div
                            key={index}
                            className="aspect-square border border-swiss-black cursor-pointer hover:scale-110 transition-transform duration-200 relative group"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              navigator.clipboard.writeText(color);
                              console.log('Copied color to clipboard:', color);
                            }}
                            title={`Copy ${color} to clipboard`}
                          >
                            <div className="absolute inset-0 flex items-end justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                              <span className="text-white text-xs font-mono p-1 leading-none">
                                {color.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs swiss-mono text-swiss-gray-400 mt-2">
                        Click to copy color
                      </p>
                    </div>
                  )}

                  {currentItem.tags.length > 0 && (
                    <div>
                      <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider mb-2">
                        TAGS
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {currentItem.tags.slice(0, 6).map((tag) => (
                          <span 
                            key={tag} 
                            className="text-xs swiss-mono px-2 py-1 border border-swiss-gray-300 text-swiss-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentItem.description && (
                    <div>
                      <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider mb-2">
                        DESCRIPTION
                      </h3>
                      <p className="text-sm swiss-body text-swiss-gray-700 leading-relaxed">
                        {currentItem.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-4">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="w-full h-10 border border-swiss-black bg-swiss-black text-swiss-white hover:bg-swiss-white hover:text-swiss-black flex items-center justify-center gap-2 transition-colors swiss-mono text-sm"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    SAVE TO FOLDER
                  </button>
                  
                  <button
                    onClick={() => window.open(currentItem.imageUrl, '_blank')}
                    className="w-full h-10 border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white flex items-center justify-center gap-2 transition-colors swiss-mono text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    OPEN FULL SIZE
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Images - Below Main Content */}
      {similarItems.length > 0 && (
        <div className="mt-4 lg:mt-6 bg-white border border-swiss-black p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider">
              SIMILAR REFERENCES ({similarItems.length})
            </h3>
            <button
              onClick={() => fetchSimilarItems(currentItem)}
              disabled={isLoadingSimilar}
              className={cn(
                "w-6 h-6 border border-swiss-gray-300 flex items-center justify-center hover:border-swiss-black transition-all",
                isLoadingSimilar && "animate-spin"
              )}
              title="Refresh similar items"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 lg:gap-3">
            {similarItems.map((similarItem, index) => (
              <button
                key={similarItem.id}
                onClick={() => handleSimilarItemClick(similarItem, index)}
                className={cn(
                  "aspect-square border border-swiss-gray-300 hover:border-swiss-black transition-all duration-300 overflow-hidden group relative",
                  currentItem.id === similarItem.id && "border-swiss-black bg-swiss-gray-50"
                )}
                title={similarItem.title}
              >
                <img
                  src={similarItem.imageUrl}
                  alt={similarItem.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    console.log('❌ Image failed to load:', similarItem.imageUrl);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.style.backgroundColor = '#f3f4f6';
                    target.parentElement!.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-gray-500 p-2">${similarItem.title}</div>`;
                  }}
                />
                {currentItem.id === similarItem.id && (
                  <div className="absolute inset-0 border-2 border-swiss-black"></div>
                )}
              </button>
            ))}
          </div>
          
          <div className="text-xs swiss-mono text-swiss-gray-400 text-center mt-3">
            {isLoadingSimilar ? "Loading CLIP..." : `CLIP SIMILAR • ${similarItems.length}`}
          </div>
        </div>
      )}

      {/* Infinite Gallery - New Section with Endless Images */}
      <div className="mt-4 bg-white border border-swiss-black p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider">
            INFINITE GALLERY ({otherReferences.length + 469} available)
          </h3>
          <div className="text-xs swiss-mono text-swiss-gray-400">
            Scroll to load more
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 lg:gap-3">
          {/* Show first batch of other references */}
          {otherReferences.map((otherItem, index) => (
            <button
              key={`infinite-${otherItem.id}-${index}`}
              onClick={() => handleSimilarItemClick(otherItem, index)}
              className="aspect-square border border-swiss-gray-300 hover:border-swiss-black transition-all duration-300 overflow-hidden group"
              title={otherItem.title}
            >
              <img
                src={otherItem.imageUrl}
                alt={otherItem.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.style.backgroundColor = '#f3f4f6';
                  target.parentElement!.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-gray-500 p-1">${otherItem.title.slice(0, 20)}</div>`;
                }}
              />
            </button>
          ))}
        </div>

        {/* Loading indicator and infinite scroll trigger */}
        <div ref={otherLoadingRef} className="mt-6 text-center">
          {loadingMoreOthers && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-swiss-gray-400" />
              <span className="text-xs swiss-mono text-swiss-gray-500">Loading more references...</span>
            </div>
          )}
          
          {!hasMoreOthers && otherReferences.length > 15 && (
            <div className="py-4">
              <span className="text-xs swiss-mono text-swiss-gray-400">No more references</span>
            </div>
          )}
        </div>
      </div>

      {/* Other References - Below Similar Images with Infinite Scroll */}
      {otherReferences.length > 0 && (
        <div className="mt-4 bg-white border border-swiss-black p-4 lg:p-6">
          <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider mb-4">
            OTHER REFERENCES ({otherReferences.length} loaded)
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 lg:gap-3">
            {otherReferences.map((otherItem, index) => (
              <button
                key={`${otherItem.id}-${index}`}
                onClick={() => handleSimilarItemClick(otherItem, index)}
                className="aspect-square border border-swiss-gray-300 hover:border-swiss-black transition-all duration-300 overflow-hidden group"
                title={otherItem.title}
              >
                <img
                  src={otherItem.imageUrl}
                  alt={otherItem.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </button>
            ))}
          </div>

          {/* Loading indicator and infinite scroll trigger */}
          <div ref={otherLoadingRef} className="mt-6 text-center">
            {loadingMoreOthers && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin text-swiss-gray-400" />
                <span className="text-xs swiss-mono text-swiss-gray-500">Loading more references...</span>
              </div>
            )}
            
            {!hasMoreOthers && otherReferences.length > 15 && (
              <div className="py-4">
                <span className="text-xs swiss-mono text-swiss-gray-400">No more references</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save to Folder Modal */}
      <SaveToFolderModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        contentId={currentItem.id}
        contentTitle={currentItem.title}
      />
    </div>
  );
}