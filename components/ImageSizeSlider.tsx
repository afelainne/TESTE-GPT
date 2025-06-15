"use client";

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageSizeSliderProps {
  imageSize: number;
  onSizeChange: (size: number) => void;
}

export function ImageSizeSlider({ imageSize, onSizeChange }: ImageSizeSliderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  console.log('ImageSizeSlider rendered with size:', imageSize);

  const handleSizeChange = (delta: number) => {
    const newSize = Math.max(1, Math.min(7, imageSize + delta));
    console.log('Image size changed from', imageSize, 'to', newSize);
    onSizeChange(newSize);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Size Control Label */}
      <div className="text-xs font-medium text-swiss-gray-600 tracking-wider swiss-mono">
        SIZE
      </div>
      
      {/* Grid Lines */}
      <div className="w-8 h-px bg-swiss-black"></div>
      
      {/* Size Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleSizeChange(-1)}
          disabled={imageSize <= 1}
          className={cn(
            "w-6 h-6 border border-swiss-black flex items-center justify-center hover:bg-swiss-gray-50 transition-all",
            imageSize <= 1 
              ? "bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed" 
              : "bg-swiss-white text-swiss-black"
          )}
        >
          <Minus className="w-3 h-3" />
        </button>
        
        {/* Size Indicator - Inverted: fill from left to right */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7].map((size) => (
            <div
              key={size}
              className={cn(
                "w-1.5 h-1.5 border border-swiss-black transition-all cursor-pointer hover:border-swiss-gray-600",
                size <= imageSize 
                  ? "bg-swiss-black" 
                  : "bg-swiss-white"
              )}
              onClick={() => onSizeChange(size)}
              title={`Size ${size}x`}
            />
          ))}
        </div>
        
        <button
          onClick={() => handleSizeChange(1)}
          disabled={imageSize >= 7}
          className={cn(
            "w-6 h-6 border border-swiss-black flex items-center justify-center hover:bg-swiss-gray-50 transition-all",
            imageSize >= 7 
              ? "bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed" 
              : "bg-swiss-white text-swiss-black"
          )}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
      
      {/* Current Size Display */}
      <div className="text-xs swiss-mono text-swiss-gray-500">
        {imageSize}/7
      </div>
    </div>
  );
}