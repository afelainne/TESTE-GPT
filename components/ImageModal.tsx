"use client";

import { useState, useEffect } from 'react';
import { X, ExternalLink, ArrowUpRight, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { InspirationItem } from '@/types/inspiration';
import { SaveToFolderModal } from './SaveToFolderModal';
import { AuthorInfo } from './AuthorInfo';
import { cn } from '@/lib/utils';

// Color Palette Component
function ColorPaletteSection({ item }: { item: InspirationItem }) {
  const [colors, setColors] = useState<string[]>(item.colors || []);
  const [isGeneratingColors, setIsGeneratingColors] = useState(false);

  useEffect(() => {
    if (colors.length === 0) {
      generateColorPalette();
    }
  }, [item.imageUrl]);

  const generateColorPalette = async () => {
    setIsGeneratingColors(true);
    try {
      console.log('🎨 Generating color palette for:', item.title);
      
      const response = await fetch('/api/palette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: item.imageUrl
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.palette) {
          // Convert RGB arrays to hex colors
          const hexColors = data.palette.map((rgb: number[]) => 
            `#${rgb.map(c => Math.round(c).toString(16).padStart(2, '0')).join('')}`
          );
          setColors(hexColors);
          console.log(`✅ Generated color palette:`, hexColors);
        }
      } else {
        console.warn('⚠️ Could not extract colors from this image');
        setColors([]); // Clear colors if extraction fails
      }
    } catch (error) {
      console.error('❌ Error generating color palette:', error);
      setColors([]); // Clear colors on error
    } finally {
      setIsGeneratingColors(false);
    }
  };

  if (isGeneratingColors) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-4 h-4 border border-swiss-black border-t-transparent rounded-full animate-spin mr-3"></div>
        <span className="text-xs swiss-mono text-swiss-gray-500">Extracting colors...</span>
      </div>
    );
  }

  if (colors.length === 0) {
    return (
      <div className="text-center py-4">
        <span className="text-xs swiss-mono text-swiss-gray-400">Could not extract colors from this image</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {colors.slice(0, 5).map((color, index) => (
        <div
          key={index}
          className="aspect-square border border-swiss-black cursor-pointer hover:scale-110 transition-transform duration-200"
          style={{ backgroundColor: color }}
          onClick={() => {
            navigator.clipboard.writeText(color);
            console.log('Copied color to clipboard:', color);
          }}
          title={`Copy ${color} to clipboard`}
        />
      ))}
    </div>
  );
}

// Helper function to get source name
function getSourceName(item: InspirationItem): string {
  const sourceUrl = (item as any).sourceUrl || item.source || '';
  
  if (!sourceUrl) return item.platform || 'Unknown';
  
  try {
    const url = new URL(sourceUrl);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes('arena') || hostname.includes('are.na')) return 'Arena';
    if (hostname.includes('instagram')) return 'Instagram';
    if (hostname.includes('behance')) return 'Behance';
    if (hostname.includes('dribbble')) return 'Dribbble';
    if (hostname.includes('pinterest')) return 'Pinterest';
    if (hostname.includes('tumblr')) return 'Tumblr';
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter/X';
    if (hostname.includes('vercel-storage')) return 'Direct Upload';
    
    return hostname.replace('www.', '').split('.')[0];
  } catch {
    return item.platform || 'Unknown';
  }
}

interface ImageModalProps {
  item: InspirationItem;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string) => void;
}

export function ImageModal({ item, isOpen, onClose, onSave }: ImageModalProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [sidePanel, setSidePanel] = useState(true);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Modal Container */}
      <div className="relative max-w-7xl max-h-[90vh] w-full flex bg-white border border-swiss-black shadow-2xl animate-fade-in">
        
        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center bg-swiss-gray-50 relative">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Close Button */}
          <button
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur border border-swiss-black flex items-center justify-center swiss-hover shadow-lg"
            onClick={onClose}
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Side Panel Toggle */}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur border border-swiss-black flex items-center justify-center swiss-hover shadow-lg"
            onClick={() => setSidePanel(!sidePanel)}
            title={sidePanel ? "Hide details" : "Show details"}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Side Panel */}
        <div className={cn(
          "transition-all duration-300 ease-out border-l border-swiss-black bg-white/95 backdrop-blur",
          sidePanel ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"
        )}>
          <div className="p-6 h-full overflow-y-auto">
            
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-xl swiss-title font-light leading-tight mb-2">
                {item.title}
              </h1>
              <div className="w-12 h-px bg-swiss-black"></div>
            </div>

            {/* Author */}
            <div className="mb-6">
              <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider mb-2">
                AUTHOR
              </h3>
              <AuthorInfo item={item} />
            </div>

            {/* Color Palette */}
            <div className="mb-6">
              <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider mb-3">
                COLOR PALETTE
              </h3>
              <ColorPaletteSection item={item} key={item.id} />
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs swiss-mono text-swiss-gray-600 tracking-wider mb-2">
                  TAGS
                </h3>
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 8).map((tag) => (
                    <span 
                      key={tag} 
                      className="text-xs swiss-mono px-2 py-1 border border-swiss-gray-300 text-swiss-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="mb-6 text-xs swiss-mono">
              <div className="mb-2">
                <span className="text-swiss-gray-500 block mb-1">CATEGORY</span>
                <span className="text-swiss-black">{item.category}</span>
              </div>
              <div className="mb-2">
                <span className="text-swiss-gray-500 block mb-1">SOURCE</span>
                <span className="text-swiss-black">{getSourceName(item)}</span>
              </div>
              {item.description && (
                <div>
                  <span className="text-swiss-gray-500 block mb-1">DESCRIPTION</span>
                  <span className="text-swiss-black text-sm leading-relaxed">{item.description}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 mt-auto">
              <button
                onClick={() => setShowSaveModal(true)}
                className="w-full h-10 border border-swiss-black bg-swiss-black text-swiss-white hover:bg-swiss-white hover:text-swiss-black flex items-center justify-center gap-2 transition-colors swiss-mono text-sm"
              >
                <ArrowUpRight className="w-4 h-4" />
                SAVE TO FOLDER
              </button>
              
              <button
                onClick={() => window.open(item.imageUrl, '_blank')}
                className="w-full h-10 border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white flex items-center justify-center gap-2 transition-colors swiss-mono text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                OPEN FULL SIZE
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Save to Folder Modal */}
      <SaveToFolderModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        contentId={item.id}
        contentTitle={item.title}
      />
    </div>
  );
}