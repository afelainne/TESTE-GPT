"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  console.log('SidebarToggle rendered with isCollapsed:', isCollapsed);

  return (
    <button
      onClick={onToggle}
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-50 w-5 h-10 bg-swiss-white/90 border border-swiss-gray-300 backdrop-blur-sm transition-all duration-300 ease-in-out flex items-center justify-center group hover:bg-swiss-white hover:border-swiss-black",
        isCollapsed 
          ? "left-0 border-l-0 rounded-r-[2px]" 
          : "left-88 -translate-x-px rounded-l-[2px] border-r-0"
      )}
      aria-label={isCollapsed ? "Abrir menu lateral" : "Fechar menu lateral"}
    >
      <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-swiss-gray-600 group-hover:text-swiss-black" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-swiss-gray-600 group-hover:text-swiss-black" />
        )}
      </div>
    </button>
  );
}