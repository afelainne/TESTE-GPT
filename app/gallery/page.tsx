"use client";

import { useState } from 'react';
import { InfiniteGallery } from '@/components/InfiniteGallery';
import { ExpandedInspirationView } from '@/components/ExpandedInspirationView';
import { ImageSizeSlider } from '@/components/ImageSizeSlider';
import { InspirationItem } from '@/types/inspiration';

export default function GalleryPage() {
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  const [imageSize, setImageSize] = useState(3);

  const handleSave = (id: string) => {
    console.log('Save item:', id);
    // TODO: Implement save functionality
  };

  const handleViewItem = (item: InspirationItem, index?: number) => {
    console.log('View item:', item.id, 'at index:', index);
    setSelectedItem(item);
  };

  const handleCloseExpanded = () => {
    setSelectedItem(null);
  };

  const handleItemSelect = (item: InspirationItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="min-h-screen bg-swiss-white">
      {/* Header */}
      <div className="border-b border-swiss-black bg-swiss-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl swiss-title font-light mb-2">
                Infinite Gallery Test
              </h1>
              <p className="text-sm swiss-mono text-swiss-gray-600">
                Testing infinite scroll and CLIP similarity features
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <ImageSizeSlider
                imageSize={imageSize}
                onSizeChange={setImageSize}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {selectedItem ? (
          /* Expanded View */
          <ExpandedInspirationView
            item={selectedItem}
            allItems={[]} // Will be populated by CLIP API
            onClose={handleCloseExpanded}
            onSave={handleSave}
            onItemSelect={handleItemSelect}
          />
        ) : (
          /* Gallery Grid */
          <div className="p-4 lg:p-8">
            <InfiniteGallery
              onSave={handleSave}
              onViewItem={handleViewItem}
              imageSize={imageSize}
              className="animate-fade-in"
            />
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="fixed bottom-4 right-4 bg-swiss-black text-swiss-white p-3 text-xs swiss-mono opacity-75">
        <div>Image Size: {imageSize}</div>
        <div>Selected: {selectedItem ? selectedItem.id : 'None'}</div>
        <div>CLIP API: {process.env.NEXT_PUBLIC_CLIP_API_URL ? 'Configured' : 'Missing'}</div>
      </div>
    </div>
  );
}