"use client";

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { InspirationItem } from '@/types/inspiration';

interface AuthorInfoProps {
  item: InspirationItem;
}

interface AuthorData {
  name: string;
  profileUrl: string;
  platform: string;
  bio?: string;
  avatar?: string;
}

export function AuthorInfo({ item }: AuthorInfoProps) {
  const [authorData, setAuthorData] = useState<AuthorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        console.log('🔍 Fetching author info for:', item.source);
        
        const response = await fetch('/api/get-author', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceUrl: item.source || 'unknown',
            imageId: item.id,
            platform: item.platform
          })
        });

        if (response.ok) {
          const data = await response.json();
          setAuthorData(data);
          console.log('✅ Author data received:', data.name);
        } else {
          // Fallback to item.author
          setAuthorData({
            name: item.author || 'Unknown Creator',
            profileUrl: item.source || '',
            platform: item.platform || 'Unknown'
          });
        }
      } catch (error) {
        console.warn('Failed to fetch author info:', error);
        setAuthorData({
          name: item.author || 'Unknown Creator',
          profileUrl: item.source || '',
          platform: item.platform || 'Unknown'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAuthor();
  }, [item.id, item.source, item.platform, item.author]);

  if (loading) {
    return (
      <div className="mb-4">
        <span className="text-swiss-gray-500 block mb-1 text-xs swiss-mono">AUTHOR</span>
        <div className="h-4 bg-swiss-gray-200 animate-pulse rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <span className="text-swiss-gray-500 block mb-1 text-xs swiss-mono">AUTHOR</span>
      <div className="flex items-center gap-2">
        {authorData?.avatar && (
          <img 
            src={authorData.avatar} 
            alt={authorData.name}
            className="w-6 h-6 rounded border border-swiss-gray-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex items-center gap-2">
          <span className="text-swiss-black text-sm swiss-body font-medium">
            {authorData?.name || 'Unknown Creator'}
          </span>
          {authorData?.profileUrl && authorData.profileUrl !== 'unknown' && (
            <a 
              href={authorData.profileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-swiss-gray-500 hover:text-swiss-black transition-colors"
              title={`View ${authorData.name}'s profile on ${authorData.platform}`}
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      {authorData?.bio && (
        <p className="text-xs swiss-mono text-swiss-gray-500 mt-1">
          {authorData.bio}
        </p>
      )}
      <div className="text-xs swiss-mono text-swiss-gray-400 mt-1">
        from {authorData?.platform || 'Unknown Platform'}
      </div>
    </div>
  );
}