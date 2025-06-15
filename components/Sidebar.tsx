"use client";

import { categories } from '@/data/mockData';
import { CategoryObject } from '@/types/inspiration';
import { cn } from '@/lib/utils';

interface SidebarProps {
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  isCollapsed: boolean;
}

export function Sidebar({ selectedCategory, onCategoryChange, isCollapsed }: SidebarProps) {
  console.log('Sidebar rendered with selectedCategory:', selectedCategory, 'collapsed:', isCollapsed);

  return (
    <aside className={cn(
      "min-h-screen bg-swiss-white border-r border-swiss-black transition-all duration-300 ease-in-out overflow-hidden",
      isCollapsed ? "w-0" : "w-88"
    )}>
      <div className={cn(
        "w-88 transition-opacity duration-300",
        isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        {/* Categories Section */}
        <div className="grid-line p-8">
        <div className="mb-8">
          <h2 className="text-sm swiss-mono text-swiss-gray-600 mb-1 tracking-wider">
            CATEGORIES
          </h2>
          <div className="w-12 h-px bg-swiss-black mb-6"></div>
        </div>
        
        <nav className="space-y-0">
          {categories.map((category: CategoryObject, index) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "w-full grid grid-cols-12 items-center py-3 border-b border-swiss-gray-200 swiss-hover group transition-all",
                selectedCategory === category.id && "bg-swiss-gray-100"
              )}
            >
              <div className="col-span-1 text-xs swiss-mono text-swiss-gray-400">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className="col-span-8 text-left">
                <span className={cn(
                  "text-sm swiss-title tracking-wide",
                  selectedCategory === category.id ? "font-medium" : "font-light"
                )}>
                  {category.name}
                </span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-xs swiss-mono text-swiss-gray-500">
                  ∞
                </span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tags Section */}
      <div className="grid-line p-8">
        <div className="mb-6">
          <h3 className="text-sm swiss-mono text-swiss-gray-600 mb-1 tracking-wider">
            POPULAR TAGS
          </h3>
          <div className="w-12 h-px bg-swiss-black mb-4"></div>
        </div>
        
        <div className="space-y-2">
          {['Minimal Design', 'Typography', 'Visual Identity', 'Digital Art', 'Photography', 'Interface', 'Editorial', 'Poster'].map((tag, index) => (
            <div
              key={tag}
              className="swiss-hover cursor-pointer py-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm swiss-body text-swiss-gray-700 group-hover:text-swiss-black">
                  {tag}
                </span>
                <span className="text-xs swiss-mono text-swiss-gray-400">
                  ∞
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid-line p-8 bg-swiss-gray-100">
        <div className="space-y-4">
          <div>
            <h4 className="text-xs swiss-mono text-swiss-gray-600 mb-2 tracking-wider">
              SUBMISSION
            </h4>
            <p className="text-sm swiss-body text-swiss-gray-700 text-justify leading-relaxed">
              Submit your design references to contribute to this curated collection of visual inspiration.
            </p>
          </div>
          <div className="pt-2">
            <button className="text-xs swiss-mono text-swiss-black border-b border-swiss-black pb-0.5 hover:border-swiss-gray-400 transition-colors">
              SUBMIT REFERENCE →
            </button>
          </div>
          </div>
        </div>
      </div>
    </aside>
  );
}