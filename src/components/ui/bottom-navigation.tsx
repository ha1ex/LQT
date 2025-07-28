import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface BottomNavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive?: boolean;
  onClick: () => void;
}

interface BottomNavigationProps {
  items: BottomNavigationItem[];
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  items,
  className
}) => {
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border",
      "flex items-center justify-around px-1 py-2 h-20 safe-area-pb",
      "md:hidden", // Only show on mobile
      className
    )}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 min-w-0 flex-1",
              "text-xs font-medium min-h-touch-target active:scale-95",
              item.isActive
                ? "text-primary bg-primary/15 scale-105 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
            )}
          >
            <Icon className={cn(
              "h-6 w-6 mb-1 transition-all duration-200",
              item.isActive ? "scale-110" : ""
            )} />
            <span className={cn(
              "truncate transition-all duration-200",
              item.isActive ? "font-semibold" : ""
            )}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};