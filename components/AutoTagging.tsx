"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wand2, Brain, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AutoTaggingProps {
  imageUrl: string;
  existingTags?: string[];
  onTagsGenerated: (tags: string[]) => void;
  className?: string;
}

interface TagSuggestion {
  tag: string;
  confidence: number;
  category: 'style' | 'color' | 'composition' | 'mood' | 'subject';
}

export function AutoTagging({ 
  imageUrl, 
  existingTags = [], 
  onTagsGenerated, 
  className = "" 
}: AutoTaggingProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>(existingTags);
  const [error, setError] = useState<string | null>(null);

  const generateTags = async () => {
    if (!imageUrl) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('🏷️ Generating auto-tags for:', imageUrl);
      
      // Send to CLIP API for semantic analysis
      const response = await fetch('/api/auto-tag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error(`Auto-tagging failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.tags) {
        setSuggestions(data.tags);
        console.log('✅ Generated', data.tags.length, 'tag suggestions');
      } else {
        // Fallback: Generate tags based on image analysis
        const fallbackTags = generateFallbackTags(imageUrl);
        setSuggestions(fallbackTags);
      }
      
    } catch (err) {
      console.error('❌ Auto-tagging error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate tags');
      
      // Use fallback tagging
      const fallbackTags = generateFallbackTags(imageUrl);
      setSuggestions(fallbackTags);
      
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackTags = (url: string): TagSuggestion[] => {
    const fallbackTags: TagSuggestion[] = [];
    
    // Basic URL analysis
    if (url.includes('behance')) fallbackTags.push({ tag: 'behance', confidence: 0.9, category: 'subject' });
    if (url.includes('dribbble')) fallbackTags.push({ tag: 'dribbble', confidence: 0.9, category: 'subject' });
    if (url.includes('pinterest')) fallbackTags.push({ tag: 'pinterest', confidence: 0.9, category: 'subject' });
    
    // Common design patterns
    fallbackTags.push(
      { tag: 'design', confidence: 0.8, category: 'subject' },
      { tag: 'visual', confidence: 0.7, category: 'style' },
      { tag: 'inspiration', confidence: 0.6, category: 'mood' },
      { tag: 'creative', confidence: 0.6, category: 'mood' },
      { tag: 'minimal', confidence: 0.5, category: 'style' },
      { tag: 'modern', confidence: 0.5, category: 'style' }
    );
    
    return fallbackTags;
  };

  const toggleTag = (tag: string) => {
    const newSelected = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
      
    setSelectedTags(newSelected);
    onTagsGenerated(newSelected);
  };

  const applyAllSuggestions = () => {
    const allTags = Array.from(new Set([...selectedTags, ...suggestions.map(s => s.tag)]));
    setSelectedTags(allTags);
    onTagsGenerated(allTags);
  };

  const clearAllTags = () => {
    setSelectedTags([]);
    onTagsGenerated([]);
  };

  const getCategoryColor = (category: TagSuggestion['category']) => {
    switch (category) {
      case 'style': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'color': return 'bg-green-100 text-green-800 border-green-200';
      case 'composition': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mood': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'subject': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    if (imageUrl && !suggestions.length) {
      generateTags();
    }
  }, [imageUrl]);

  return (
    <Card className={`border-swiss-black ${className}`}>
      <CardHeader className="border-b border-swiss-black">
        <CardTitle className="flex items-center space-x-2 font-mono text-sm uppercase tracking-wide">
          <Brain className="w-4 h-4" />
          <span>AI Auto-Tagging</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Generate Button */}
        <div className="flex space-x-2">
          <Button
            onClick={generateTags}
            disabled={isGenerating || !imageUrl}
            size="sm"
            className="font-mono"
          >
            {isGenerating ? (
              <>
                <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Tags
              </>
            )}
          </Button>
          
          {suggestions.length > 0 && (
            <>
              <Button
                onClick={applyAllSuggestions}
                variant="outline"
                size="sm"
                className="font-mono border-swiss-black"
              >
                Apply All
              </Button>
              <Button
                onClick={clearAllTags}
                variant="outline"
                size="sm"
                className="font-mono border-swiss-black text-red-600 hover:text-red-700"
              >
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-xs font-mono border border-red-200 p-2 bg-red-50">
            {error}
          </div>
        )}

        {/* Tag Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-mono uppercase tracking-wide text-swiss-black flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              Suggestions
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {suggestions
                .sort((a, b) => b.confidence - a.confidence)
                .map((suggestion, index) => (
                <Badge
                  key={index}
                  variant={selectedTags.includes(suggestion.tag) ? "default" : "outline"}
                  className={`cursor-pointer font-mono transition-all ${
                    selectedTags.includes(suggestion.tag)
                      ? 'bg-swiss-black text-swiss-white'
                      : getCategoryColor(suggestion.category)
                  }`}
                  onClick={() => toggleTag(suggestion.tag)}
                >
                  {suggestion.tag}
                  <span className="ml-1 text-xs opacity-70">
                    {Math.round(suggestion.confidence * 100)}%
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-mono uppercase tracking-wide text-swiss-black">
              Selected ({selectedTags.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => (
                <Badge
                  key={index}
                  className="bg-swiss-black text-swiss-white font-mono cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {suggestions.length > 0 && (
          <div className="text-xs font-mono text-swiss-gray-600 border-t border-swiss-gray-200 pt-2">
            Generated {suggestions.length} suggestions • {selectedTags.length} selected
          </div>
        )}
      </CardContent>
    </Card>
  );
}