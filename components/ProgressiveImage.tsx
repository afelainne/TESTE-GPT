"use client";

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  placeholder?: string;
  blurAmount?: number;
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className, 
  onClick,
  placeholder,
  blurAmount = 10
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate low-quality placeholder from original URL
  const getLowQualityUrl = (originalUrl: string): string => {
    try {
      // Clean URL first - remove existing parameters to avoid conflicts
      const baseUrl = originalUrl.split('?')[0];
      
      if (baseUrl.includes('unsplash.com')) {
        return `${baseUrl}?w=50&q=20&blur=10`;
      }
      if (baseUrl.includes('are.na')) {
        return `${baseUrl}?w=50&q=20`;
      }
      // For other URLs, use a simple low quality version
      return `${baseUrl}?w=50&q=20`;
    } catch (error) {
      console.warn('Failed to generate low quality URL for:', originalUrl);
      return originalUrl; // Fallback to original if parsing fails
    }
  };

  // Generate fallback URLs for failed images
  const generateFallbackUrls = (originalUrl: string): string[] => {
    const fallbacks: string[] = [];
    
    try {
      const baseUrl = originalUrl.split('?')[0];
      
      if (baseUrl.includes('unsplash.com')) {
        // Try different Unsplash variations
        fallbacks.push(
          `${baseUrl}?w=600&q=75&fm=jpg`,
          `${baseUrl}?w=400&q=80`,
          `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80`, // Reliable fallback
        );
      } else if (baseUrl.includes('are.na')) {
        // Try different Are.na variations
        fallbacks.push(
          `${baseUrl}?w=600&q=75`,
          `https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80`, // Reliable fallback
        );
      } else if (baseUrl.includes('cloudfront.net')) {
        // For cloudfront URLs, try basic parameters
        fallbacks.push(
          `${baseUrl}?w=600&q=75`,
          `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80`, // Reliable fallback
        );
      }
      
      // Always add a reliable placeholder as final fallback
      fallbacks.push('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80');
      
    } catch (error) {
      // If parsing fails, use default placeholder
      fallbacks.push('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80');
    }
    
    return fallbacks;
  };

  const placeholderUrl = placeholder || getLowQualityUrl(src);

  useEffect(() => {
    if (!src || src.trim() === '') {
      console.warn('ProgressiveImage: Empty or invalid src provided');
      setIsError(true);
      return;
    }
    
    console.log('ProgressiveImage: Loading', src);
    
    // Clean the source URL by removing duplicate parameters
    const cleanSrc = (() => {
      try {
        const url = new URL(src);
        // Remove duplicate parameters and ensure clean URL
        const params = new URLSearchParams();
        url.searchParams.forEach((value, key) => {
          if (!params.has(key)) { // Only add if not already present
            params.set(key, value);
          }
        });
        return `${url.origin}${url.pathname}?${params.toString()}`;
      } catch {
        // If URL parsing fails, try to clean manually
        return src.split('?')[0] + (src.includes('?') ? '?' + src.split('?')[1].split('?')[0] : '');
      }
    })();
    
    // Start with placeholder
    setCurrentSrc(placeholderUrl);
    setIsLoaded(false);
    setIsError(false);

    // Preload high-quality image with clean URL
    const img = new Image();
    img.onload = () => {
      console.log('ProgressiveImage: High-res loaded for', cleanSrc);
      setCurrentSrc(cleanSrc);
      setIsLoaded(true);
    };
    img.onerror = () => {
      console.warn('ProgressiveImage: Failed to load', cleanSrc);
      // Try alternative image sources before showing error
      const fallbackUrls = generateFallbackUrls(cleanSrc);
      
      let currentFallbackIndex = 0;
      const tryNextFallback = () => {
        if (currentFallbackIndex < fallbackUrls.length) {
          const fallbackUrl = fallbackUrls[currentFallbackIndex];
          console.log('ProgressiveImage: Trying fallback', fallbackUrl);
          
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            console.log('ProgressiveImage: Fallback loaded successfully', fallbackUrl);
            setCurrentSrc(fallbackUrl);
            setIsLoaded(true);
          };
          fallbackImg.onerror = () => {
            currentFallbackIndex++;
            tryNextFallback();
          };
          fallbackImg.src = fallbackUrl;
        } else {
          // All fallbacks failed, use placeholder or error state
          if (placeholderUrl && placeholderUrl !== cleanSrc) {
            console.log('ProgressiveImage: Using placeholder as final fallback');
            setCurrentSrc(placeholderUrl);
          } else {
            console.log('ProgressiveImage: All fallbacks failed, showing error state');
            setIsError(true);
          }
        }
      };
      
      tryNextFallback();
    };
    img.src = cleanSrc;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, placeholderUrl]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onClick={onClick}
        className={cn(
          "w-full h-full object-cover cursor-pointer transition-all duration-500",
          !isLoaded && !isError && "filter blur-sm scale-105",
          isLoaded && "filter-none scale-100",
          isError && "opacity-50"
        )}
        style={{
          filter: !isLoaded && !isError ? `blur(${blurAmount}px)` : 'none',
          transform: !isLoaded && !isError ? 'scale(1.05)' : 'scale(1)',
        }}
      />
      
      {/* Loading indicator */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-swiss-white/10 backdrop-blur-sm">
          <div className="w-4 h-4 border border-swiss-black animate-pulse"></div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-swiss-gray-100 to-swiss-gray-200">
          <div className="text-center p-4">
            <div className="w-8 h-8 mx-auto mb-2 border border-swiss-gray-400 opacity-50"></div>
            <div className="text-xs swiss-mono text-swiss-gray-500">
              IMAGE UNAVAILABLE
            </div>
          </div>
        </div>
      )}

      {/* Quality indicator */}
      <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
        <div className={cn(
          "px-2 py-1 text-xs swiss-mono rounded",
          isLoaded ? "bg-green-500/20 text-green-800" : "bg-yellow-500/20 text-yellow-800"
        )}>
          {isLoaded ? "HQ" : "LQ"}
        </div>
      </div>
    </div>
  );
}