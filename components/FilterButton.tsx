"use client";

import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

interface FilterButtonProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
}

const categories = [
  { id: 'all', label: 'All', count: '∞' },
  { id: 'uploads', label: 'Your Uploads', count: '3' },
  { id: 'design', label: 'Design', count: '36' },
  { id: 'ui-design', label: 'UI Design', count: '12' },
  { id: 'typography', label: 'Typography', count: '8' },
  { id: 'photography', label: 'Photography', count: '15' },
  { id: 'branding', label: 'Branding', count: '6' }
];

const additionalFilters = [
  { id: 'recent', label: 'Recent', type: 'time' },
  { id: 'popular', label: 'Most Liked', type: 'engagement' },
  { id: 'high-res', label: 'High Resolution', type: 'quality' },
  { id: 'color-rich', label: 'Colorful', type: 'style' },
  { id: 'minimal', label: 'Minimal', type: 'style' },
  { id: 'vibrant', label: 'Vibrant', type: 'mood' },
  { id: 'monochrome', label: 'Monochrome', type: 'mood' },
  { id: 'warm-palette', label: 'Warm Colors', type: 'colors' },
  { id: 'cool-palette', label: 'Cool Colors', type: 'colors' },
  { id: 'complementary', label: 'Complementary', type: 'colors' },
  { id: 'analogous', label: 'Analogous', type: 'colors' }
];

export function FilterButton({ selectedCategory, onCategoryChange, activeFilters = [], onFilterChange }: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    console.log('🏷️ Category changed to:', categoryId);
  };

  const handleFilterToggle = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId];
    
    onFilterChange?.(newFilters);
    console.log('🔍 Filters updated:', newFilters);
  };

  const clearAllFilters = () => {
    onCategoryChange('all');
    onFilterChange?.([]);
    console.log('🧹 All filters cleared');
  };

  const activeCount = (selectedCategory !== 'all' ? 1 : 0) + activeFilters.length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-swiss-black text-swiss-black hover:bg-swiss-black hover:text-swiss-white relative"
        >
          <Filter className="w-4 h-4" />
          {activeCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="swiss-title font-light">
            Filter & Categories
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* Active Filters Summary */}
          {activeCount > 0 && (
            <div className="p-3 bg-swiss-gray-50 border border-swiss-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm swiss-mono text-swiss-gray-600">ACTIVE FILTERS</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  Clear All
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(c => c.id === selectedCategory)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto w-auto p-0 ml-1"
                      onClick={() => onCategoryChange('all')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                
                {activeFilters.map(filter => (
                  <Badge key={filter} variant="secondary" className="text-xs">
                    {additionalFilters.find(f => f.id === filter)?.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto w-auto p-0 ml-1"
                      onClick={() => handleFilterToggle(filter)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h3 className="text-sm swiss-mono text-swiss-gray-600 mb-3 tracking-wider">CATEGORIES</h3>
            <div className="space-y-1">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full text-left p-2 text-sm transition-colors swiss-body ${
                    selectedCategory === category.id
                      ? 'bg-swiss-black text-swiss-white'
                      : 'hover:bg-swiss-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.label}</span>
                    <span className="text-xs opacity-60">{category.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div>
            <h3 className="text-sm swiss-mono text-swiss-gray-600 mb-3 tracking-wider">FILTERS</h3>
            
            {/* Group by type */}
            {['time', 'engagement', 'quality', 'style', 'mood', 'colors'].map(type => (
              <div key={type} className="mb-4">
                <h4 className="text-xs swiss-mono text-swiss-gray-500 mb-2 uppercase tracking-wider">
                  {type === 'time' ? 'Sort by' : 
                   type === 'engagement' ? 'Popularity' :
                   type === 'quality' ? 'Quality' :
                   type === 'style' ? 'Style' : 
                   type === 'mood' ? 'Mood' : 'Color Harmony'}
                </h4>
                
                <div className="space-y-1">
                  {additionalFilters
                    .filter(filter => filter.type === type)
                    .map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => handleFilterToggle(filter.id)}
                        className={`w-full text-left p-2 text-sm transition-colors swiss-body ${
                          activeFilters.includes(filter.id)
                            ? 'bg-swiss-black text-swiss-white'
                            : 'hover:bg-swiss-gray-100'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}