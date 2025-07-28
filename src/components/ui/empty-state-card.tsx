import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ""
}) => {
  return (
    <Card className={`text-center border-2 border-dashed border-border/50 hover:border-primary/30 transition-all duration-300 ${className}`}>
      <CardHeader className="pb-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-muted-foreground mb-6">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};