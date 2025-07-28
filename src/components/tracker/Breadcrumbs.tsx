import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          <button
            onClick={item.onClick}
            disabled={item.isActive || !item.onClick}
            className={`transition-colors ${
              item.isActive 
                ? 'text-foreground font-medium' 
                : 'text-muted-foreground hover:text-foreground'
            } ${!item.onClick || item.isActive ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;