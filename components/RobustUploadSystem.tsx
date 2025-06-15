"use client";

import { useState, useRef } from 'react';
import { Upload, Link, Database, CheckCircle, AlertCircle, Loader2, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface UploadItem {
  id: string;
  type: 'file' | 'url' | 'arena';
  source: File | string;
  title: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  sourceUrl: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
  metadata?: {
    imagesProcessed?: number;
    totalImages?: number;
    channelTitle?: string;
    supabaseUploads?: number;
    errors?: number;
  };
}

interface UploadResult {
  success: number;
  failed: number;
  total: number;
  items: Array<{
    id: string;
    title: string;
    status: 'success' | 'error';
    error?: string;
  }>;
}

export function RobustUploadSystem() {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [arenaSlugInput, setArenaSlugInput] = useState('');
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Categories and default values
  const categories = ['design', 'typography', 'art', 'photography', 'branding', 'web', 'mobile', 'print'];
  const defaultTags = ['inspiration', 'design', 'creative'];

  const generateId = () => `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addFileUploads = (files: FileList) => {
    console.log('📁 Adding file uploads:', files.length);
    
    const newItems: UploadItem[] = Array.from(files).map(file => ({
      id: generateId(),
      type: 'file',
      source: file,
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      author: 'User Upload',
      description: `Uploaded file: ${file.name}`,
      category: 'design',
      tags: [...defaultTags],
      sourceUrl: '',
      status: 'pending'
    }));

    setUploadItems(prev => [...prev, ...newItems]);
    console.log('✅ Added file uploads:', newItems.length);
  };

  const addUrlUpload = () => {
    if (!urlInput.trim()) return;
    
    console.log('🔗 Adding URL upload:', urlInput);
    
    const newItem: UploadItem = {
      id: generateId(),
      type: 'url',
      source: urlInput.trim(),
      title: extractTitleFromUrl(urlInput),
      author: 'External Source',
      description: `Imported from URL: ${urlInput}`,
      category: 'design',
      tags: [...defaultTags],
      sourceUrl: urlInput.trim(),
      status: 'pending'
    };

    setUploadItems(prev => [...prev, newItem]);
    setUrlInput('');
    console.log('✅ Added URL upload:', newItem.title);
  };

  const addArenaImport = () => {
    if (!arenaSlugInput.trim()) return;
    
    console.log('🏟️ Adding Arena import:', arenaSlugInput);
    
    const newItem: UploadItem = {
      id: generateId(),
      type: 'arena',
      source: arenaSlugInput.trim(),
      title: `Are.na Channel: ${arenaSlugInput}`,
      author: 'Are.na Community',
      description: `Imported from Are.na channel: ${arenaSlugInput}`,
      category: 'design',
      tags: [...defaultTags, 'arena'],
      sourceUrl: `https://are.na/${arenaSlugInput}`,
      status: 'pending'
    };

    setUploadItems(prev => [...prev, newItem]);
    setArenaSlugInput('');
    console.log('✅ Added Arena import:', newItem.title);
  };

  const extractTitleFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'External Image';
      return filename.replace(/\.[^/.]+$/, '') || 'External Image';
    } catch {
      return 'External Image';
    }
  };

  const updateItem = (id: string, updates: Partial<UploadItem>) => {
    setUploadItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
  };

  const uploadFile = async (item: UploadItem): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('📁 Uploading file:', item.title);
      
      const formData = new FormData();
      formData.append('file', item.source as File);
      formData.append('title', item.title);
      formData.append('author', item.author);
      formData.append('description', item.description);
      formData.append('category', item.category);
      formData.append('tags', JSON.stringify(item.tags));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ File uploaded successfully:', result);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ File upload failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const uploadUrl = async (item: UploadItem): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔗 Uploading URL:', item.sourceUrl);
      
      const response = await fetch('/api/index-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: item.source as string,
          title: item.title,
          author: item.author,
          description: item.description,
          category: item.category,
          tags: item.tags,
          sourceUrl: item.sourceUrl
        })
      });

      if (!response.ok) {
        throw new Error(`URL upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ URL uploaded successfully:', result);
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ URL upload failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const uploadArena = async (item: UploadItem): Promise<{ success: boolean; error?: string; details?: any }> => {
    try {
      console.log('🏟️ Starting Arena channel upload:', item.source);
      updateItem(item.id, { status: 'uploading', progress: 10 });
      
      const response = await fetch('/api/index-arena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: item.source as string
        })
      });

      updateItem(item.id, { progress: 50 });

      if (!response.ok) {
        throw new Error(`Arena upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Arena channel uploaded successfully:', result);
      
      updateItem(item.id, { 
        progress: 100,
        metadata: {
          imagesProcessed: result.processed?.success || 0,
          totalImages: result.channel?.total_blocks || 0,
          channelTitle: result.channel?.title || item.source,
          supabaseUploads: result.processed?.success || 0,
          errors: result.processed?.errors || 0
        }
      });
      
      return { 
        success: true, 
        details: {
          processed: result.processed?.success || 0,
          total: result.channel?.total_blocks || 0,
          title: result.channel?.title || item.source
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Arena upload failed:', errorMessage);
      updateItem(item.id, { progress: 0 });
      return { success: false, error: errorMessage };
    }
  };

  const processUploads = async () => {
    if (uploadItems.length === 0) return;
    
    console.log('🚀 Starting upload process for', uploadItems.length, 'items');
    setIsUploading(true);
    setResult(null);

    const results: UploadResult = {
      success: 0,
      failed: 0,
      total: uploadItems.length,
      items: []
    };

    // Process each item
    for (const item of uploadItems) {
      updateItem(item.id, { status: 'uploading', progress: 0 });
      
      let uploadResult: { success: boolean; error?: string };
      
      try {
        switch (item.type) {
          case 'file':
            uploadResult = await uploadFile(item);
            break;
          case 'url':
            uploadResult = await uploadUrl(item);
            break;
          case 'arena':
            uploadResult = await uploadArena(item);
            break;
          default:
            uploadResult = { success: false, error: 'Unknown upload type' };
        }

        if (uploadResult.success) {
          updateItem(item.id, { status: 'success', progress: 100 });
          results.success++;
          results.items.push({ id: item.id, title: item.title, status: 'success' });
        } else {
          updateItem(item.id, { status: 'error', error: uploadResult.error });
          results.failed++;
          results.items.push({ 
            id: item.id, 
            title: item.title, 
            status: 'error', 
            error: uploadResult.error 
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateItem(item.id, { status: 'error', error: errorMessage });
        results.failed++;
        results.items.push({ 
          id: item.id, 
          title: item.title, 
          status: 'error', 
          error: errorMessage 
        });
      }

      // Small delay between uploads to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setResult(results);
    setIsUploading(false);
    
    toast({
      title: "Upload Complete",
      description: `${results.success} successful, ${results.failed} failed`,
      variant: results.failed > 0 ? "destructive" : "default"
    });

    console.log('🎉 Upload process completed:', results);
  };

  const clearAll = () => {
    setUploadItems([]);
    setResult(null);
    setUrlInput('');
    setArenaSlugInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-swiss-black pb-4">
        <h2 className="text-xl swiss-title font-light">ROBUST UPLOAD SYSTEM</h2>
        <p className="text-sm swiss-body text-swiss-gray-600 mt-1">
          Upload files, URLs, and Are.na channels to Supabase with unlimited scalability
        </p>
      </div>

      {/* Upload Sources */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* File Upload */}
        <Card className="border border-swiss-black">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="swiss-mono text-sm flex items-center gap-2">
              <Upload className="w-4 h-4" />
              FILE UPLOAD
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white"
            >
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={(e) => e.target.files && addFileUploads(e.target.files)}
              className="hidden"
            />
            <p className="text-xs swiss-mono text-swiss-gray-500">
              JPG, PNG, GIF, MP4, PDF up to 10MB each
            </p>
          </CardContent>
        </Card>

        {/* URL Import */}
        <Card className="border border-swiss-black">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="swiss-mono text-sm flex items-center gap-2">
              <Link className="w-4 h-4" />
              URL IMPORT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              disabled={isUploading}
              className="border-swiss-black"
            />
            <Button
              onClick={addUrlUpload}
              disabled={isUploading || !urlInput.trim()}
              className="w-full border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white"
            >
              Add URL
            </Button>
          </CardContent>
        </Card>

        {/* Arena Import */}
        <Card className="border border-swiss-black">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="swiss-mono text-sm flex items-center gap-2">
              <Database className="w-4 h-4" />
              ARE.NA IMPORT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Input
              value={arenaSlugInput}
              onChange={(e) => setArenaSlugInput(e.target.value)}
              placeholder="channel-slug"
              disabled={isUploading}
              className="border-swiss-black"
            />
            <Button
              onClick={addArenaImport}
              disabled={isUploading || !arenaSlugInput.trim()}
              className="w-full border border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white"
            >
              Import Channel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upload Queue */}
      {uploadItems.length > 0 && (
        <Card className="border border-swiss-black">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="swiss-mono text-sm flex items-center justify-between">
              <span>UPLOAD QUEUE ({uploadItems.length})</span>
              <div className="space-x-2">
                <Button
                  onClick={processUploads}
                  disabled={isUploading}
                  size="sm"
                  className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'START UPLOAD'
                  )}
                </Button>
                <Button
                  onClick={clearAll}
                  disabled={isUploading}
                  size="sm"
                  variant="outline"
                  className="border-swiss-black"
                >
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {uploadItems.map((item) => (
                <div key={item.id} className="border border-swiss-gray-300 p-3 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.type === 'file' && <Upload className="w-4 h-4" />}
                      {item.type === 'url' && <Link className="w-4 h-4" />}
                      {item.type === 'arena' && <Database className="w-4 h-4" />}
                      <span className="swiss-mono text-sm font-medium">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'pending' && <span className="text-swiss-gray-500 text-xs">Pending</span>}
                      {item.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
                      {item.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                      <Button
                        onClick={() => removeItem(item.id)}
                        disabled={isUploading}
                        size="sm"
                        variant="ghost"
                        className="w-6 h-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Input
                      value={item.title}
                      onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      placeholder="Title"
                      disabled={isUploading}
                      className="text-xs"
                    />
                    <Input
                      value={item.author}
                      onChange={(e) => updateItem(item.id, { author: e.target.value })}
                      placeholder="Author"
                      disabled={isUploading}
                      className="text-xs"
                    />
                  </div>

                  {item.status === 'uploading' && item.progress !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-swiss-gray-200 h-1">
                        <div 
                          className="bg-swiss-black h-1 transition-all duration-300" 
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs swiss-mono text-swiss-gray-500 mt-1">
                        Uploading... {item.progress}%
                      </p>
                    </div>
                  )}

                  {item.status === 'success' && item.metadata && item.type === 'arena' && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs font-medium text-green-800 mb-1">
                        ✅ {item.metadata.channelTitle}
                      </p>
                      <div className="text-xs text-green-600 space-y-1">
                        <div>📦 {item.metadata.imagesProcessed}/{item.metadata.totalImages} images processed</div>
                        <div>💾 {item.metadata.supabaseUploads} uploaded to Supabase</div>
                        {(item.metadata.errors || 0) > 0 && (
                          <div>⚠️ {item.metadata.errors || 0} errors occurred</div>
                        )}
                      </div>
                    </div>
                  )}

                  {item.status === 'error' && item.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs text-red-600">{item.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="border border-swiss-black">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="swiss-mono text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              UPLOAD RESULTS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center border border-swiss-black p-3">
                <div className="text-xl font-bold">{result.success}</div>
                <div className="text-xs swiss-mono">SUCCESS</div>
              </div>
              <div className="text-center border border-swiss-black p-3">
                <div className="text-xl font-bold">{result.failed}</div>
                <div className="text-xs swiss-mono">FAILED</div>
              </div>
              <div className="text-center border border-swiss-black p-3">
                <div className="text-xl font-bold">{result.total}</div>
                <div className="text-xs swiss-mono">TOTAL</div>
              </div>
            </div>

            {result.items.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {result.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm p-2 border border-swiss-gray-300">
                    <span className="swiss-mono">{item.title}</span>
                    <div className="flex items-center gap-2">
                      {item.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                      {item.error && (
                        <span className="text-xs text-red-600">{item.error}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}