"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Search, Database, ExternalLink } from 'lucide-react';

export function ClipIndexer() {
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [indexResult, setIndexResult] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleIndex = async () => {
    if (!imageUrl || !title) {
      alert('Please provide both image URL and title');
      return;
    }

    setIsIndexing(true);
    try {
      console.log('📝 Indexing image:', title);
      
      const response = await fetch('/api/index-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          title,
          author_name: author,
          platform: 'manual-upload',
          category: 'test'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setIndexResult(result);
        console.log('✅ Image indexed successfully:', result);
        
        // Clear form
        setImageUrl('');
        setTitle('');
        setAuthor('');
      } else {
        console.error('❌ Indexing failed:', result);
        alert(`Indexing failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Indexing error:', error);
      alert('Indexing error - see console for details');
    } finally {
      setIsIndexing(false);
    }
  };

  const handleSearch = async () => {
    if (!imageUrl) {
      alert('Please provide an image URL to search for similar images');
      return;
    }

    setIsSearching(true);
    try {
      console.log('🔍 Searching for similar images...');
      
      const response = await fetch('/api/find-similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          limit: 8
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setSearchResults(result.results || []);
        console.log(`✅ Found ${result.results?.length || 0} similar images`);
      } else {
        console.error('❌ Search failed:', result);
        alert(`Search failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error('❌ Search error:', error);
      alert('Search error - see console for details');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Indexing Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Index New Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descriptive title for the image"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Author (optional)</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
              className="w-full"
            />
          </div>
          
          <Button 
            onClick={handleIndex} 
            disabled={isIndexing || !imageUrl || !title}
            className="w-full"
          >
            {isIndexing ? 'Generating CLIP Embedding...' : 'Index Image'}
          </Button>
          
          {indexResult && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-800">
                ✅ Indexed successfully! ID: {indexResult.id}
                <br />
                Embedding: {indexResult.embedding_generated ? '✅ Generated' : '⏳ Pending'}
                {indexResult.embedding_length > 0 && ` (${indexResult.embedding_length}D)`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Similar Images
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !imageUrl}
            className="w-full"
            variant="outline"
          >
            {isSearching ? 'Searching with CLIP...' : 'Find Similar Images'}
          </Button>
          
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {searchResults.map((result, index) => (
                <div key={index} className="border rounded p-2">
                  <img 
                    src={result.image_url} 
                    alt={result.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                  <p className="text-xs text-gray-600 truncate" title={result.title}>
                    {result.title}
                  </p>
                  <p className="text-xs text-blue-600">
                    {Math.round(result.similarity * 100)}% similar
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            CLIP API Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium mb-1">Available Endpoints:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• POST /api/index-image</li>
                <li>• POST /api/find-similar</li>
                <li>• GET /api/index-image (stats)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Features:</p>
              <ul className="space-y-1 text-gray-600">
                <li>• CLIP ViT-B/32 embeddings</li>
                <li>• pgvector similarity search</li>
                <li>• Automatic deduplication</li>
                <li>• Graceful fallbacks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}