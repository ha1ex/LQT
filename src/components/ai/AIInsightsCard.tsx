import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIInsight } from '@/types/ai';
import { Brain, Target, TrendingUp, Lightbulb, BarChart3, ExternalLink } from 'lucide-react';

interface AIInsightsCardProps {
  insight: AIInsight;
  onActionClick?: (insight: AIInsight) => void;
}

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'focus_area':
      return Target;
    case 'goal_suggestion':
      return TrendingUp;
    case 'hypothesis_improvement':
      return Lightbulb;
    case 'pattern':
      return BarChart3;
    default:
      return Brain;
  }
};

const getInsightColor = (type: AIInsight['type']) => {
  switch (type) {
    case 'focus_area':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'goal_suggestion':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'hypothesis_improvement':
      return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
    case 'pattern':
      return 'bg-accent/50 text-accent-foreground border-accent';
    default:
      return 'bg-muted/50 text-muted-foreground border-muted';
  }
};

const getTypeLabel = (type: AIInsight['type']) => {
  switch (type) {
    case 'focus_area':
      return 'Область фокуса';
    case 'goal_suggestion':
      return 'Предложение цели';
    case 'hypothesis_improvement':
      return 'Улучшение гипотезы';
    case 'pattern':
      return 'Выявленный паттерн';
    default:
      return 'AI рекомендация';
  }
};

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({ insight, onActionClick }) => {
  const Icon = getInsightIcon(insight.type);
  const confidencePercentage = Math.round(insight.confidence * 100);

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group">
      {/* Полоска уверенности AI */}
      <div 
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-destructive via-amber-400 to-primary transition-all duration-500"
        style={{ width: `${confidencePercentage}%` }}
      />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <Badge variant="outline" className={getInsightColor(insight.type)}>
              {getTypeLabel(insight.type)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Уверенность: {confidencePercentage}%
          </div>
        </div>
        <CardTitle className="text-base leading-tight">{insight.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <CardDescription className="text-sm leading-relaxed">
          {insight.description}
        </CardDescription>
        
        {insight.action && (
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 transition-colors group-hover:bg-primary/10">
            <p className="text-sm font-medium text-primary mb-1">Рекомендуемое действие:</p>
            <p className="text-sm">{insight.action}</p>
          </div>
        )}
        
        {onActionClick && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onActionClick(insight)}
            className="w-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground group-hover:scale-[1.02]"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Применить рекомендацию
          </Button>
        )}
        
        <div className="text-xs text-muted-foreground">
          {new Date(insight.createdAt).toLocaleString('ru-RU')}
        </div>
      </CardContent>
    </Card>
  );
};