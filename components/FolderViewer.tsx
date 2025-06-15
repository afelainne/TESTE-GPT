'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Search, MoreHorizontal, Heart, Download, Share2, Trash2, Grid, List, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { authManager } from '@/lib/auth';
import { kvUserStorage, UserFolder } from '@/lib/vercelKVStorage';
import { InspirationCard } from './InspirationCard';
import { PinterestExpansion } from './PinterestExpansion';

interface FolderViewerProps {
  folder: UserFolder;
  onBack: () => void;
  onFolderUpdate: () => void;
}

export function FolderViewer({ folder, onBack, onFolderUpdate }: FolderViewerProps) {
  const [folderImages, setFolderImages] = useState<any[]>([]);
  const [filteredImages, setFilteredImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { toast } = useToast();
  const currentUser = authManager.getCurrentUser();

  console.log('FolderViewer rendered for folder:', folder.name, 'with', folder.imageIds.length, 'images');

  useEffect(() => {
    loadFolderImages();
  }, [folder.id]);

  useEffect(() => {
    filterImages();
  }, [folderImages, searchQuery]);

  const loadFolderImages = async () => {
    setIsLoading(true);
    try {
      console.log('📁 Loading images for folder:', folder.name);
      
      // Get all user data to find images by ID
      const userData = await kvUserStorage['getUserData'](currentUser?.id || '');
      const allImages = [
        ...userData.uploads.map(img => ({ ...img, source: 'upload' })),
        ...userData.likes.map(like => ({ 
          id: like.imageId,
          imageUrl: like.imageUrl, 
          title: like.title,
          author: like.author,
          source: 'liked',
          likedAt: like.likedAt
        }))
      ];

      // Filter images that are in this folder
      const folderImages = allImages.filter(img => folder.imageIds.includes(img.id));
      
      console.log('📷 Found', folderImages.length, 'images in folder');
      setFolderImages(folderImages);
    } catch (error) {
      console.error('Error loading folder images:', error);
      toast({
        title: "Error",
        description: "Failed to load folder images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterImages = () => {
    if (!searchQuery.trim()) {
      setFilteredImages(folderImages);
      return;
    }

    const filtered = folderImages.filter(img => 
      img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredImages(filtered);
  };

  const handleRemoveFromFolder = async (imageId: string) => {
    if (!currentUser) return;

    try {
      await kvUserStorage.removeImageFromFolder(currentUser.id, folder.id, imageId);
      
      // Update local state
      setFolderImages(prev => prev.filter(img => img.id !== imageId));
      setFilteredImages(prev => prev.filter(img => img.id !== imageId));
      
      // Update parent
      onFolderUpdate();
      
      toast({
        title: "Removed from folder",
        description: "Image removed successfully",
      });
      
      console.log('🗑️ Removed image from folder:', imageId);
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFolder = async () => {
    if (!currentUser) return;

    try {
      await kvUserStorage.deleteFolder(currentUser.id, folder.id);
      
      toast({
        title: "Folder deleted",
        description: `"${folder.name}" has been deleted`,
      });
      
      console.log('🗑️ Deleted folder:', folder.name);
      onFolderUpdate();
      onBack();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
    }
  };

  const handleImageClick = (image: any) => {
    // Convert to InspirationItem format for PinterestExpansion
    const inspirationItem = {
      id: image.id,
      title: image.title || 'Untitled',
      imageUrl: image.imageUrl,
      description: image.description || '',
      category: 'saved',
      tags: [],
      author: image.author || 'Unknown',
      likes: 0,
      isLiked: image.source === 'liked',
      createdAt: image.uploadedAt || image.likedAt || new Date().toISOString(),
      colors: [],
      source: image.source || 'folder',
      platform: image.platform || 'unknown',
      visualStyle: {
        composition: 'unknown',
        colorTone: 'unknown', 
        shapes: 'unknown',
        mood: 'unknown'
      }
    };
    
    setSelectedImage(inspirationItem);
  };

  return (
    <>
      <div className="min-h-screen bg-swiss-white">
        {/* Header */}
        <div className="border-b border-swiss-black bg-swiss-white sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="border-swiss-black hover:bg-swiss-black hover:text-swiss-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl swiss-title">{folder.name}</h1>
                  <p className="text-sm swiss-mono text-swiss-gray-600">
                    {folder.imageIds.length} item{folder.imageIds.length !== 1 ? 's' : ''} • 
                    Created {new Date(folder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* View Mode Toggle */}
                <div className="flex border border-swiss-black">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-swiss-black text-swiss-white' : 'border-0'}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-swiss-black text-swiss-white' : 'border-0 border-l border-swiss-black'}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Folder Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-swiss-black hover:bg-red-50 hover:border-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-swiss-gray-500" />
              <Input
                placeholder="Search in this folder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-swiss-black focus:border-swiss-black"
              />
            </div>
          </div>

          {/* Folder Description */}
          {folder.description && (
            <div className="mb-8 p-4 bg-swiss-gray-50 border border-swiss-gray-300">
              <p className="swiss-body text-swiss-gray-700">{folder.description}</p>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-2 border-swiss-black border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="swiss-mono text-sm text-swiss-gray-600">Loading folder contents...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 border border-swiss-gray-300 mx-auto mb-6 flex items-center justify-center">
                <Eye className="w-8 h-8 text-swiss-gray-400" />
              </div>
              <h3 className="text-xl swiss-title font-light mb-3">
                {searchQuery ? 'No results found' : 'Folder is empty'}
              </h3>
              <p className="text-sm swiss-body text-swiss-gray-700 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Save images to this folder to see them here'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative border border-swiss-gray-300 hover:border-swiss-black transition-colors cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    >
                      <div className="aspect-square bg-swiss-gray-50 overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {/* Overlay Actions */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFolder(image.id);
                          }}
                          className="bg-white/90 border-swiss-black hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="p-3">
                        <h4 className="swiss-mono text-xs font-medium mb-1 truncate">
                          {image.title || 'Untitled'}
                        </h4>
                        <p className="text-xs text-swiss-gray-500 truncate">
                          By {image.author || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center space-x-4 p-4 border border-swiss-gray-300 hover:border-swiss-black transition-colors cursor-pointer"
                      onClick={() => handleImageClick(image)}
                    >
                      <div className="w-16 h-16 bg-swiss-gray-50 overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="swiss-mono text-sm font-medium mb-1">
                          {image.title || 'Untitled'}
                        </h4>
                        <p className="text-xs text-swiss-gray-500">
                          By {image.author || 'Unknown'}
                        </p>
                        {image.description && (
                          <p className="text-xs text-swiss-gray-400 mt-1 line-clamp-2">
                            {image.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs swiss-mono text-swiss-gray-400">
                          {image.source === 'liked' ? 'Liked' : 'Uploaded'} {new Date(image.uploadedAt || image.likedAt).toLocaleDateString()}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFolder(image.id);
                          }}
                          className="border-swiss-black hover:bg-red-50 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md border-swiss-black">
          <div className="p-6">
            <h3 className="text-lg swiss-title font-medium mb-4">Delete Folder</h3>
            <p className="swiss-body text-swiss-gray-700 mb-6">
              Are you sure you want to delete "{folder.name}"? This action cannot be undone. 
              The images will remain in your uploads and likes, but the folder organization will be lost.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-swiss-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteFolder}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                Delete Folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Expansion Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">{selectedImage.title}</h3>
              <button 
                onClick={() => setSelectedImage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.title}
              className="w-full h-auto max-h-96 object-contain"
            />
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Author:</strong> {selectedImage.author}</p>
              <p><strong>Description:</strong> {selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}