"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, User } from 'lucide-react';

interface ClassificationInfo {
  label: string;
  score: number;
  cached?: boolean;
}

interface AuthorInfo {
  name: string;
  profileUrl: string;
  platform: string;
  cached?: boolean;
}

interface ImageClassificationBadgeProps {
  imageUrl: string;
  sourceUrl?: string;
  platform?: string;
  className?: string;
}

export function ImageClassificationBadge({ 
  imageUrl, 
  sourceUrl, 
  platform = 'unknown',
  className = '' 
}: ImageClassificationBadgeProps) {
  const [classification, setClassification] = useState<ClassificationInfo | null>(null);
  const [author, setAuthor] = useState<AuthorInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const fetchClassificationAndAuthor = async () => {
    if (hasRequested || isLoading) return;
    
    setIsLoading(true);
    setHasRequested(true);
    
    try {
      // Fetch classification and author info in parallel
      const [classifyResponse, authorResponse] = await Promise.allSettled([
        fetch('/api/classify-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        }),
        sourceUrl ? fetch('/api/get-author', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sourceUrl, 
            platform,
            imageId: imageUrl.split('/').pop()?.split('?')[0] || ''
          })
        }) : Promise.reject('No source URL')
      ]);

      // Handle classification result
      if (classifyResponse.status === 'fulfilled' && classifyResponse.value.ok) {
        const classifyData = await classifyResponse.value.json();
        setClassification(classifyData);
        console.log('🏷️ Image classified:', classifyData.label, classifyData.score);
      }

      // Handle author result
      if (authorResponse.status === 'fulfilled' && authorResponse.value.ok) {
        const authorData = await authorResponse.value.json();
        setAuthor(authorData);
        console.log('👤 Author identified:', authorData.name, authorData.platform);
      }

    } catch (error) {
      console.warn('Failed to fetch classification/author:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount with a small delay for performance
  useState(() => {
    const timer = setTimeout(fetchClassificationAndAuthor, 500);
    return () => clearTimeout(timer);
  });

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Classification Badge */}
      {classification && (
        <Badge 
          variant="secondary" 
          className="bg-swiss-gray-100 text-swiss-gray-700 text-xs swiss-mono"
        >
          {classification.label}
          <span className="ml-1 opacity-60">
            {Math.round(classification.score * 100)}%
          </span>
          {classification.cached && (
            <span className="ml-1 opacity-40">📋</span>
          )}
        </Badge>
      )}

      {/* Author Badge */}
      {author && author.name !== 'Unknown Creator' && (
        <Badge 
          variant="outline" 
          className="border-swiss-gray-300 text-swiss-gray-600 text-xs swiss-mono hover:bg-swiss-gray-50 cursor-pointer"
          onClick={() => author.profileUrl && window.open(author.profileUrl, '_blank')}
        >
          <User className="w-3 h-3 mr-1" />
          {author.name}
          {author.profileUrl && <ExternalLink className="w-3 h-3 ml-1" />}
          {author.cached && (
            <span className="ml-1 opacity-40">📋</span>
          )}
        </Badge>
      )}

      {/* Loading State */}
      {isLoading && !classification && !author && (
        <Badge variant="secondary" className="bg-swiss-gray-50 text-swiss-gray-400 text-xs swiss-mono animate-pulse">
          Analyzing...
        </Badge>
      )}
    </div>
  );
}