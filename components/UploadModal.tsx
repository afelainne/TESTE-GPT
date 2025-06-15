'use client';

import { useState, useRef } from 'react';
import { X, Upload, Image, Video, FileImage, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User } from '@/types/user';
import { categories } from '@/data/mockData';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function UploadModal({ isOpen, onClose, user }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    isPublic: true,
    allowDownload: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log('UploadModal rendered, isOpen:', isOpen);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      setFiles(prev => [...prev, ...newFiles]);
      console.log('Files dropped:', newFiles.length);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      console.log('Files selected:', newFiles.length);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    console.log('Starting upload...', {
      files: files.length,
      uploadData,
      user: user.username
    });

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setFiles([]);
      setUploadData({
        title: '',
        description: '',
        category: '',
        tags: '',
        isPublic: true,
        allowDownload: false
      });
      onClose();
      console.log('Upload completed successfully');
    }, 3000);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-4 h-4" />;
    }
    return <FileImage className="w-4 h-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="swiss-title text-xl font-light">
            Upload New Design
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-swiss-black bg-swiss-gray-50' 
                : 'border-swiss-gray-300 hover:border-swiss-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-swiss-gray-400" />
            <h3 className="text-lg swiss-body font-medium mb-2">
              Drop your files here
            </h3>
            <p className="text-sm swiss-body text-swiss-gray-600 mb-4">
              Supports JPG, PNG, GIF, MP4, and more
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-swiss-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="swiss-body font-medium">Selected Files ({files.length})</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-swiss-gray-200 rounded">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <span className="text-sm swiss-body truncate">{file.name}</span>
                      <span className="text-xs swiss-mono text-swiss-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(1)}MB
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Details */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title" className="swiss-body font-medium">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Give your design a title"
                value={uploadData.title}
                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 border-swiss-black focus:border-swiss-black"
              />
            </div>

            <div>
              <Label htmlFor="description" className="swiss-body font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your design..."
                value={uploadData.description}
                onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 border-swiss-black focus:border-swiss-black"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="swiss-body font-medium">Category</Label>
                <Select
                  value={uploadData.category}
                  onValueChange={(value) => setUploadData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1 border-swiss-black">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.id !== 'all').map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tags" className="swiss-body font-medium">
                  Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="design, minimal, swiss"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                  className="mt-1 border-swiss-black focus:border-swiss-black"
                />
              </div>
            </div>

            {/* Upload Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={uploadData.isPublic}
                  onChange={(e) => setUploadData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 border-swiss-black rounded-none"
                />
                <label htmlFor="isPublic" className="text-sm swiss-body">
                  Make this upload public
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowDownload"
                  checked={uploadData.allowDownload}
                  onChange={(e) => setUploadData(prev => ({ ...prev, allowDownload: e.target.checked }))}
                  className="w-4 h-4 border-swiss-black rounded-none"
                />
                <label htmlFor="allowDownload" className="text-sm swiss-body">
                  Allow others to download
                </label>
              </div>
            </div>
          </div>

          {/* Upload Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-swiss-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
              className="border-swiss-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || !uploadData.title || isUploading}
              className="bg-swiss-black text-swiss-white hover:bg-swiss-gray-800"
            >
              {isUploading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin w-4 h-4 border border-swiss-white border-t-transparent rounded-full"></div>
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload {files.length} file{files.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}