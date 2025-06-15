"use client";

import { useState, useRef } from 'react';
import { Upload, Loader2, CheckCircle, X, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface UploadResult {
  id: string;
  image_url: string;
  title: string;
  source_url: string;
  embedding_dimensions: number;
  message: string;
}

export function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setTitle(file.name);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setTitle('');
    setSourceUrl('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      console.log('🔄 Starting upload:', selectedFile.name);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('sourceUrl', sourceUrl);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      toast({
        title: "Upload Successful",
        description: `Image uploaded and indexed with ${data.embedding_dimensions}D embedding`,
      });

      console.log('✅ Upload completed:', data);

    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!result && (
        <div className="space-y-4">
          {/* File Selection */}
          <div className="space-y-3">
            <Label htmlFor="imageFile" className="text-swiss-black font-mono text-sm uppercase tracking-wide">Select Image</Label>
            <div className="relative">
              <Input
                ref={fileInputRef}
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="border-swiss-black bg-swiss-white text-swiss-black file:bg-swiss-black file:border-0 file:text-swiss-white font-mono"
                disabled={isUploading}
              />
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-swiss-black hover:bg-swiss-gray-100"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-swiss-gray-600 text-sm font-mono">
              Supported formats: JPG, PNG, GIF, WebP (max 10MB)
            </p>
          </div>

          {/* Preview and Metadata */}
          {selectedFile && preview && (
            <Card className="bg-black/20 border border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-white text-sm">Image Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Image Preview */}
                  <div className="lg:w-1/2">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-w-sm h-auto rounded-lg border border-blue-500/30"
                    />
                    <div className="mt-2 text-sm text-blue-300">
                      <p>Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <p>Type: {selectedFile.type}</p>
                    </div>
                  </div>

                  {/* Metadata Inputs */}
                  <div className="lg:w-1/2 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white">Title</Label>
                      <Input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter image title"
                        className="bg-black/40 border-blue-500/30 text-white placeholder:text-blue-300"
                        disabled={isUploading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sourceUrl" className="text-white">Source URL (optional)</Label>
                      <Input
                        id="sourceUrl"
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://original-source.com"
                        className="bg-black/40 border-blue-500/30 text-white placeholder:text-blue-300"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading & Indexing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload & Index Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Success Result */}
      {result && (
        <Card className="bg-black/20 border border-green-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Upload Successful</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Result */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="lg:w-1/2">
                <img
                  src={result.image_url}
                  alt={result.title}
                  className="w-full max-w-sm h-auto rounded-lg border border-green-500/30"
                />
              </div>

              <div className="lg:w-1/2 space-y-3">
                <div>
                  <span className="text-green-300 text-sm">Title:</span>
                  <p className="text-white">{result.title}</p>
                </div>
                
                <div>
                  <span className="text-green-300 text-sm">Image URL:</span>
                  <p className="text-white text-xs break-all">{result.image_url}</p>
                </div>

                <div>
                  <span className="text-green-300 text-sm">Embedding Dimensions:</span>
                  <p className="text-white">{result.embedding_dimensions}D vector</p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(result.image_url, '_blank')}
                    className="text-xs"
                  >
                    <Image className="w-3 h-3 mr-1" />
                    View Image
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={clearSelection}
                    className="bg-blue-600 hover:bg-blue-700 text-xs"
                  >
                    Upload Another
                  </Button>
                </div>
              </div>
            </div>

            <p className="text-green-300 text-sm bg-green-500/10 p-3 rounded">
              {result.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Drop Zone Alternative */}
      {!selectedFile && !isUploading && (
        <Card 
          className="bg-black/20 border-2 border-dashed border-blue-500/30 hover:border-blue-500/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="w-12 h-12 text-blue-400 mb-4" />
            <p className="text-white text-lg font-medium mb-2">Drop your image here</p>
            <p className="text-blue-300 text-sm">or click to browse files</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}