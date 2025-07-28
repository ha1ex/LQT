import React from 'react';
import { TrendingUp, TrendingDown, Lightbulb, Star } from 'lucide-react';

interface Insight {
  type: 'improvement' | 'decline' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  metric?: string;
  change?: number;
}

interface WeeklyInsightsProps {
  insights: Insight[];
}

const WeeklyInsights: React.FC<WeeklyInsightsProps> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-5 h-5 text-success" />;
      case 'decline': return <TrendingDown className="w-5 h-5 text-error" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-warning" />;
      case 'achievement': return <Star className="w-5 h-5 text-primary" />;
      default: return <Lightbulb className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'improvement': return 'bg-success/5 border-success/20';
      case 'decline': return 'bg-error/5 border-error/20';
      case 'recommendation': return 'bg-warning/5 border-warning/20';
      case 'achievement': return 'bg-primary/5 border-primary/20';
      default: return 'bg-muted/5 border-border';
    }
  };

  if (insights.length === 0) return null;

  return (
    <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Недельные инсайты</h3>
      </div>
      
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-2xl border ${getInsightBg(insight.type)} transition-all duration-200 hover:shadow-medium`}
          >
            <div className="flex items-start gap-3">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                {insight.change && (
                  <div className="flex items-center gap-1 mt-2 text-xs">
                    <span className="font-medium">{insight.metric}:</span>
                    <span className={insight.change > 0 ? 'text-success' : 'text-error'}>
                      {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyInsights;