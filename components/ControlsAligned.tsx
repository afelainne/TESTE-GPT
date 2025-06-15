"use client";

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlsAlignedProps {
  imageSize: number;
  onImageSizeChange: (size: number) => void;
  interactiveMode: boolean;
  onInteractiveModeChange: (mode: boolean) => void;
  hoverZoom: number;
  onHoverZoomChange: (zoom: number) => void;
}

export function ControlsAligned({ 
  imageSize, 
  onImageSizeChange, 
  interactiveMode, 
  onInteractiveModeChange,
  hoverZoom,
  onHoverZoomChange 
}: ControlsAlignedProps) {

  const handleSizeChange = (delta: number) => {
    const newSize = Math.max(1, Math.min(8, imageSize + delta));
    console.log('Image size changed from', imageSize, 'to', newSize);
    onImageSizeChange(newSize);
  };

  const handleZoomChange = (delta: number) => {
    const newZoom = Math.max(1, Math.min(2, hoverZoom + delta));
    console.log('Hover zoom changed from', hoverZoom, 'to', newZoom);
    onHoverZoomChange(newZoom);
  };

  return (
    <div className="flex items-end justify-end space-x-8">
      {/* Interactive Mode Toggle - Hidden on Mobile */}
      <div className="hidden lg:flex min-w-fit flex-col">
        <label className="text-xs swiss-mono text-swiss-gray-500 mb-2 tracking-wider">
          INTERACTIVE
        </label>
        <button
          onClick={() => onInteractiveModeChange(!interactiveMode)}
          className={`w-12 h-6 border border-swiss-black relative transition-all duration-200 ${
            interactiveMode ? 'bg-swiss-black' : 'bg-swiss-white'
          }`}
        >
          <div className={`w-4 h-4 border border-swiss-black transition-all duration-200 absolute top-0.5 ${
            interactiveMode ? 'translate-x-6 bg-swiss-white' : 'translate-x-0.5 bg-swiss-black'
          }`} />
        </button>
      </div>

      {/* Hover Zoom Control - Consistent styling */}
      {interactiveMode && (
        <div className="min-w-fit flex flex-col">
          <label className="text-xs swiss-mono text-swiss-gray-500 mb-2 tracking-wider">
            HOVER ZOOM
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoomChange(-0.1)}
              disabled={hoverZoom <= 1}
              className={cn(
                "w-6 h-6 border border-swiss-black flex items-center justify-center transition-all duration-200 text-xs",
                hoverZoom <= 1 
                  ? "bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed" 
                  : "bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white"
              )}
            >
              −
            </button>
            
            {/* Zoom Level Indicator */}
            <div className="flex items-center gap-1">
              {[1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-1.5 h-1.5 border border-swiss-black transition-all cursor-pointer",
                    Math.round(hoverZoom * 10) / 10 >= level
                      ? "bg-swiss-black" 
                      : "bg-swiss-white"
                  )}
                  onClick={() => onHoverZoomChange(level)}
                  title={`${level}x zoom`}
                />
              ))}
            </div>
            
            <button
              onClick={() => handleZoomChange(0.1)}
              disabled={hoverZoom >= 2}
              className={cn(
                "w-6 h-6 border border-swiss-black flex items-center justify-center transition-all duration-200 text-xs",
                hoverZoom >= 2 
                  ? "bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed" 
                  : "bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white"
              )}
            >
              +
            </button>
            
            {/* Current Zoom Display */}
            <div className="text-xs swiss-mono text-swiss-gray-500 ml-2 min-w-[32px]">
              {hoverZoom.toFixed(1)}x
            </div>
          </div>
        </div>
      )}
      
      {/* Image Size Control - Hidden on Mobile */}
      <div className="hidden lg:flex min-w-fit flex-col">
        <label className="text-xs swiss-mono text-swiss-gray-500 mb-2 tracking-wider">
          SIZE
        </label>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleSizeChange(-1)}
            disabled={imageSize <= 1}
            className={cn(
              "w-6 h-6 border border-swiss-black flex items-center justify-center transition-all duration-200 text-xs",
              imageSize <= 1 
                ? "bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed" 
                : "bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white"
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
                  "w-1.5 h-1.5 border border-swiss-black transition-all cursor-pointer",
                  size <= imageSize 
                    ? "bg-swiss-black" 
                    : "bg-swiss-white"
                )}
                onClick={() => onImageSizeChange(size)}
                title={`Size ${size}x`}
              />
            ))}
          </div>
          
          <button
            onClick={() => handleSizeChange(1)}
            disabled={imageSize >= 7}
            className={cn(
              "w-6 h-6 border border-swiss-black flex items-center justify-center transition-all duration-200 text-xs",
              imageSize >= 7 
                ? "bg-swiss-gray-100 text-swiss-gray-400 cursor-not-allowed" 
                : "bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white"
            )}
          >
            <Plus className="w-3 h-3" />
          </button>
          
          {/* Current Size Display */}
          <div className="text-xs swiss-mono text-swiss-gray-500 ml-2 min-w-[24px]">
            {imageSize}x
          </div>
        </div>
      </div>
    </div>
  );
}