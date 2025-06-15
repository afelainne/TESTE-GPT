"use client";

import { useState, useEffect } from 'react';
import { Eye, Database, Trash2, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SystemStatus } from '@/components/SystemStatus';

interface IndexedImage {
  id: string;
  image_url: string;
  source_url: string;
  title: string;
  created_at: string;
  metadata?: {
    arena_id?: number;
    channel_slug?: string;
    channel_title?: string;
    upload_source?: string;
    original_filename?: string;
  };
}

export function Dashboard() {
  const [images, setImages] = useState<IndexedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    arenadImages: 0,
    uploads: 0
  });
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      console.log('🔄 Fetching indexed images...');
      
      const response = await fetch('/api/search-similar?limit=100');
      
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      
      const fetchedImages = data.vectors || [];
      setImages(fetchedImages);
      
      // Calculate stats
      const arenadCount = fetchedImages.filter((img: IndexedImage) => 
        img.metadata?.arena_id
      ).length;
      
      const uploadCount = fetchedImages.filter((img: IndexedImage) => 
        img.metadata?.upload_source === 'vercel_blob'
      ).length;
      
      setStats({
        total: fetchedImages.length,
        arenadImages: arenadCount,
        uploads: uploadCount
      });

      console.log('✅ Images fetched:', fetchedImages.length);

    } catch (error) {
      console.error('❌ Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load indexed images",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageSource = (image: IndexedImage) => {
    if (image.metadata?.arena_id) {
      return {
        type: 'Are.na',
        detail: image.metadata.channel_title || image.metadata.channel_slug || 'Channel',
        color: 'bg-green-500'
      };
    } else if (image.metadata?.upload_source === 'vercel_blob') {
      return {
        type: 'Upload',
        detail: image.metadata.original_filename || 'File',
        color: 'bg-blue-500'
      };
    } else {
      return {
        type: 'Unknown',
        detail: 'External',
        color: 'bg-gray-500'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Status */}
      <SystemStatus />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-swiss-black bg-swiss-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-swiss-gray-600 text-sm font-mono uppercase tracking-wide">Total Images</p>
                <p className="text-swiss-black text-3xl font-bold font-mono">{stats.total}</p>
              </div>
              <Database className="w-8 h-8 text-swiss-black" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-swiss-black bg-swiss-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-swiss-gray-600 text-sm font-mono uppercase tracking-wide">Are.na Images</p>
                <p className="text-swiss-black text-3xl font-bold font-mono">{stats.arenadImages}</p>
              </div>
              <Database className="w-8 h-8 text-swiss-black" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-swiss-black bg-swiss-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-swiss-gray-600 text-sm font-mono uppercase tracking-wide">Uploads</p>
                <p className="text-swiss-black text-3xl font-bold font-mono">{stats.uploads}</p>
              </div>
              <Database className="w-8 h-8 text-swiss-black" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">
          Indexed Images ({images.length})
        </h3>
        <Button
          onClick={fetchImages}
          variant="outline"
          size="sm"
          className="border-orange-500/30 text-orange-300 hover:bg-orange-500/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <Card className="bg-black/20 border border-orange-500/20">
          <CardContent className="p-8 text-center">
            <Eye className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No Images Indexed</h3>
            <p className="text-orange-300 text-sm">
              Start by indexing an Are.na channel or uploading some images
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => {
            const source = getImageSource(image);
            
            return (
              <Card key={image.id} className="bg-black/20 border border-orange-500/20 overflow-hidden hover:border-orange-400/40 transition-colors">
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge 
                      className={`${source.color} text-white text-xs`}
                    >
                      {source.type}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h4 className="text-white font-medium text-sm mb-1 line-clamp-2">
                      {image.title}
                    </h4>
                    <p className="text-orange-300 text-xs">
                      {source.detail}
                    </p>
                  </div>

                  <div className="text-orange-400 text-xs">
                    {formatDate(image.created_at)}
                  </div>

                  <div className="flex justify-between items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(image.source_url, '_blank')}
                      className="text-xs flex-1"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}