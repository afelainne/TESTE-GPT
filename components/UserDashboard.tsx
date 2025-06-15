"use client";

import { useState, useEffect } from 'react';
import { Upload, Heart, Folder, Link, Home, User, Plus, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authManager } from '@/lib/auth';
import { userStorage, UserImage, UserFolder, UserLike } from '@/lib/vercelKVStorage';

export function UserDashboard() {
  const [activeTab, setActiveTab] = useState('upload');
  const [currentUser, setCurrentUser] = useState(authManager.getCurrentUser());
  const [userUploads, setUserUploads] = useState<UserImage[]>([]);
  const [userFolders, setUserFolders] = useState<UserFolder[]>([]);
  const [userLikes, setUserLikes] = useState<UserLike[]>([]);

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    if (!currentUser) return;
    
    console.log('🔄 Loading user data for:', currentUser.id);
    
    try {
      // Force sync data from enhanced localStorage
      const { kvUserStorage } = await import('@/lib/vercelKVStorage');
      await kvUserStorage.syncUserData(currentUser.id);
      
      // Load data
      const uploads = await userStorage.getUserUploads(currentUser.id);
      const folders = await userStorage.getUserFolders(currentUser.id);
      const likes = await userStorage.getUserLikes(currentUser.id);
      
      setUserUploads(uploads);
      setUserFolders(folders);
      setUserLikes(likes);
      
      console.log('✅ User data loaded successfully:', {
        uploads: uploads.length,
        folders: folders.length,
        likes: likes.length
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const refreshUserData = () => {
    loadUserData();
  };

  const handleLogout = () => {
    authManager.logout();
    window.location.href = '/';
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-swiss-white">
      {/* Header */}
      <div className="border-b border-swiss-black bg-swiss-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={goHome}
                className="flex items-center space-x-2 hover:bg-swiss-gray-50 p-2 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="swiss-title text-lg">HOME</span>
              </button>
              <div className="w-px h-6 bg-swiss-gray-300"></div>
              <h1 className="text-xl swiss-title">My Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm swiss-mono text-swiss-gray-600">
                <User className="w-4 h-4" />
                <span>{currentUser?.name || 'User'}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm swiss-mono text-swiss-gray-500 hover:text-swiss-black"
              >
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-swiss-black">
              <div className="p-4 border-b border-swiss-black">
                <h2 className="swiss-mono text-sm font-medium">ACTIONS</h2>
              </div>
              <nav className="p-2">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={cn(
                    "w-full text-left p-3 text-sm swiss-mono transition-colors",
                    activeTab === 'upload' 
                      ? "bg-swiss-black text-swiss-white" 
                      : "hover:bg-swiss-gray-50"
                  )}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  UPLOAD IMAGES
                </button>
                <button
                  onClick={() => setActiveTab('folders')}
                  className={cn(
                    "w-full text-left p-3 text-sm swiss-mono transition-colors",
                    activeTab === 'folders' 
                      ? "bg-swiss-black text-swiss-white" 
                      : "hover:bg-swiss-gray-50"
                  )}
                >
                  <Folder className="w-4 h-4 inline mr-2" />
                  MY FOLDERS
                </button>
                <button
                  onClick={() => setActiveTab('likes')}
                  className={cn(
                    "w-full text-left p-3 text-sm swiss-mono transition-colors",
                    activeTab === 'likes' 
                      ? "bg-swiss-black text-swiss-white" 
                      : "hover:bg-swiss-gray-50"
                  )}
                >
                  <Heart className="w-4 h-4 inline mr-2" />
                  LIKED IMAGES
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'upload' && (
              <div className="space-y-6">
                <div className="bg-white border border-swiss-black">
                  <div className="p-4 border-b border-swiss-black">
                    <h2 className="text-lg swiss-title">Upload Feature Removed</h2>
                    <p className="text-sm text-swiss-gray-600 mt-1">Upload functionality has been moved to admin panel</p>
                  </div>
                  <div className="p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border border-swiss-gray-300 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">📁</span>
                      </div>
                      <h3 className="text-xl swiss-title font-light mb-3">Upload Feature Disabled</h3>
                      <p className="text-sm swiss-body text-swiss-gray-700 mb-6">
                        Image uploads are now managed through the admin panel. Please contact an administrator to upload new content.
                      </p>
                      <p className="text-xs text-swiss-gray-500">
                        You can still view and organize images from the main gallery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'folders' && <FoldersSection currentUser={currentUser} folders={userFolders} onFolderChange={refreshUserData} />}
            {activeTab === 'likes' && <LikesSection currentUser={currentUser} likes={userLikes} onLikeChange={refreshUserData} />}
          </div>
        </div>
      </div>
    </div>
  );
}

interface UploadSectionProps {
  currentUser: any;
  onUploadComplete: () => void;
  uploads: UserImage[];
}

function UploadSection({ currentUser, onUploadComplete, uploads }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('local');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(handleFileUpload);
  };

  const handleFileUpload = async (file: File, metadata?: any) => {
    if (!currentUser) return;
    
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Get metadata from input fields
      const titleField = document.getElementById('local-title') as HTMLInputElement;
      const authorField = document.getElementById('local-author') as HTMLInputElement;
      const descriptionField = document.getElementById('local-description') as HTMLInputElement;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', titleField?.value || metadata?.title || file.name);
      formData.append('author', authorField?.value || metadata?.author || currentUser.name || 'Unknown');
      formData.append('description', descriptionField?.value || metadata?.description || '');
      formData.append('platform', 'local');
      formData.append('userId', currentUser.id);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        userStorage.saveUserUpload(currentUser.id, result.image);
        setUploadStatus('success');
        
        // Clear input fields
        if (titleField) titleField.value = '';
        if (authorField) authorField.value = currentUser.name || '';
        if (descriptionField) descriptionField.value = '';
        
        onUploadComplete();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const url = formData.get('url') as string;
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const description = formData.get('description') as string;
    const platform = formData.get('platform') as string;

    if (!url) return;

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const response = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          title: title || 'Untitled',
          author: author || currentUser.name || 'Unknown',
          description: description || '',
          platform,
          userId: currentUser.id
        })
      });

      const result = await response.json();

      if (result.success) {
        userStorage.saveUserUpload(currentUser.id, result.image);
        setUploadStatus('success');
        (e.target as HTMLFormElement).reset();
        onUploadComplete();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('URL add failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-swiss-black">
        <div className="p-4 border-b border-swiss-black">
          <h2 className="text-lg swiss-title">Upload Images</h2>
          <p className="text-sm text-swiss-gray-600 mt-1">Add images to your collection</p>
        </div>
        
        <div className="p-6">
          {/* Upload Method Tabs */}
          <div className="flex border border-swiss-black mb-6">
            <button
              onClick={() => setUploadMethod('local')}
              className={cn(
                "flex-1 p-3 text-sm swiss-mono transition-colors",
                uploadMethod === 'local'
                  ? "bg-swiss-black text-swiss-white"
                  : "bg-white text-swiss-black hover:bg-swiss-gray-50"
              )}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              LOCAL FILES
            </button>
            <button
              onClick={() => setUploadMethod('url')}
              className={cn(
                "flex-1 p-3 text-sm swiss-mono transition-colors border-l border-swiss-black",
                uploadMethod === 'url'
                  ? "bg-swiss-black text-swiss-white"
                  : "bg-white text-swiss-black hover:bg-swiss-gray-50"
              )}
            >
              <Link className="w-4 h-4 inline mr-2" />
              FROM URL
            </button>
            <button
              onClick={() => setUploadMethod('arena')}
              className={cn(
                "flex-1 p-3 text-sm swiss-mono transition-colors border-l border-swiss-black",
                uploadMethod === 'arena'
                  ? "bg-swiss-black text-swiss-white"
                  : "bg-white text-swiss-black hover:bg-swiss-gray-50"
              )}
            >
              <div className="w-4 h-4 inline mr-2 bg-current"></div>
              ARE.NA
            </button>
          </div>

          {/* Local Upload */}
          {uploadMethod === 'local' && (
            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed p-8 text-center transition-colors",
                  dragActive 
                    ? "border-swiss-black bg-swiss-gray-50" 
                    : "border-swiss-gray-300 hover:border-swiss-black"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-swiss-gray-400" />
                <p className="text-sm swiss-mono mb-2">DROP IMAGES HERE</p>
                <p className="text-xs text-swiss-gray-500 mb-4">or click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => handleFileUpload(file));
                  }}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-2 border border-swiss-black bg-swiss-white hover:bg-swiss-black hover:text-swiss-white transition-colors swiss-mono text-sm cursor-pointer"
                >
                  CHOOSE FILES
                </label>
              </div>

              {/* Metadata Form for Local Files */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm swiss-mono mb-2">TITLE (OPTIONAL)</label>
                  <input
                    type="text"
                    placeholder="Image title"
                    className="w-full p-3 border border-swiss-black swiss-mono text-sm"
                    id="local-title"
                  />
                </div>
                <div>
                  <label className="block text-sm swiss-mono mb-2">AUTHOR</label>
                  <input
                    type="text"
                    placeholder="Artist/Creator name"
                    defaultValue={currentUser?.name || ''}
                    className="w-full p-3 border border-swiss-black swiss-mono text-sm"
                    id="local-author"
                  />
                </div>
                <div>
                  <label className="block text-sm swiss-mono mb-2">DESCRIPTION</label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    className="w-full p-3 border border-swiss-black swiss-mono text-sm"
                    id="local-description"
                  />
                </div>
              </div>
            </div>
          )}

          {/* URL Upload */}
          {uploadMethod === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-sm swiss-mono mb-2">IMAGE URL</label>
                <input
                  type="url"
                  name="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border border-swiss-black swiss-mono text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm swiss-mono mb-2">TITLE</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Image title"
                    className="w-full p-3 border border-swiss-black swiss-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm swiss-mono mb-2">AUTHOR</label>
                  <input
                    type="text"
                    name="author"
                    placeholder="Artist/Creator name"
                    defaultValue={currentUser?.name || ''}
                    className="w-full p-3 border border-swiss-black swiss-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm swiss-mono mb-2">DESCRIPTION</label>
                <textarea
                  name="description"
                  placeholder="Brief description or context"
                  rows={3}
                  className="w-full p-3 border border-swiss-black swiss-mono text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm swiss-mono mb-2">SOURCE PLATFORM</label>
                <select name="platform" className="w-full p-3 border border-swiss-black swiss-mono text-sm">
                  <option value="behance">Behance</option>
                  <option value="pinterest">Pinterest</option>
                  <option value="dribbble">Dribbble</option>
                  <option value="unsplash">Unsplash</option>
                  <option value="are.na">Are.na</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full p-3 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-colors swiss-mono text-sm disabled:opacity-50"
              >
                {isUploading ? 'ADDING...' : 'ADD FROM URL'}
              </button>
            </form>
          )}

          {/* Arena Upload */}
          {uploadMethod === 'arena' && (
            <div className="space-y-4">
              <div className="p-4 bg-swiss-gray-50 border border-swiss-black">
                <h3 className="swiss-mono text-sm font-medium mb-2">CONNECT TO ARE.NA</h3>
                <p className="text-xs text-swiss-gray-600 mb-4">
                  Authenticate with your Are.na account to import channels and blocks
                </p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/arena-auth-url');
                      const data = await response.json();
                      if (data.authUrl) {
                        window.location.href = data.authUrl;
                      }
                    } catch (error) {
                      console.error('Failed to get Arena auth URL:', error);
                    }
                  }}
                  className="w-full p-3 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-colors swiss-mono text-sm"
                >
                  CONNECT ARE.NA ACCOUNT
                </button>
              </div>
              
              <div>
                <label className="block text-sm swiss-mono mb-2">ARE.NA CHANNEL URL</label>
                <input
                  type="url"
                  placeholder="https://www.are.na/username/channel-name"
                  className="w-full p-3 border border-swiss-black swiss-mono text-sm"
                />
              </div>
              <button className="w-full p-3 bg-swiss-black text-swiss-white hover:bg-swiss-gray-800 transition-colors swiss-mono text-sm">
                IMPORT FROM ARE.NA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FoldersSectionProps {
  currentUser: any;
  folders: UserFolder[];
  onFolderChange: () => void;
}

