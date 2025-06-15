'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Check, Lock, Globe, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { authManager } from '@/lib/auth';
import { kvUserStorage, UserFolder } from '@/lib/vercelKVStorage';
import { LoginModal } from './LoginModal';

interface SaveToBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  imageUrl: string;
  title: string;
}

export function SaveToBlockModal({ isOpen, onClose, itemId, imageUrl, title }: SaveToBlockModalProps) {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [userFolders, setUserFolders] = useState<UserFolder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedFolders, setSavedFolders] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [newFolderData, setNewFolderData] = useState({
    name: '',
    description: ''
  });

  const { toast } = useToast();
  const currentUser = authManager.getCurrentUser();

  console.log('SaveToBlockModal rendered for item:', itemId, title);

  // Load user folders when modal opens
  useEffect(() => {
    if (isOpen) {
      if (!currentUser) {
        console.log('User not authenticated, showing login modal from SaveToBlockModal');
        setShowLoginModal(true);
        return;
      }
      loadUserFolders();
    }
  }, [isOpen, currentUser]);

  const loadUserFolders = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const folders = await kvUserStorage.getUserFolders(currentUser.id);
      setUserFolders(folders);
      console.log('📁 Loaded user folders:', folders.length);

      // Check which folders already contain this image
      const savedSet = new Set<string>();
      folders.forEach(folder => {
        if (folder.imageIds.includes(itemId)) {
          savedSet.add(folder.id);
        }
      });
      setSavedFolders(savedSet);
    } catch (error) {
      console.error('Error loading folders:', error);
      toast({
        title: "Error",
        description: "Failed to load your folders",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToFolder = async (folderId: string) => {
    if (!currentUser) return;

    const isCurrentlySaved = savedFolders.has(folderId);
    
    try {
      if (isCurrentlySaved) {
        // Remove from folder
        await kvUserStorage.removeImageFromFolder(currentUser.id, folderId, itemId);
        setSavedFolders(prev => {
          const newSet = new Set(prev);
          newSet.delete(folderId);
          return newSet;
        });

        toast({
          title: "Removed from folder",
          description: "Content removed from folder",
        });
        console.log('📤 Removed from folder:', folderId);
      } else {
        // Add to folder
        await kvUserStorage.addImageToFolder(currentUser.id, folderId, itemId);
        setSavedFolders(prev => new Set([...Array.from(prev), folderId]));

        toast({
          title: "Saved to folder",
          description: `"${title}" saved to folder successfully`,
        });
        console.log('📥 Added to folder:', folderId);
      }
    } catch (error) {
      console.error('Error toggling folder:', error);
      toast({
        title: "Error",
        description: "Failed to update folder",
        variant: "destructive",
      });
    }
  };

  const handleCreateNewFolder = async () => {
    if (!currentUser || !newFolderData.name.trim()) return;
    
    console.log('📁 Creating new folder and saving item:', newFolderData);
    
    try {
      setIsLoading(true);
      
      // Create new folder
      const newFolder = await kvUserStorage.createFolder(
        currentUser.id, 
        newFolderData.name.trim(), 
        newFolderData.description.trim() || undefined
      );
      
      // Add to folder list
      setUserFolders(prev => [newFolder, ...prev]);
      
      // Save item to new folder
      await kvUserStorage.addImageToFolder(currentUser.id, newFolder.id, itemId);
      setSavedFolders(prev => new Set([...Array.from(prev), newFolder.id]));
      
      console.log('✅ New folder created and item saved:', newFolder.name);
      
      toast({
        title: "Folder created",
        description: `"${newFolderData.name}" created and item saved successfully`,
      });
      
      // Reset form
      setIsCreatingNew(false);
      setNewFolderData({ name: '', description: '' });
    } catch (error) {
      console.error('❌ Error creating folder:', error);
      toast({
        title: "Error", 
        description: "Failed to create folder",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsCreatingNew(false);
    setNewFolderData({ name: '', description: '' });
    setSavedFolders(new Set());
    setShowLoginModal(false);
    onClose();
  };

  const handleLoginSuccess = () => {
    console.log('Login successful in SaveToBlockModal, loading folders');
    setShowLoginModal(false);
    // The useEffect will automatically load folders when currentUser is available
  };

  const handleDone = () => {
    // Navigate to dashboard after saving
    if (savedFolders.size > 0) {
      toast({
        title: "Content saved successfully",
        description: "Redirecting to your dashboard...",
      });
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
    handleClose();
  };

  return (
    <>
      <Dialog open={isOpen && !!currentUser && !showLoginModal} onOpenChange={handleClose}>
        <DialogContent className="max-w-md border-swiss-black">
          <DialogHeader>
            <DialogTitle className="swiss-title text-lg font-light flex items-center space-x-2">
              <Folder className="w-5 h-5" />
              <span>Save to Block</span>
            </DialogTitle>
            <p className="text-sm swiss-body text-swiss-gray-600">
              {title}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {!isCreatingNew ? (
              <>
                {/* Create New Folder Option */}
                <button
                  onClick={() => setIsCreatingNew(true)}
                  disabled={isLoading}
                  className="w-full p-4 border-2 border-dashed border-swiss-gray-300 hover:border-swiss-black transition-colors rounded flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span className="swiss-body font-medium">Create New Block</span>
                </button>

                {/* Existing Folders */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="text-center py-8 text-swiss-gray-500">
                      <div className="animate-spin w-6 h-6 border-2 border-swiss-black border-t-transparent rounded-full mx-auto mb-2"></div>
                      <p className="swiss-body text-sm">Loading your folders...</p>
                    </div>
                  ) : userFolders.length === 0 ? (
                    <div className="text-center py-8 text-swiss-gray-500">
                      <Folder className="w-12 h-12 mx-auto mb-2 text-swiss-gray-300" />
                      <p className="swiss-body text-sm">No folders yet</p>
                      <p className="text-xs swiss-mono text-swiss-gray-400">
                        Create your first folder above
                      </p>
                    </div>
                  ) : (
                    userFolders.map((folder) => {
                      const isSaved = savedFolders.has(folder.id);
                      
                      return (
                        <button
                          key={folder.id}
                          onClick={() => handleSaveToFolder(folder.id)}
                          disabled={isLoading}
                          className={`w-full p-3 border transition-colors rounded flex items-center space-x-3 ${
                            isSaved 
                              ? 'border-swiss-black bg-swiss-black text-swiss-white' 
                              : 'border-swiss-gray-300 hover:border-swiss-black'
                          }`}
                        >
                          <div className="w-12 h-12 border border-current rounded flex items-center justify-center">
                            <Folder className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2">
                              <h4 className="swiss-body font-medium">{folder.name}</h4>
                              <Globe className="w-3 h-3" />
                            </div>
                            <p className={`text-xs swiss-mono ${
                              isSaved ? 'text-swiss-gray-300' : 'text-swiss-gray-600'
                            }`}>
                              {folder.imageIds.length} item{folder.imageIds.length !== 1 ? 's' : ''}
                            </p>
                          </div>

                          {isSaved && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              /* Create New Folder Form */
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName" className="swiss-body font-medium">
                    Folder Name *
                  </Label>
                  <Input
                    id="folderName"
                    placeholder="My awesome collection"
                    value={newFolderData.name}
                    onChange={(e) => setNewFolderData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 border-swiss-black focus:border-swiss-black"
                  />
                </div>

                <div>
                  <Label htmlFor="folderDescription" className="swiss-body font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="folderDescription"
                    placeholder="Describe this collection..."
                    value={newFolderData.description}
                    onChange={(e) => setNewFolderData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 border-swiss-black focus:border-swiss-black"
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingNew(false)}
                    disabled={isLoading}
                    className="flex-1 border-swiss-black"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateNewFolder}
                    disabled={!newFolderData.name.trim() || isLoading}
                    className="flex-1 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Create & Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!isCreatingNew && (
            <div className="pt-4 border-t border-swiss-gray-200 flex space-x-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 border-swiss-black"
              >
                Cancel
              </Button>
              {savedFolders.size > 0 && (
                <Button
                  onClick={handleDone}
                  disabled={isLoading}
                  className="flex-1 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800"
                >
                  Done & Go to Dashboard
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Modal for SaveToBlockModal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          onClose(); // Also close the parent modal
        }}
        onLoginSuccess={handleLoginSuccess}
        title="Sign in to save to block"
        message="Please sign in to save content to your blocks"
      />
    </>
  );
}