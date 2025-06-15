"use client";

import { useState } from 'react';
import { Search, Upload, Link, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  image_url: string;
  source_url: string;
  title: string;
  similarity: number;
  metadata?: any;
}

export function VisualSearch() {
  const [searchMethod, setSearchMethod] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchImage, setSearchImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSearchImage(url);
      setImageUrl(url);
    }
  };

  const handleSearch = async () => {
    if (!imageUrl) {
      toast({
        title: "Error",
        description: "Please provide an image URL or upload an image",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setResults([]); // Clear previous results

    try {
      console.log('🔍 Starting visual search for:', imageUrl);

      // Use the new find-similar API endpoint
      const response = await fetch('/api/find-similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Process the results from the new API format
      const similarUrls = data.similar || [];
      const processedResults = similarUrls.map((url: string, index: number) => ({
        id: `similar_${index}`,
        image_url: url,
        source_url: url,
        title: `Similar Image ${index + 1}`,
        similarity: 0.9 - (index * 0.1), // Mock similarity scores
        metadata: { source: 'clip_search' }
      }));

      setResults(processedResults);
      setSearchImage(imageUrl);
      
      toast({
        title: "Search Complete",
        description: `Found ${similarUrls.length} similar images`,
      });

      console.log('✅ Search completed:', data);

    } catch (error) {
      console.error('❌ Search error:', error);
      
      // Show fallback message for no results
      if (error instanceof Error && error.message.includes('Resposta CLIP inválida')) {
        toast({
          title: "No Similar Images Found",
          description: "Try with a different image or check back later",
        });
      } else {
        toast({
          title: "Search Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Interface */}
      <div className="space-y-6">
        {/* Method Selection */}
        <div className="flex border border-swiss-black">
          <Button
            variant={searchMethod === 'url' ? 'default' : 'outline'}
            onClick={() => setSearchMethod('url')}
            className={`flex-1 border-none rounded-none font-mono uppercase tracking-wide ${searchMethod === 'url' ? 'bg-swiss-black text-swiss-white' : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-100'} border-r border-swiss-black`}
          >
            <Link className="w-4 h-4 mr-2" />
            URL
          </Button>
          <Button
            variant={searchMethod === 'upload' ? 'default' : 'outline'}
            onClick={() => setSearchMethod('upload')}
            className={`flex-1 border-none rounded-none font-mono uppercase tracking-wide ${searchMethod === 'upload' ? 'bg-swiss-black text-swiss-white' : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-100'}`}
          >
            <Upload className="w-4 h-4 mr-2" />
            UPLOAD
          </Button>
        </div>

        {/* Input Fields */}
        {searchMethod === 'url' ? (
          <div className="space-y-3">
            <Label htmlFor="imageUrl" className="text-swiss-black font-mono text-sm uppercase tracking-wide">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="border-swiss-black bg-swiss-white text-swiss-black placeholder:text-swiss-gray-500 font-mono"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="imageFile" className="text-swiss-black font-mono text-sm uppercase tracking-wide">Upload Image</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="border-swiss-black bg-swiss-white text-swiss-black file:bg-swiss-black file:border-0 file:text-swiss-white font-mono"
            />
          </div>
        )}

        {/* Search Button */}
        <Button 
          onClick={handleSearch}
          disabled={isSearching || !imageUrl}
          className="bg-swiss-black hover:bg-swiss-gray-800 text-swiss-white w-full font-mono uppercase tracking-wide"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              SEARCHING...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              FIND SIMILAR IMAGES
            </>
          )}
        </Button>
      </div>

      {/* Search Image Preview */}
      {searchImage && (
        <Card className="border border-swiss-black bg-swiss-white">
          <CardContent className="p-6">
            <h3 className="text-swiss-black font-mono font-bold mb-4 uppercase tracking-wide">Search Image</h3>
            <div className="border border-swiss-black">
              <img
                src={searchImage}
                alt="Search image"
                className="w-full max-w-md h-auto"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-mono font-bold text-swiss-black uppercase tracking-wide">
            Similar Images ({results.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((result) => (
              <Card key={result.id} className="border border-swiss-black bg-swiss-white overflow-hidden hover:bg-swiss-gray-100 transition-colors">
                <div className="aspect-square relative border-b border-swiss-black">
                  <img
                    src={result.image_url}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-swiss-black text-swiss-white text-xs px-2 py-1 font-mono">
                    {Math.round(result.similarity * 100)}%
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="text-swiss-black font-mono text-sm mb-2 line-clamp-2">
                    {result.title}
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-swiss-gray-600 text-xs font-mono">
                      {result.metadata?.arena_id ? 'ARE.NA' : 'UPLOAD'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(result.source_url, '_blank')}
                      className="text-xs font-mono border-swiss-black hover:bg-swiss-black hover:text-swiss-white"
                    >
                      VIEW
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}