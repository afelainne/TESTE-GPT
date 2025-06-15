"use client";

import { useState } from 'react';
import Masonry from 'react-masonry-css';
import { InspirationCard } from './InspirationCard';
import { InspirationModal } from './InspirationModal';
import { PinterestExpansion } from './PinterestExpansion';
import { ControlsAligned } from './ControlsAligned';
import { InspirationItem } from '@/types/inspiration';

interface InspirationGridProps {
  items: InspirationItem[];
  onSave: (id: string) => void;
  imageSize: number;
  onImageSizeChange: (size: number) => void;
  totalCount?: number;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export function InspirationGrid({ 
  items, 
  onSave, 
  imageSize, 
  onImageSizeChange, 
  totalCount, 
  hasMore = false, 
  isLoading = false, 
  onLoadMore 
}: InspirationGridProps) {
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  const [expandedItem, setExpandedItem] = useState<InspirationItem | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [interactiveMode, setInteractiveMode] = useState(false);
  const [hoverZoom, setHoverZoom] = useState(1.1);

  console.log('InspirationGrid rendered with', items.length, 'items');

  // Dynamic breakpoints based on image size - Mobile Optimized (up to 8x)
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

  const handleViewItem = (item: InspirationItem, clickedIndex?: number) => {
    console.log('🖼️ Expanding in-place for item:', item.id);
    // Save scroll position before expanding
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lastScrollY', String(window.scrollY));
      console.log('💾 Grid: Saved scroll position:', window.scrollY);
    }
    setExpandedItem(item);
    setExpandedIndex(clickedIndex ?? 0);
  };

  const handleCloseExpanded = () => {
    console.log('Closing expanded view');
    setExpandedItem(null);
    setExpandedIndex(null);
    // Restore scroll position
    if (typeof window !== 'undefined') {
      const lastScrollY = Number(sessionStorage.getItem('lastScrollY') || 0);
      console.log('🔄 Grid: Restoring scroll position:', lastScrollY);
      setTimeout(() => {
        window.scrollTo({ top: lastScrollY, behavior: 'auto' });
        sessionStorage.removeItem('lastScrollY');
      }, 100);
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setSelectedItem(null);
  };

  return (
    <>
      <main className="bg-swiss-white min-h-screen">
        {/* Grid Header with Swiss Typography - Mobile Responsive */}
        <div className="border-b border-swiss-black bg-swiss-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 p-4 lg:p-8">
            <div className="lg:col-span-8 mb-4 lg:mb-0">
              <h2 className="text-xl lg:text-2xl swiss-title font-light tracking-wide mb-2">
                Visual References Collection
              </h2>
              <p className="text-sm swiss-mono text-swiss-gray-700 max-w-2xl leading-relaxed">
                Visual systems from awesome but unobserved designers.
                Scroll down to automatically discover more inspiration.
                Each piece is algorithmically curated for visual coherence and contemporary relevance.
              </p>
            </div>
            <div className="lg:col-span-4">
              <ControlsAligned 
                imageSize={imageSize}
                onImageSizeChange={onImageSizeChange}
                interactiveMode={interactiveMode}
                onInteractiveModeChange={setInteractiveMode}
                hoverZoom={hoverZoom}
                onHoverZoomChange={setHoverZoom}
              />
            </div>
          </div>
        </div>

        {/* Grid Content - Mobile Responsive */}
        <div className="p-4 lg:p-8 bg-subtle-grid bg-subtle">
          {expandedItem ? (
            <PinterestExpansion
              item={expandedItem}
              allItems={items}
              onClose={handleCloseExpanded}
              onSave={onSave}
              onItemSelect={(newItem) => {
                setExpandedItem(newItem);
              }}
              expandedIndex={expandedIndex ?? 0}
            />
          ) : (
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="flex gap-3 lg:gap-6 w-full animate-grid-appear"
              columnClassName="flex flex-col gap-3 lg:gap-6"
            >
              {items.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <InspirationCard
                    item={item}
                    onSave={onSave}
                    onView={(clickedItem) => handleViewItem(clickedItem, index)}
                    interactiveMode={interactiveMode}
                    hoverZoom={hoverZoom}
                  />
                </div>
              ))}
            </Masonry>
          )}

          {items.length === 0 && (
            <div className="text-center py-32">
              <div className="max-w-lg mx-auto">
                <div className="w-24 h-24 border border-swiss-black mx-auto mb-8 flex items-center justify-center">
                  <div className="w-12 h-12 border border-swiss-black"></div>
                </div>
                <h3 className="text-xl swiss-title font-light mb-4">
                  No References Found
                </h3>
                <p className="text-sm swiss-body text-swiss-gray-700 text-justify leading-relaxed">
                  The current search criteria or category selection has yielded no results. 
                  Please adjust your filters or explore different categories to discover 
                  relevant design references.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedItem && (
        <InspirationModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={handleCloseModal}
          onSave={onSave}
          allItems={items}
          onItemSelect={(item) => {
            console.log('Selecting similar item:', item.id);
            setSelectedItem(item);
          }}
        />
      )}
    </>
  );
}