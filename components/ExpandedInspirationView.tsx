"use client";

import { useState, useEffect } from 'react';
import { ArrowUpRight, ExternalLink, X, ChevronDown, RefreshCw } from 'lucide-react';
import { InspirationItem } from '@/types/inspiration';
import { SaveToFolderModal } from './SaveToFolderModal';
import { AuthorInfo } from './AuthorInfo';
import { ColorPalette } from './ColorPalette';
import { cn } from '@/lib/utils';

interface ExpandedInspirationViewProps {
  item: InspirationItem;
  allItems: InspirationItem[];
  onClose: () => void;
  onSave: (id: string) => void;
  onItemSelect: (item: InspirationItem) => void;
}

export function ExpandedInspirationView({ 
  item, 
  allItems, 
  onClose, 
  onSave, 
  onItemSelect 
}: ExpandedInspirationViewProps) {
  const [currentItem, setCurrentItem] = useState(item);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [similarItems, setSimilarItems] = useState<InspirationItem[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  console.log('ExpandedInspirationView rendered for item:', item?.id);

  // Function to fetch similar items based on current item
  const fetchSimilarItems = async (targetItem: InspirationItem) => {
    setIsLoadingSimilar(true);
    try {
      const response = await fetch('/api/search-similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: targetItem.imageUrl,
          limit: 8
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSimilarItems(data.results || []);
        console.log('🔍 Similar items loaded:', data.results?.length);
      } else {
        // Fallback to random items from allItems
        const filtered = allItems.filter(i => i.id !== targetItem.id);
        setSimilarItems(filtered.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching similar items:', error);
      // Fallback to random items
      const filtered = allItems.filter(i => i.id !== targetItem.id);
      setSimilarItems(filtered.slice(0, 8));
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  // Load similar items when component mounts or current item changes
  useEffect(() => {
    fetchSimilarItems(currentItem);
  }, [currentItem.id]);

  return (
    <div className="w-full bg-swiss-white border border-swiss-black animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 border-b border-swiss-black bg-swiss-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-swiss-black"></div>
          <span className="text-sm swiss-mono font-medium">EXPANDED VIEW</span>
          <span className="text-xs swiss-mono text-swiss-gray-500">#{item.id.slice(-6)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 border border-swiss-black bg-swiss-white flex items-center justify-center swiss-hover"
          >
            <ChevronDown className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 border border-swiss-black bg-swiss-white flex items-center justify-center swiss-hover"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={cn("transition-all duration-300 overflow-hidden", isCollapsed && "max-h-0")}>
        <div className="grid grid-cols-12 gap-0">
          {/* Image Section with smooth transitions */}
          <div className="col-span-7 p-8 border-r border-swiss-black">
            <div className="relative">
              <div className={cn(
                "transition-all duration-500 ease-out",
                isTransitioning ? "opacity-0 transform scale-95" : "opacity-100 transform scale-100"
              )}>
                <img
                  key={currentItem.id} // Force re-render for smooth transition
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  className="w-full h-auto object-contain border border-swiss-black animate-fade-in"
                />
              </div>
              
              {/* Repositioned Save Button - top right actions */}
              <div className="absolute top-4 right-14 flex gap-2">
                <button
                  className="w-10 h-10 bg-swiss-white border border-swiss-black flex items-center justify-center swiss-hover"
                  onClick={() => window.open(currentItem.imageUrl, '_blank')}
                  title="Open full size"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              
              {/* Loading overlay during transition */}
              {isTransitioning && (
                <div className="absolute inset-0 flex items-center justify-center bg-swiss-white bg-opacity-80">
                  <div className="w-8 h-8 border-2 border-swiss-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Details Section with smooth content transitions */}
          <div className="col-span-5">
            {/* Basic Info */}
            <div className={cn(
              "p-6 border-b border-swiss-black transition-all duration-500",
              isTransitioning ? "opacity-50" : "opacity-100"
            )}>
              <h1 className="text-xl swiss-title font-light leading-tight mb-3">
                {currentItem.title}
              </h1>
              
              {/* Author Information with API Integration */}
              <AuthorInfo key={currentItem.id} item={currentItem} />
              
              <div className="grid grid-cols-2 gap-4 text-xs swiss-mono mb-4">
                <div>
                  <span className="text-swiss-gray-500 block mb-1">CATEGORY</span>
                  <span className="text-swiss-black">{currentItem.category}</span>
                </div>
                <div>
                  <span className="text-swiss-gray-500 block mb-1">PLATFORM</span>
                  <span className="text-swiss-black">{currentItem.platform}</span>
                </div>
              </div>

              {currentItem.description && (
                <p className="text-sm swiss-body text-swiss-gray-700 leading-relaxed mb-4">
                  {currentItem.description}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {currentItem.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="text-xs swiss-mono px-2 py-1 border border-swiss-gray-300 text-swiss-gray-600">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Enhanced Color Palette */}
              <ColorPalette 
                imageUrl={currentItem.imageUrl}
                fallbackColors={currentItem.colors}
                className="mb-4"
              />

              {/* Save Button - Same as Home thumbnail */}
              <button
                className="w-8 h-8 border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white flex items-center justify-center transition-all duration-200 group"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('🔄 Opening save modal for:', currentItem.title);
                  try {
                    setShowSaveModal(true);
                  } catch (error) {
                    console.error('❌ Error opening save modal:', error);
                  }
                }}
                title="Save to folder"
              >
                <div className="relative">
                  <ArrowUpRight className="w-3 h-3" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 border border-current bg-current"></div>
                </div>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm swiss-mono text-swiss-gray-600 tracking-wider mb-3">
                  NAVIGATION
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={onClose}
                    className="w-full h-10 border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white flex items-center justify-center gap-2 transition-colors swiss-mono text-sm"
                  >
                    <X className="w-4 h-4" />
                    CLOSE & RETURN TO GRID
                  </button>
                  
                  <div className="text-xs swiss-mono text-swiss-gray-500 text-center pt-2">
                    Similar references shown below
                  </div>
                  
                  {/* Similar Items Grid with organic transition */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs swiss-mono text-swiss-gray-600 tracking-wider">
                        SIMILAR REFERENCES
                      </div>
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
                    
                    <div className={cn(
                      "grid grid-cols-4 gap-2 transition-all duration-500",
                      isTransitioning && "opacity-50 transform scale-95"
                    )}>
                      {(similarItems.length > 0 ? similarItems : allItems).slice(0, 8).map((similarItem, index) => (
                        <button
                          key={similarItem.id}
                          onClick={async () => {
                            console.log('🖼️ Expanding similar item:', similarItem.id);
                            
                            // Smooth transition effect
                            setIsTransitioning(true);
                            
                            // Wait for transition
                            await new Promise(resolve => setTimeout(resolve, 250));
                            
                            // Switch to new item (this will center it)
                            setCurrentItem(similarItem);
                            
                            // Fetch new similar items for the selected item
                            fetchSimilarItems(similarItem);
                            
                            // Complete transition
                            setIsTransitioning(false);
                          }}
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
                          />
                          {currentItem.id === similarItem.id && (
                            <div className="absolute inset-0 border-2 border-swiss-black"></div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    <div className="text-xs swiss-mono text-swiss-gray-400 text-center mt-3">
                      {isLoadingSimilar ? "Loading similar references..." : `CLIP SIMILARITY • ${similarItems.length} results`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Folder Modal */}
      {showSaveModal && (
        <SaveToFolderModal
          isOpen={showSaveModal}
          onClose={() => {
            console.log('🔄 Closing save modal');
            setShowSaveModal(false);
          }}
          contentId={currentItem?.id || ''}
          contentTitle={currentItem?.title || ''}
        />
      )}
    </div>
  );
}