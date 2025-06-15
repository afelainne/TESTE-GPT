"use client";

import { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageExpanderProps {
  imageUrl: string;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageExpander({ imageUrl, title, isOpen, onClose }: ImageExpanderProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation(prev => prev + 90);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <h3 className="text-white swiss-title font-light text-lg truncate max-w-md">
          {title}
        </h3>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-white text-sm swiss-mono min-w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            Reset
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image */}
      <div className="flex items-center justify-center w-full h-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out cursor-move"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
          }}
          draggable={false}
        />
      </div>

      {/* Footer Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <p className="text-white text-sm swiss-mono opacity-75 text-center">
          Click outside image to close • Use controls to zoom and rotate
        </p>
      </div>
    </div>
  );
}