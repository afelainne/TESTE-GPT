'use client';

import { useState } from 'react';

interface ImagePlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export default function ImagePlaceholder({
  src,
  alt,
  className = '',
  style,
  loading = 'lazy',
  onLoad,
  onError
}: ImagePlaceholderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  return (
    <div className="relative">
      {!imageLoaded && !imageError && (
        <div 
          className="absolute inset-0 bg-swiss-gray-100 animate-pulse flex items-center justify-center"
          style={style}
        >
          <div className="w-8 h-8 bg-swiss-gray-200 rounded"></div>
        </div>
      )}
      
      {imageError ? (
        <div 
          className="absolute inset-0 bg-swiss-gray-100 flex items-center justify-center text-swiss-gray-400"
          style={style}
        >
          <span className="text-xs">Failed to load</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={style}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}