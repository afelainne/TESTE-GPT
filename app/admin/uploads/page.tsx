'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authManager } from '@/lib/auth';
import { Edit3, Eye, Trash2, Save, X } from 'lucide-react';

interface ClipVectorItem {
  id: string;
  image_url: string;
  source_url?: string;
  title?: string;
  author_name?: string;
  author_profile_url?: string;
  metadata?: any;
  created_at: string;
}

export default function UploadsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [items, setItems] = useState<ClipVectorItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClipVectorItem>>({});
  const [selectedItem, setSelectedItem] = useState<ClipVectorItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imagesPerRow, setImagesPerRow] = useState(3);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check admin authorization
    authManager.loadFromStorage();
    
    if (!authManager.isAuthenticated() || !authManager.isAdmin()) {
      router.push('/admin');
      return;
    }
    
    setIsAuthorized(true);
    loadItems();
  }, [router]);

  const loadItems = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      console.log('📡 Loading clip_vectors items...');
      
      const response = await fetch('/api/clip-vectors?format=full', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.items) {
          setItems(data.items);
          console.log('✅ Loaded', data.items.length, 'clip_vectors items');
        }
      }
    } catch (error) {
      console.error('❌ Error loading items:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const refreshHomeImages = async () => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing home images...');
      
      // Force refresh home page data by clearing cache
      const response = await fetch('/api/clip-vectors?cursor=0&refresh=true', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        console.log('✅ Home images refreshed successfully');
        // Show success notification
        window.location.href = '/';
      }
    } catch (error) {
      console.error('❌ Error refreshing home images:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEdit = (item: ClipVectorItem) => {
    setEditingItem(item.id);
    setEditForm({
      title: item.title || '',
      author_name: item.author_name || '',
      author_profile_url: item.author_profile_url || '',
      source_url: item.source_url || ''
    });
  };

  const handleSave = async (itemId: string) => {
    try {
      const response = await fetch(`/api/clip-vectors/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        console.log('✅ Item updated successfully');
        setEditingItem(null);
        loadItems(true); // Reload items with refresh indicator
      }
    } catch (error) {
      console.error('❌ Error updating item:', error);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const response = await fetch(`/api/clip-vectors/${itemId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('✅ Item deleted successfully');
        loadItems(true); // Reload items with refresh indicator
      }
    } catch (error) {
      console.error('❌ Error deleting item:', error);
    }
  };

  const getSourceName = (sourceUrl?: string): string => {
    if (!sourceUrl) return 'Unknown';
    
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
      return 'Unknown';
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(item => 
    !searchQuery || 
    (item.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.author_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.image_url?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Dynamic grid classes based on images per row
  const getGridCols = () => {
    switch (imagesPerRow) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      case 5: return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
      case 6: return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6';
      case 7: return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7';
      case 8: return 'grid-cols-2 md:grid-cols-4 lg:grid-cols-8';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-swiss-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border border-swiss-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-swiss-gray-600 font-mono text-sm">Loading uploads...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-swiss-gray-50">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl swiss-title mb-2">Upload Control</h1>
            <p className="text-swiss-gray-600">Manage all clip_vectors entries</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={refreshHomeImages}
              disabled={isRefreshing}
              className="px-4 py-2 border border-swiss-black bg-green-50 hover:bg-green-100 text-green-800 transition-colors swiss-mono text-sm"
            >
              {isRefreshing ? 'REFRESHING...' : 'REFRESH HOME'}
            </button>
            <button 
              onClick={() => loadItems(true)}
              disabled={isRefreshing}
              className="px-4 py-2 border border-swiss-black bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors swiss-mono text-sm"
            >
              {isRefreshing ? 'LOADING...' : 'RELOAD'}
            </button>
            <button 
              onClick={() => router.push('/admin')}
              className="px-4 py-2 border border-swiss-black bg-swiss-white hover:bg-swiss-black hover:text-swiss-white transition-colors swiss-mono text-sm"
            >
              BACK TO ADMIN
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white border border-swiss-black mb-6">
          <div className="p-6 border-b border-swiss-black">
            <h2 className="text-lg swiss-title mb-4">Controls</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-mono mb-2">SEARCH BY NAME OR URL</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to filter uploads..."
                  className="w-full px-3 py-2 border border-swiss-gray-300 font-mono text-sm"
                />
              </div>
              
              {/* Images per row slider */}
              <div>
                <label className="block text-sm font-mono mb-2">IMAGES PER ROW: {imagesPerRow}</label>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono">1</span>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={imagesPerRow}
                    onChange={(e) => setImagesPerRow(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono">8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="bg-white border border-swiss-black">
          <div className="p-6 border-b border-swiss-black">
            <h2 className="text-lg swiss-title">
              All Uploads ({filteredItems.length} of {items.length})
              {searchQuery && <span className="text-sm text-swiss-gray-600 ml-2">- filtered by "{searchQuery}"</span>}
            </h2>
          </div>
          
          <div className="p-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-swiss-gray-600">
                  {searchQuery ? `No uploads found for "${searchQuery}"` : 'No uploads found'}
                </p>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-2 px-3 py-1 text-sm border border-swiss-gray-300 hover:border-swiss-black"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid ${getGridCols()} gap-6`}>
                {filteredItems.map((item) => (
                  <div key={item.id} className="border border-swiss-gray-300 bg-swiss-gray-50">
                    {/* Thumbnail */}
                    <div className="aspect-square bg-swiss-gray-100 relative overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title || 'Upload'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      {editingItem === item.id ? (
                        // Edit Form
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Title"
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="w-full px-2 py-1 border border-swiss-gray-300 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Author Name"
                            value={editForm.author_name || ''}
                            onChange={(e) => setEditForm({...editForm, author_name: e.target.value})}
                            className="w-full px-2 py-1 border border-swiss-gray-300 text-sm"
                          />
                          <input
                            type="url"
                            placeholder="Author Profile URL"
                            value={editForm.author_profile_url || ''}
                            onChange={(e) => setEditForm({...editForm, author_profile_url: e.target.value})}
                            className="w-full px-2 py-1 border border-swiss-gray-300 text-sm"
                          />
                          <input
                            type="url"
                            placeholder="Source URL"
                            value={editForm.source_url || ''}
                            onChange={(e) => setEditForm({...editForm, source_url: e.target.value})}
                            className="w-full px-2 py-1 border border-swiss-gray-300 text-sm"
                          />
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(item.id)}
                              className="flex-1 px-3 py-2 bg-swiss-black text-white hover:bg-swiss-gray-800 text-xs flex items-center justify-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              SAVE
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="flex-1 px-3 py-2 border border-swiss-gray-300 hover:border-swiss-black text-xs flex items-center justify-center gap-1"
                            >
                              <X className="w-3 h-3" />
                              CANCEL
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display Mode
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm truncate">
                            {item.title || 'Untitled'}
                          </h3>
                          <p className="text-xs text-swiss-gray-600 truncate">
                            {item.author_name || 'Unknown Author'}
                          </p>
                          <p className="text-xs text-swiss-gray-500">
                            {getSourceName(item.source_url)} • {new Date(item.created_at).toLocaleDateString()}
                          </p>
                          
                          <div className="flex gap-1 pt-2">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="flex-1 px-2 py-1 bg-swiss-white border border-swiss-gray-300 hover:border-swiss-black text-xs flex items-center justify-center gap-1"
                              title="View"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleEdit(item)}
                              className="flex-1 px-2 py-1 bg-swiss-white border border-swiss-gray-300 hover:border-swiss-black text-xs flex items-center justify-center gap-1"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="flex-1 px-2 py-1 bg-red-50 border border-red-300 hover:border-red-500 text-red-600 text-xs flex items-center justify-center gap-1"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-swiss-black max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-swiss-black flex items-center justify-between">
              <h3 className="text-lg swiss-title">View Upload</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 border border-swiss-black flex items-center justify-center hover:bg-swiss-black hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title || 'Upload'}
                className="w-full max-h-96 object-contain mb-4"
              />
              
              <div className="space-y-2 text-sm">
                <div><strong>Title:</strong> {selectedItem.title || 'N/A'}</div>
                <div><strong>Author:</strong> {selectedItem.author_name || 'N/A'}</div>
                <div><strong>Created:</strong> {new Date(selectedItem.created_at).toLocaleString()}</div>
                {selectedItem.source_url && (
                  <div><strong>Source:</strong> <a href={selectedItem.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Link</a></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}