"use client";

import { useState, useEffect } from 'react';
import { ArrowUpRight, Heart } from 'lucide-react';
import { InspirationItem } from '@/types/inspiration';
import { cn } from '@/lib/utils';
import { useColorExtraction } from '@/lib/colorExtractor';
import { ProgressiveImage } from './ProgressiveImage';
import { SaveToFolderModal } from './SaveToFolderModal';
import { SaveToBlockModal } from './SaveToBlockModal';
import { LoginModal } from './LoginModal';

import { ImageClassificationBadge } from './ImageClassificationBadge';
import { authManager } from '@/lib/auth';
import { kvUserStorage } from '@/lib/vercelKVStorage';
import { useToast } from '@/hooks/use-toast';

interface InspirationCardProps {
  item: InspirationItem;
  onSave: (id: string) => void;
  onView: (item: InspirationItem) => void;
  interactiveMode?: boolean;
  hoverZoom?: number;
}

export function InspirationCard({ item, onSave, onView, interactiveMode = false, hoverZoom = 1.1 }: InspirationCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginAction, setLoginAction] = useState<'like' | 'save' | 'folder'>('like');

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const { extractAndUpdateColors } = useColorExtraction();
  const { toast } = useToast();

  // Load like status
  useEffect(() => {
    const loadLikeStatus = async () => {
      const currentUser = authManager.getCurrentUser();
      if (currentUser) {
        const liked = await kvUserStorage.isImageLiked(currentUser.id, item.id);
        setIsLiked(liked);
        console.log('✅ Like status loaded for', item.id, ':', liked);
      }
    };
    
    loadLikeStatus();
  }, [item.id]);

  console.log('InspirationCard rendered for item:', item.id);

  // Extract colors when image loads using real color extraction
  useEffect(() => {
    if (isLoaded && item.imageUrl) {
      console.log('🎨 Starting REAL color extraction for:', item.id);
      extractAndUpdateColors(item.imageUrl).then(colors => {
        console.log('✅ REAL colors extracted for', item.id, ':', colors);
        setExtractedColors(colors);
      }).catch(error => {
        console.error('❌ Color extraction failed for', item.id, ':', error);
      });
    }
  }, [isLoaded, item.imageUrl, extractAndUpdateColors]);

  // Use extracted colors if available, otherwise fallback to manual colors
  const displayColors = extractedColors.length > 0 ? extractedColors : (item.colors || ['#666666', '#999999', '#CCCCCC']);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!authManager.isAuthenticated()) {
      console.log('User not authenticated, showing login modal for save action');
      setLoginAction('save');
      setShowLoginModal(true);
      return;
    }

    // Show block modal (main save functionality)
    setShowBlockModal(true);
  };

  const handleFolderSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authManager.isAuthenticated()) {
      console.log('User not authenticated, showing login modal for folder save action');
      setLoginAction('folder');
      setShowLoginModal(true);
      return;
    }

    setShowSaveModal(true);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🖼️ Image clicked, expanding in-place for:', item.title);
    onView(item);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authManager.isAuthenticated()) {
      console.log('User not authenticated, showing login modal for like action');
      setLoginAction('like');
      setShowLoginModal(true);
      return;
    }

    const currentUser = authManager.getCurrentUser();
    if (!currentUser) return;

    try {
      if (isLiked) {
        await kvUserStorage.unlikeImage(currentUser.id, item.id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
        toast({
          title: "Removed from likes",
          description: "Content unliked successfully",
        });
        console.log('💔 Image unliked:', item.id);
      } else {
        await kvUserStorage.likeImage(currentUser.id, item.id, item.imageUrl, item.title, item.author || 'Unknown');
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        toast({
          title: "Added to likes",
          description: "Content liked successfully",
        });
        console.log('❤️ Image liked:', item.id);
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleLoginSuccess = () => {
    console.log('Login successful, executing action:', loginAction);
    
    // Execute the action that triggered the login modal
    switch (loginAction) {
      case 'like':
        // Trigger like action after successful login
        setTimeout(() => {
          const likeEvent = new MouseEvent('click', { bubbles: true });
          handleLikeClick(likeEvent as any);
        }, 100);
        break;
      case 'save':
        setShowBlockModal(true);
        break;
      case 'folder':
        setShowSaveModal(true);
        break;
    }
  };

  return (
    <>
      <div
        className="group cursor-pointer animate-fade-in"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleImageClick}
      >
        {/* Image Container with Swiss Grid */}
        <div className={`relative bg-swiss-white border border-swiss-black overflow-hidden transition-transform duration-300 ${
          interactiveMode ? 'hover:z-10' : ''
        }`}
        style={{
          transform: interactiveMode && isHovered ? `scale(${hoverZoom})` : 'scale(1)',
          transformOrigin: 'center'
        }}>
          {!isLoaded && (
            <div className="absolute inset-0 bg-swiss-gray-100" />
          )}
          
          <ProgressiveImage
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-auto cursor-pointer"
            onClick={handleImageClick}
          />
          
          {/* Action Buttons - Like and Save */}
          <div className="absolute top-3 right-3 flex gap-2">
            {/* Like Button */}
            <button
              className={cn(
                "w-8 h-8 border border-swiss-black flex items-center justify-center transition-all duration-200 group",
                isLiked 
                  ? "bg-red-500 text-white border-red-500 hover:bg-red-600" 
                  : "bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white"
              )}
              onClick={handleLikeClick}
              title={isLiked ? "Unlike" : "Like"}
            >
              <Heart className={cn("w-3 h-3", isLiked && "fill-current")} />
            </button>

            {/* Save Button - Arrow + Square for folder save */}
            <button
              className="w-8 h-8 border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white flex items-center justify-center transition-all duration-200 group"
              onClick={handleSaveClick}
              title="Save to block"
            >
              <div className="relative">
                <ArrowUpRight className="w-3 h-3" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border border-current bg-current"></div>
              </div>
            </button>
          </div>

          {/* Likes counter - bottom left */}
          {likesCount > 0 && (
            <div className="absolute bottom-3 left-3">
              <div className="bg-swiss-white border border-swiss-black px-2 py-1 text-xs swiss-mono">
                {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </div>
            </div>
          )}

          {/* Color Palette Display - bottom right */}
          {displayColors && displayColors.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className="flex gap-1 p-1 bg-swiss-white border border-swiss-black shadow-sm">
                {displayColors.slice(0, 4).map((color, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 border border-gray-300 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Save to Folder Modal */}
      <SaveToFolderModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        contentId={item.id}
        contentTitle={item.title}
      />

      {/* Save to Block Modal */}
      <SaveToBlockModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        itemId={item.id}
        imageUrl={item.imageUrl}
        title={item.title}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        title={
          loginAction === 'like' ? "Sign in to like" :
          loginAction === 'save' ? "Sign in to save" :
          "Sign in to save to folder"
        }
        message={
          loginAction === 'like' ? "Please sign in to like this content" :
          loginAction === 'save' ? "Please sign in to save this content" :
          "Please sign in to save to your folders"
        }
      />
    </>
  );
}