"use client";

import { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';

interface SimpleUploaderProps {
  onUpload?: (file: File) => void;
  onUrlAdd?: (url: string, title: string, platform: string) => void;
}

export function SimpleUploader({ onUpload, onUrlAdd }: SimpleUploaderProps) {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('File uploaded:', file.name);
      if (onUpload) onUpload(file);
      
      setUploadStatus('success');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const url = formData.get('url') as string;
    const title = formData.get('title') as string;
    const platform = formData.get('platform') as string;

    if (!url) return;

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      // Simulate URL processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('URL added:', { url, title, platform });
      if (onUrlAdd) onUrlAdd(url, title, platform);
      
      setUploadStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('URL add failed:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-swiss-black">
      <div className="p-4 border-b border-swiss-black">
        <h2 className="text-lg swiss-title">Add Images</h2>
        <p className="text-sm text-swiss-gray-600 mt-1">Upload files or add from URL</p>
      </div>

      <div className="p-6">
        {/* Method Selector */}
        <div className="flex border border-swiss-black mb-6">
          <button
            onClick={() => setUploadMethod('file')}
            className={`flex-1 p-3 text-sm swiss-mono transition-colors ${
              uploadMethod === 'file'
                ? 'bg-swiss-black text-swiss-white'
                : 'bg-white text-swiss-black hover:bg-swiss-gray-50'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            FILE UPLOAD
          </button>
          <button
            onClick={() => setUploadMethod('url')}
            className={`flex-1 p-3 text-sm swiss-mono transition-colors border-l border-swiss-black ${
              uploadMethod === 'url'
                ? 'bg-swiss-black text-swiss-white'
                : 'bg-white text-swiss-black hover:bg-swiss-gray-50'
            }`}
          >
            <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5z"/>
              <path d="M7.414 15.414a2 2 0 01-2.828-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 00-1.414-1.414l-1.5 1.5z"/>
            </svg>
            FROM URL
          </button>
        </div>

        {/* File Upload */}
        {uploadMethod === 'file' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-swiss-gray-300 hover:border-swiss-black transition-colors p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-swiss-gray-400" />
              <p className="text-sm swiss-mono mb-2">DROP FILES HERE</p>
              <p className="text-xs text-swiss-gray-500 mb-4">or click to browse</p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(handleFileUpload);
                }}
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-6 py-2 border border-swiss-black bg-swiss-white hover:bg-swiss-black hover:text-swiss-white transition-colors swiss-mono text-sm cursor-pointer"
              >
                CHOOSE FILES
              </label>
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
            <div>
              <label className="block text-sm swiss-mono mb-2">TITLE (OPTIONAL)</label>
              <input
                type="text"
                name="title"
                placeholder="Image title"
                className="w-full p-3 border border-swiss-black swiss-mono text-sm"
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

        {/* Status Messages */}
        {uploadStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">Successfully added!</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-700">Upload failed. Please try again.</span>
          </div>
        )}

        {isUploading && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200">
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm text-blue-700">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}