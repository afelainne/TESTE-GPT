"use client";

import { useState } from 'react';
import { Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface IndexResult {
  channel: {
    slug: string;
    title: string;
    total_blocks: number;
    image_blocks: number;
  };
  processed: {
    success: number;
    errors: number;
    skipped: number;
  };
  message: string;
}

export function ArenaIndexer() {
  const [channelSlug, setChannelSlug] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [result, setResult] = useState<IndexResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleIndex = async () => {
    if (!channelSlug.trim()) {
      toast({
        title: "Error",
        description: "Please enter a channel slug",
        variant: "destructive",
      });
      return;
    }

    setIsIndexing(true);
    setResult(null);
    setError(null);

    try {
      console.log('🔄 Starting Are.na indexing for:', channelSlug);

      const response = await fetch('/api/index-arena', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: channelSlug.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`Indexing failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      toast({
        title: "Indexing Complete",
        description: `Successfully indexed ${data.processed.success} images from "${data.channel.title}"`,
      });

      console.log('✅ Indexing completed:', data);

    } catch (error) {
      console.error('❌ Indexing error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      
      toast({
        title: "Indexing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const getProgressPercentage = () => {
    if (!result) return 0;
    const total = result.processed.success + result.processed.errors + result.processed.skipped;
    return total > 0 ? ((result.processed.success + result.processed.errors) / total) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="channelSlug" className="text-swiss-black font-mono text-sm uppercase tracking-wide">Are.na Channel Slug</Label>
          <Input
            id="channelSlug"
            type="text"
            value={channelSlug}
            onChange={(e) => setChannelSlug(e.target.value)}
            placeholder="e.g., minimal-design, typography-inspiration"
            className="border-swiss-black bg-swiss-white text-swiss-black placeholder:text-swiss-gray-500 font-mono"
            disabled={isIndexing}
          />
          <p className="text-swiss-gray-600 text-sm font-mono">
            Enter the slug from the Are.na channel URL (are.na/channel-slug)
          </p>
        </div>

        <Button 
          onClick={handleIndex}
          disabled={isIndexing || !channelSlug.trim()}
          className="bg-swiss-black hover:bg-swiss-gray-800 text-swiss-white w-full font-mono uppercase tracking-wide"
        >
          {isIndexing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              INDEXING CHANNEL...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              INDEX ARE.NA CHANNEL
            </>
          )}
        </Button>
      </div>

      {/* Example Channels */}
      <Card className="border border-swiss-black bg-swiss-white">
        <CardHeader className="border-b border-swiss-black">
          <CardTitle className="text-swiss-black font-mono text-sm uppercase tracking-wide">Popular Channels to Try</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2">
            {[
              'minimal-design',
              'typography-inspiration', 
              'color-palettes',
              'web-design',
              'editorial-design'
            ].map((slug) => (
              <Button
                key={slug}
                variant="ghost"
                size="sm"
                onClick={() => setChannelSlug(slug)}
                className="justify-start text-swiss-black hover:bg-swiss-gray-100 text-xs font-mono border border-swiss-black"
                disabled={isIndexing}
              >
                {slug}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card className="border border-swiss-black bg-swiss-white">
          <CardHeader className="border-b border-swiss-black">
            <CardTitle className="text-swiss-black flex items-center space-x-2 font-mono">
              <CheckCircle className="w-5 h-5" />
              <span>INDEXING RESULTS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Channel Info */}
            <div className="border border-swiss-black p-4">
              <h3 className="text-swiss-black font-mono font-bold mb-3 uppercase tracking-wide">{result.channel.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-swiss-gray-600 font-mono">Total Blocks:</span>
                  <span className="text-swiss-black font-mono font-bold">{result.channel.total_blocks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-swiss-gray-600 font-mono">Image Blocks:</span>
                  <span className="text-swiss-black font-mono font-bold">{result.channel.image_blocks}</span>
                </div>
              </div>
            </div>

            {/* Processing Stats */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-swiss-gray-600 font-mono uppercase tracking-wide">Processing Progress</span>
                <span className="text-swiss-black font-mono font-bold">{Math.round(getProgressPercentage())}%</span>
              </div>
              <div className="w-full bg-swiss-gray-200 h-2 border border-swiss-black">
                <div 
                  className="bg-swiss-black h-full transition-all duration-300" 
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center border border-swiss-black p-3">
                  <div className="text-swiss-black font-mono font-bold text-lg">{result.processed.success}</div>
                  <div className="text-swiss-gray-600 font-mono text-xs uppercase">Success</div>
                </div>
                <div className="text-center border border-swiss-black p-3">
                  <div className="text-swiss-black font-mono font-bold text-lg">{result.processed.errors}</div>
                  <div className="text-swiss-gray-600 font-mono text-xs uppercase">Errors</div>
                </div>
                <div className="text-center border border-swiss-black p-3">
                  <div className="text-swiss-black font-mono font-bold text-lg">{result.processed.skipped}</div>
                  <div className="text-swiss-gray-600 font-mono text-xs uppercase">Skipped</div>
                </div>
              </div>
            </div>

            <div className="border border-swiss-black p-4 bg-swiss-gray-50">
              <p className="text-swiss-black text-sm font-mono">
                {result.message}
              </p>
              {result.processed.success > 0 && (
                <p className="text-swiss-gray-600 text-xs font-mono mt-2 border-t border-swiss-black pt-2">
                  Note: Images are stored in temporary cache due to database connectivity. Data will be available during this session.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border border-swiss-black bg-swiss-white">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-swiss-black mb-4">
              <AlertCircle className="w-5 h-5" />
              <span className="font-mono font-bold uppercase tracking-wide">Indexing Failed</span>
            </div>
            <div className="border border-swiss-black p-4 bg-swiss-gray-50">
              <p className="text-swiss-black text-sm font-mono">{error}</p>
              
              {/* Helpful tips */}
              <div className="mt-4 pt-4 border-t border-swiss-black">
                <p className="text-swiss-gray-600 text-xs font-mono uppercase tracking-wide mb-2">Common Issues:</p>
                <ul className="space-y-1 text-xs font-mono text-swiss-gray-600">
                  <li>• Check if the channel slug is correct</li>
                  <li>• Ensure the channel is public</li>
                  <li>• Verify CLIP API service is available</li>
                  <li>• Try again in a few minutes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}