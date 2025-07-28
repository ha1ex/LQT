import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Sheet, SheetContent, SheetTrigger } from './sheet';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title: string;
  onSearch?: (query: string) => void;
  children?: React.ReactNode; // Sidebar content
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onSearch,
  children,
  className
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border",
      "flex items-center justify-between px-4 h-14",
      className
    )}>
      {/* Mobile Menu Button */}
      <div className="flex items-center gap-2">
        {children && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              {children}
            </SheetContent>
          </Sheet>
        )}
        
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center gap-2">
        {onSearch && (
          <div className="hidden sm:block">
            <Input
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-48"
            />
          </div>
        )}
        
        {onSearch && (
          <Button variant="ghost" size="sm" className="sm:hidden">
            <Search className="h-4 w-4" />
          </Button>
        )}
        
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};