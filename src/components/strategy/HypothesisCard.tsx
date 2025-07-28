import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Users, Target } from 'lucide-react';
import { EnhancedHypothesis, ValidationStatus } from '@/types/strategy';
import { useSubjects } from '@/hooks/strategy';
import { getPriorityCategory, getProgressColor } from '@/utils/strategy';

interface HypothesisCardProps {
  hypothesis: EnhancedHypothesis;
  priority: number;
  onView: () => void;
}

export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  hypothesis,
  priority,
  onView
}) => {
  const { getSubjectsByIds } = useSubjects();
  const subjects = getSubjectsByIds(hypothesis.subjects);
  const priorityCategory = getPriorityCategory(hypothesis.calculatedPriority);
  const progressColor = getProgressColor(hypothesis.progress);

  return (
    <Card 
      className="relative cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden border-l-4 border-l-primary/30 hover:border-l-primary"
      onClick={onView}
    >
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative">
        {/* Header with Priority and Validation */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Priority Badge */}
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300"
              style={{ background: priorityCategory.gradient }}
            >
              #{priority}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  {hypothesis.goal.metricId}
                </Badge>
                
                {hypothesis.validationStatus === ValidationStatus.VALIDATED ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              
              <p className="text-xs text-muted-foreground mt-1">
                Приоритет: {priorityCategory.label} ({hypothesis.calculatedPriority.toFixed(2)})
              </p>
            </div>
          </div>
          
          {/* Progress Percentage */}
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {hypothesis.progress}%
            </div>
            <p className="text-xs text-muted-foreground">прогресс</p>
          </div>
        </div>

        {/* Goal Description */}
        <div className="mb-4">
          <h3 className="font-semibold text-foreground mb-3 line-clamp-2 text-lg group-hover:text-primary transition-colors">
            {hypothesis.goal.description}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Цель:</span>
              <span className="font-medium text-foreground">
                {hypothesis.goal.currentValue}/10 → {hypothesis.goal.targetValue}/10
              </span>
            </div>
          </div>
        </div>

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Субъекты:</span>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {subjects.slice(0, 3).map((subject) => (
                <Badge 
                  key={subject.id} 
                  variant="secondary" 
                  className="text-xs"
                >
                  {subject.name}
                </Badge>
              ))}
              {subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{subjects.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Hypothesis Preview */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">ЕСЛИ:</p>
          <p className="text-sm text-foreground line-clamp-2">
            {hypothesis.conditions}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Выполнение</span>
            <span className="text-foreground font-semibold">
              {hypothesis.weeklyProgress?.length || 0} недель
            </span>
          </div>
          
            <div className="relative">
              <Progress 
                value={hypothesis.progress} 
                className="h-3"
              />
            </div>
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm mt-6 pt-4 border-t border-border">
          <span className="text-muted-foreground">
            {hypothesis.weeklyProgress?.filter(w => w.rating > 0).length || 0}/{hypothesis.weeklyProgress?.length || 0} недель оценено
          </span>
          <span className="text-primary font-medium group-hover:text-secondary transition-colors flex items-center gap-1">
            Подробнее 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};