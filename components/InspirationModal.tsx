"use client";

import { useState, useEffect } from 'react';
import { ArrowUpRight, ExternalLink, X, Calendar, Brain, Palette, Tag, Eye, Lightbulb, Shapes } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { InspirationItem } from '@/types/inspiration';
import { cn } from '@/lib/utils';
import { useSimilarityInfiniteScroll } from '@/hooks/useSimilarityInfiniteScroll';

interface InspirationModalProps {
  item: InspirationItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string) => void;
  allItems: InspirationItem[];
  onItemSelect: (item: InspirationItem) => void;
}

export function InspirationModal({ item, isOpen, onClose, onSave, allItems, onItemSelect }: InspirationModalProps) {
  console.log('InspirationModal rendered for item:', item?.id);
  
  const [similarityType, setSimilarityType] = useState<'visual' | 'color' | 'semantic' | 'style' | 'thematic' | 'mixed'>('visual');
  
  // Use infinite scroll hook for similarity
  const {
    similarItems,
    isLoading: isLoadingSimilar,
    hasMore,
    error,
    totalCount
  } = useSimilarityInfiniteScroll({
    targetItem: item,
    allItems,
    similarityType,
    initialLimit: 12
  });

  const similarityTypes = [
    { key: 'visual' as const, label: 'Visual', icon: Eye, description: 'Similar composition & structure' },
    { key: 'color' as const, label: 'Color', icon: Palette, description: 'Similar color palettes' },
    { key: 'semantic' as const, label: 'Tags', icon: Tag, description: 'Similar tags & concepts' },
    { key: 'style' as const, label: 'Style', icon: Shapes, description: 'Similar design approach' },
    { key: 'thematic' as const, label: 'Theme', icon: Lightbulb, description: 'Similar themes & content' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden bg-swiss-white border border-swiss-black">
        <div className="grid grid-cols-12 h-[95vh]">
          {/* Image Section */}
          <div className="col-span-8 bg-swiss-white border-r border-swiss-black flex items-center justify-center p-12">
            <div className="relative max-w-full max-h-full">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="max-w-full max-h-[80vh] object-contain border border-swiss-black"
              />
              
              {/* Minimal Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  className="w-10 h-10 bg-swiss-white border border-swiss-black flex items-center justify-center swiss-hover"
                  onClick={() => window.open(item.imageUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button
                  className="w-10 h-10 bg-swiss-black text-swiss-white border border-swiss-black flex items-center justify-center swiss-hover"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Details Section - Swiss Layout */}
          <div className="col-span-4 bg-swiss-white overflow-y-auto">
            {/* Header with Grid */}
            <div className="border-b border-swiss-black p-8">
              <div className="mb-6">
                <h1 className="text-2xl swiss-title font-light leading-tight mb-2">
                  {item.title}
                </h1>
                <div className="w-12 h-px bg-swiss-black"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs swiss-mono">
                <div>
                  <span className="text-swiss-gray-500 block mb-1">AUTHOR</span>
                  <span className="text-swiss-black">{item.author}</span>
                </div>
                <div>
                  <span className="text-swiss-gray-500 block mb-1">DATE</span>
                  <span className="text-swiss-black">
                    {new Date(item.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-swiss-gray-500 block mb-1">CATEGORY</span>
                  <span className="text-swiss-black">{item.category}</span>
                </div>
                <div>
                  <span className="text-swiss-gray-500 block mb-1">LIKES</span>
                  <span className="text-swiss-black">{item.likes}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div className="border-b border-swiss-black p-8">
                <div className="mb-4">
                  <h3 className="text-sm swiss-mono text-swiss-gray-600 mb-1 tracking-wider">
                    DESCRIPTION
                  </h3>
                  <div className="w-12 h-px bg-swiss-black"></div>
                </div>
                <p className="text-sm swiss-body text-swiss-gray-700 text-justify leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Tags */}
            <div className="border-b border-swiss-black p-8">
              <div className="mb-4">
                <h3 className="text-sm swiss-mono text-swiss-gray-600 mb-1 tracking-wider">
                  TAGS
                </h3>
                <div className="w-12 h-px bg-swiss-black"></div>
              </div>
              <div className="space-y-2">
                {item.tags.map((tag, index) => (
                  <div key={tag} className="flex items-center justify-between py-1">
                    <span className="text-sm swiss-body text-swiss-gray-700">
                      {tag}
                    </span>
                    <span className="text-xs swiss-mono text-swiss-gray-400">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="border-b border-swiss-black p-8">
              <div className="mb-4">
                <h3 className="text-sm swiss-mono text-swiss-gray-600 mb-1 tracking-wider">
                  COLOR PALETTE
                </h3>
                <div className="w-12 h-px bg-swiss-black"></div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {item.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div
                      className="w-12 h-8 border border-swiss-black cursor-pointer swiss-hover"
                      style={{ backgroundColor: color }}
                      onClick={() => navigator.clipboard.writeText(color)}
                    />
                    <span className="text-xs swiss-mono text-swiss-gray-700">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Items */}
            <div className="border-b border-swiss-black p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm swiss-mono text-swiss-gray-600 tracking-wider">
                    SIMILAR REFERENCES
                  </h3>
                  <div className="flex items-center gap-2">
                    <Brain className="w-3 h-3 text-swiss-gray-500" />
                    <span className="text-xs swiss-mono text-swiss-gray-500">AI-POWERED</span>
                    <span className="text-xs swiss-mono text-swiss-gray-400">({totalCount})</span>
                    {isLoadingSimilar && (
                      <div className="w-2 h-2 bg-swiss-black animate-pulse"></div>
                    )}
                  </div>
                </div>
                
                {/* Similarity Type Selector */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {similarityTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.key}
                        onClick={() => setSimilarityType(type.key)}
                        className={cn(
                          "flex items-center gap-2 p-2 border transition-colors text-xs",
                          similarityType === type.key
                            ? "border-swiss-black bg-swiss-black text-swiss-white"
                            : "border-swiss-gray-300 hover:border-swiss-black"
                        )}
                        title={type.description}
                      >
                        <IconComponent className="w-3 h-3" />
                        <span className="swiss-mono">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="w-12 h-px bg-swiss-black"></div>
              </div>
              
              {/* Scrollable Similar Items Container */}
              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  {similarItems.map((similarItem, index) => (
                    <div 
                      key={`${similarItem.id}-${index}`}
                      className="group cursor-pointer swiss-hover"
                      onClick={() => onItemSelect(similarItem)}
                    >
                      <div className="aspect-square border border-swiss-black overflow-hidden mb-2">
                        <img 
                          src={similarItem.imageUrl} 
                          alt={similarItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs swiss-body font-medium leading-tight">
                          {similarItem.title}
                        </h4>
                        <p className="text-xs swiss-mono text-swiss-gray-500">
                          {similarItem.author}
                        </p>
                        <div className="flex gap-1">
                          {similarItem.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs swiss-mono text-swiss-gray-400">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Infinite Scroll Trigger */}
                <div id="similarity-scroll-trigger" className="h-4 w-full">
                  {isLoadingSimilar && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={`loading-${index}`} className="group">
                          <div className="aspect-square border border-swiss-black bg-swiss-gray-100 animate-pulse mb-2" />
                          <div className="space-y-1">
                            <div className="h-3 bg-swiss-gray-200 animate-pulse" />
                            <div className="h-2 bg-swiss-gray-100 animate-pulse w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {!isLoadingSimilar && !hasMore && similarItems.length > 0 && (
                  <div className="text-center py-4">
                    <div className="text-xs swiss-mono text-swiss-gray-400">
                      All similar items loaded
                    </div>
                  </div>
                )}
                
                {!isLoadingSimilar && similarItems.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-xs swiss-mono text-swiss-gray-500">
                      No similar items found for this similarity type
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-4">
                    <div className="text-xs swiss-mono text-red-500">
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-8">
              <button
                className="w-full h-12 border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white flex items-center justify-center gap-3 transition-colors swiss-mono text-sm tracking-wider"
                onClick={() => onSave(item.id)}
              >
                <ArrowUpRight className="w-4 h-4" />
                SAVE TO BLOCK
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}