function FoldersSection({ currentUser, folders, onFolderChange }: FoldersSectionProps) {
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<UserFolder | null>(null);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newFolderName.trim()) return;

    await userStorage.createFolder(currentUser.id, newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderForm(false);
    onFolderChange();
  };

  const handleFolderClick = (folder: UserFolder) => {
    console.log('📁 Opening folder:', folder.name);
    setSelectedFolder(folder);
  };

  // If a folder is selected, show the FolderViewer
  if (selectedFolder) {
    const FolderViewer = require('./FolderViewer').FolderViewer;
    return (
      <FolderViewer
        folder={selectedFolder}
        onBack={() => setSelectedFolder(null)}
        onFolderUpdate={onFolderChange}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-swiss-black">
        <div className="p-4 border-b border-swiss-black flex items-center justify-between">
          <div>
            <h2 className="text-lg swiss-title">My Folders</h2>
            <p className="text-sm text-swiss-gray-600 mt-1">Organize your saved images ({folders.length} folders)</p>
          </div>
          <button 
            onClick={() => setShowNewFolderForm(true)}
            className="px-4 py-2 border border-swiss-black bg-swiss-white hover:bg-swiss-black hover:text-swiss-white transition-colors swiss-mono text-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            NEW FOLDER
          </button>
        </div>
        
        <div className="p-6">
          {/* New Folder Form */}
          {showNewFolderForm && (
            <div className="mb-6 p-4 border border-swiss-black bg-swiss-gray-50">
              <form onSubmit={handleCreateFolder} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name"
                  className="flex-1 p-2 border border-swiss-black swiss-mono text-sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-swiss-black text-swiss-white swiss-mono text-sm hover:bg-swiss-gray-800"
                >
                  CREATE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFolderForm(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 border border-swiss-black swiss-mono text-sm hover:bg-swiss-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div 
                key={folder.id} 
                className="border border-swiss-gray-300 hover:border-swiss-black transition-colors cursor-pointer group"
                onClick={() => handleFolderClick(folder)}
              >
                <div className="aspect-video bg-swiss-gray-50 flex items-center justify-center group-hover:bg-swiss-gray-100 transition-colors">
                  <Folder className="w-12 h-12 text-swiss-gray-400 group-hover:text-swiss-gray-600 transition-colors" />
                </div>
                <div className="p-4">
                  <h3 className="swiss-mono text-sm font-medium mb-1 group-hover:text-swiss-black transition-colors">
                    {folder.name}
                  </h3>
                  <p className="text-xs text-swiss-gray-500">{folder.imageIds.length} images</p>
                  <p className="text-xs text-swiss-gray-400">Created {new Date(folder.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs swiss-mono text-swiss-gray-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to view →
                  </p>
                </div>
              </div>
            ))}
          </div>

          {folders.length === 0 && (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto text-swiss-gray-300 mb-4" />
              <p className="text-swiss-gray-500 swiss-mono text-sm">No folders yet</p>
              <p className="text-xs text-swiss-gray-400 mt-1">Create your first folder to organize images</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface LikesSectionProps {
  currentUser: any;
  likes: UserLike[];
  onLikeChange: () => void;
}

function LikesSection({ currentUser, likes, onLikeChange }: LikesSectionProps) {
  const handleUnlike = async (imageId: string) => {
    if (!currentUser) return;
    await userStorage.unlikeImage(currentUser.id, imageId);
    onLikeChange();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-swiss-black">
        <div className="p-4 border-b border-swiss-black">
          <h2 className="text-lg swiss-title">Liked Images</h2>
          <p className="text-sm text-swiss-gray-600 mt-1">Images you've hearted ({likes.length} likes)</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {likes.map((like) => (
              <div key={like.id} className="border border-swiss-gray-300 hover:border-swiss-black transition-colors">
                <div className="aspect-square bg-swiss-gray-50 overflow-hidden">
                  <img
                    src={like.imageUrl}
                    alt={like.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="swiss-mono text-sm font-medium mb-1">{like.title}</h3>
                  <p className="text-xs text-swiss-gray-500">By {like.author}</p>
                  <p className="text-xs text-swiss-gray-400">Liked {new Date(like.likedAt).toLocaleDateString()}</p>
                  <div className="flex items-center justify-between mt-2">
                    <button 
                      onClick={() => handleUnlike(like.imageId)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement save to folder functionality
                        console.log('Save to folder:', like.imageId);
                      }}
                      className="text-xs swiss-mono text-swiss-gray-500 hover:text-swiss-black"
                    >
                      SAVE TO FOLDER
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {likes.length === 0 && (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-swiss-gray-300 mb-4" />
              <p className="text-swiss-gray-500 swiss-mono text-sm">No liked images yet</p>
              <p className="text-xs text-swiss-gray-400 mt-1">Heart images to save them here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}