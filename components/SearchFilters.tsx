"use client";

import { useState } from 'react';
import { Search, Filter, Calendar, User, Tag, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: FilterOptions) => void;
  className?: string;
}

interface FilterOptions {
  query: string;
  author: string;
  dateRange: string;
  source: string;
  tags: string[];
  colors: string[];
}

export function SearchFilters({ onSearch, onFilterChange, className = "" }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    query: '',
    author: '',
    dateRange: '',
    source: '',
    tags: [],
    colors: []
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const updatedFilters = { ...filters, query: value };
    setFilters(updatedFilters);
    onSearch(value);
    onFilterChange(updatedFilters);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      query: '',
      author: '',
      dateRange: '',
      source: '',
      tags: [],
      colors: []
    };
    setFilters(clearedFilters);
    setSearchQuery('');
    onFilterChange(clearedFilters);
    onSearch('');
  };

  const commonTags = ['minimal', 'typography', 'color', 'design', 'inspiration', 'layout', 'branding'];
  const sources = ['Arena', 'Instagram', 'Behance', 'Dribbble', 'Pinterest'];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search by title, author, or tags..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-20 font-mono border-swiss-black"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-swiss-gray-600 hover:text-swiss-black font-mono"
        >
          <Filter className="w-4 h-4 mr-1" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card className="border-swiss-black">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Author Filter */}
              <div className="space-y-2">
                <label className="text-sm font-mono uppercase tracking-wide text-swiss-black flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  Author
                </label>
                <Input
                  placeholder="Filter by author..."
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="font-mono border-swiss-black"
                />
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-mono uppercase tracking-wide text-swiss-black flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Date
                </label>
                <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange('dateRange', value)}>
                  <SelectTrigger className="font-mono border-swiss-black">
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source Filter */}
              <div className="space-y-2">
                <label className="text-sm font-mono uppercase tracking-wide text-swiss-black">
                  Source
                </label>
                <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                  <SelectTrigger className="font-mono border-swiss-black">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All sources</SelectItem>
                    {sources.map(source => (
                      <SelectItem key={source} value={source.toLowerCase()}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Clear Filters */}
              <div className="space-y-2">
                <label className="text-sm font-mono uppercase tracking-wide text-swiss-black opacity-0">
                  Clear
                </label>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full font-mono border-swiss-black hover:bg-swiss-gray-100"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="text-sm font-mono uppercase tracking-wide text-swiss-black flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                Popular Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer font-mono ${
                      filters.tags.includes(tag) 
                        ? 'bg-swiss-black text-swiss-white' 
                        : 'border-swiss-black text-swiss-black hover:bg-swiss-gray-100'
                    }`}
                    onClick={() => {
                      const newTags = filters.tags.includes(tag)
                        ? filters.tags.filter(t => t !== tag)
                        : [...filters.tags, tag];
                      handleFilterChange('tags', newTags);
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-3">
              <label className="text-sm font-mono uppercase tracking-wide text-swiss-black flex items-center">
                <Palette className="w-4 h-4 mr-1" />
                Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      filters.colors.includes(color)
                        ? 'border-swiss-black ring-2 ring-swiss-black ring-offset-2'
                        : 'border-swiss-gray-300 hover:border-swiss-black'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      const newColors = filters.colors.includes(color)
                        ? filters.colors.filter(c => c !== color)
                        : [...filters.colors, color];
                      handleFilterChange('colors', newColors);
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {(filters.tags.length > 0 || filters.colors.length > 0 || filters.author || filters.source || filters.dateRange) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-mono text-swiss-gray-600">Active filters:</span>
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="font-mono">
              {tag}
              <button
                onClick={() => handleFilterChange('tags', filters.tags.filter(t => t !== tag))}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          ))}
          {filters.colors.map(color => (
            <div key={color} className="flex items-center gap-1">
              <div
                className="w-4 h-4 rounded border border-swiss-black"
                style={{ backgroundColor: color }}
              />
              <button
                onClick={() => handleFilterChange('colors', filters.colors.filter(c => c !== color))}
                className="text-sm hover:text-red-500"
              >
                ×
              </button>
            </div>
          ))}
          {filters.author && (
            <Badge variant="secondary" className="font-mono">
              Author: {filters.author}
              <button
                onClick={() => handleFilterChange('author', '')}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.source && (
            <Badge variant="secondary" className="font-mono">
              Source: {filters.source}
              <button
                onClick={() => handleFilterChange('source', '')}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
          {filters.dateRange && (
            <Badge variant="secondary" className="font-mono">
              Date: {filters.dateRange}
              <button
                onClick={() => handleFilterChange('dateRange', '')}
                className="ml-1 hover:text-red-500"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}