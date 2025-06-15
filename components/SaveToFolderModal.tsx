"use client";

import { useState, useEffect } from 'react';
import { Check, Plus, Folder } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authManager } from '@/lib/auth';
import { kvUserStorage, UserFolder } from '@/lib/vercelKVStorage';
import { LoginModal } from './LoginModal';

interface SaveToFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentTitle: string;
}

export function SaveToFolderModal({ isOpen, onClose, contentId, contentTitle }: SaveToFolderModalProps) {
  const [folders, setFolders] = useState<UserFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [savedFolders, setSavedFolders] = useState<Set<string>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { toast } = useToast();

  const currentUser = authManager.getCurrentUser();

  useEffect(() => {
    if (!isOpen) return;
    
    if (currentUser) {
      loadFolders();
    } else {
      console.log('User not authenticated, showing login modal from SaveToFolderModal');
      setShowLoginModal(true);
    }
  }, [isOpen, currentUser]); // Fixed dependency

  const loadFolders = async () => {
    if (!currentUser) return;

    try {
      const userFolders = await kvUserStorage.getUserFolders(currentUser.id);
      setFolders(userFolders);
      console.log('📁 Loaded user folders:', userFolders.length);

      // Check which folders already contain this content
      const savedSet = new Set<string>();
      userFolders.forEach(folder => {
        if (folder.imageIds.includes(contentId)) {
          savedSet.add(folder.id);
        }
      });
      setSavedFolders(savedSet);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const handleCreateFolder = async () => {
    if (!currentUser || !newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const newFolder = await kvUserStorage.createFolder(currentUser.id, newFolderName.trim());
      setFolders(prev => [...prev, newFolder]);
      setNewFolderName('');

      toast({
        title: "Folder created",
        description: `Folder "${newFolderName}" created successfully`,
      });
      console.log('📁 Created new folder:', newFolder.name);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleToggleFolder = async (folderId: string) => {
    if (!currentUser) return;

    const isCurrentlySaved = savedFolders.has(folderId);
    
    try {
      if (isCurrentlySaved) {
        // Remove from folder
        await kvUserStorage.removeImageFromFolder(currentUser.id, folderId, contentId);
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
        await kvUserStorage.addImageToFolder(currentUser.id, folderId, contentId);
        setSavedFolders(prev => new Set([...Array.from(prev), folderId]));

        toast({
          title: "Saved to folder",
          description: "Content saved to folder",
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

  const handleClose = () => {
    setNewFolderName('');
    setSavedFolders(new Set());
    setShowLoginModal(false);
    onClose();
  };

  const handleLoginSuccess = () => {
    console.log('Login successful in SaveToFolderModal, loading folders');
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
      <DialogContent className="border-swiss-black max-w-md">
        <DialogHeader>
          <DialogTitle className="swiss-title font-light flex items-center space-x-2">
            <Folder className="w-5 h-5" />
            <span>Save to Folder</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="swiss-body text-sm text-swiss-gray-600">
              Save "{contentTitle}" to your folders
            </p>
          </div>

          {/* Create New Folder */}
          <div className="space-y-3">
            <Label className="swiss-body text-sm font-medium">Create New Folder</Label>
            <div className="flex space-x-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="border-swiss-black"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim() || isCreatingFolder}
                size="sm"
                className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Existing Folders */}
          <div className="space-y-3">
            <Label className="swiss-body text-sm font-medium">
              Your Folders ({folders.length})
            </Label>
            
            {folders.length === 0 ? (
              <div className="text-center py-8 text-swiss-gray-500">
                <Folder className="w-12 h-12 mx-auto mb-2 text-swiss-gray-300" />
                <p className="swiss-body text-sm">No folders yet</p>
                <p className="text-xs swiss-mono text-swiss-gray-400">
                  Create your first folder above
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {folders.map((folder) => {
                  const isSaved = savedFolders.has(folder.id);
                  
                  return (
                    <button
                      key={folder.id}
                      onClick={() => handleToggleFolder(folder.id)}
                      className={`w-full flex items-center justify-between p-3 border transition-colors ${
                        isSaved 
                          ? 'border-swiss-black bg-swiss-black text-swiss-white' 
                          : 'border-swiss-gray-300 hover:border-swiss-black'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Folder className="w-4 h-4" />
                        <div className="text-left">
                          <p className="swiss-body text-sm font-medium">{folder.name}</p>
                          <p className={`text-xs swiss-mono ${
                            isSaved ? 'text-swiss-gray-300' : 'text-swiss-gray-500'
                          }`}>
                            {folder.imageIds.length} items
                          </p>
                        </div>
                      </div>
                      
                      {isSaved && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-4 border-t border-swiss-gray-200">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-swiss-black swiss-mono"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDone}
              className="flex-1 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 swiss-mono"
              disabled={savedFolders.size === 0}
            >
              Done & Go to Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Login Modal for SaveToFolderModal */}
    <LoginModal
      isOpen={showLoginModal}
      onClose={() => {
        setShowLoginModal(false);
        onClose(); // Also close the parent modal
      }}
      onLoginSuccess={handleLoginSuccess}
      title="Sign in to save to folder"
      message="Please sign in to save content to your folders"
    />
    </>
  );
}